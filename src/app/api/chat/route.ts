import prisma from "@/lib/prisma";
import { chatSchema } from "@/lib/schemas/chatSchema";
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/types/api";

// Create a chat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = chatSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse("Invalid data", 400, validated.error.issues);
    }

    const { participants, groupName, groupAvatar } = validated.data;

    const chatType = participants.length > 2 ? "GROUP" : "PRIVATE";

    const existingChat = await prisma.chat.findFirst({
      where: {
        AND: [
          ...participants.map((userId) => ({
            participants: {
              some: {
                userId,
              },
            },
          })),
          {
            participants: {
              every: {
                userId: {
                  in: participants,
                },
              },
            },
          },
        ],
      },
      include: {
        participants: {
          select: {
            joinedAt: true,
            chatId: true,
            userId: true,
            user: {
              select: {
                id: true,
                userName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        messages: true,
      },
    });

    if (existingChat && global.io) {
      existingChat.participants.forEach((p) => {
        global.io!.to(`user:${p.userId}`).emit("chat-created", existingChat);
      });
    }

    if (existingChat) {
      return successResponse(existingChat, 200, "Chat already exists");
    }

    let resolvedGroupName: string | null = null;

    if (chatType === "GROUP") {
      if (groupName && groupName.trim().length > 0) {
        resolvedGroupName = groupName;
      } else {
        const users = await prisma.user.findMany({
          where: {
            id: {
              in: participants,
            },
          },
          select: {
            userName: true,
          },
        });

        resolvedGroupName = users.map((u) => u.userName).join(", ");
      }
    }

    const newChat = await prisma.chat.create({
      data: {
        chatType,
        groupName: chatType === "GROUP" ? resolvedGroupName : null,
        groupAvatar: chatType === "GROUP" ? groupAvatar : null,
        participants: {
          create: participants.map((participantId) => ({
            userId: participantId,
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                userName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        messages: true,
      },
    });

    if (global.io) {
      newChat.participants.forEach((p) => {
        global.io!.to(`user:${p.userId}`).emit("chat-created", newChat);
      });
    }

    return successResponse(newChat, 201, "Chat created successfully");
  } catch (error) {
    console.error("Error creating chat:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
