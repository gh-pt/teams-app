import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/types/api";

interface ChatResponse {
  id: string;
  chatName: string;
  avatar: string | null;
  isGroup: boolean;
  lastMessage: {
    id: string;
    content: string;
    createdAt: Date;
    sender: {
      id: string;
      userName: string;
      avatar: string | null;
    } | null;
  } | null;
  updatedAt: Date;
  participants: {
    id: string;
    userId: string;
    chatId: string;
    joinedAt: Date;
    user: {
      id: string;
      userName: string;
      email: string;
      avatar: string | null;
    } | null;
  }[];
}

// Get all chats for a user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return errorResponse("userId is required", 400);
    }

    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                userName: true,
                avatar: true,
              },
            },
          },
        },
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
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Format the response
    const formattedChats: ChatResponse[] = chats.map((chat) => {
      const isGroup = chat.chatType === "GROUP";
      let chatName: string;
      let avatar: string | null;

      if (isGroup) {
        chatName = chat.groupName || "Group Chat";
        avatar = chat.groupAvatar || null;
      } else {
        const otherParticipant = chat.participants.find(
          (participant) => participant.userId !== userId
        );
        chatName = otherParticipant?.user.userName || "Unknown User";
        avatar = otherParticipant?.user.avatar || null;
      }

      const lastMessage = chat.messages[0];

      return {
        id: chat.id,
        chatName,
        avatar,
        isGroup,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              sender: lastMessage.sender
                ? {
                    id: lastMessage.sender.id,
                    userName: lastMessage.sender.userName,
                    avatar: lastMessage.sender.avatar,
                  }
                : null,
            }
          : null,
        updatedAt: chat.updatedAt,
        participants: chat.participants,
      };
    });

    return successResponse(formattedChats, 200, "Chats retrieved successfully");
  } catch (error) {
    console.error("Error getting chats:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
