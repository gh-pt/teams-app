import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/types/api";
import { messageSchema } from "@/lib/schemas/messageSchema";

// Create a new message in a chat
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;

    if (!chatId) {
      return errorResponse("chatId is required", 400);
    }

    const body = await request.json();
    const validated = messageSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse("Invalid message data", 400, validated.error.issues);
    }

    const { senderId, content, contentType, fileUrl } = validated.data;

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return errorResponse("Chat not found", 404);
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        chatId,
        content,
        contentType: contentType || "TEXT",
        fileUrl,
      },
      include: {
        sender: {
          select: {
            userName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return successResponse(message, 201, "Message sent successfully");
  } catch (error) {
    console.error("Error creating message:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}

// Get all messages for a chat
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;

    if (!chatId) {
      return errorResponse("chatId is required", 400);
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            id: true,
            userName: true,
            email: true,
            avatar: true,
          },
        },
        chat: {
          include: {
            participants: {
              select: {
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
          },
        },
      },
    });

    if (messages.length === 0) {
      return successResponse(messages, 200, "No messages found");
    }

    // format messages
    const formattedMessages = messages.map((message) => ({
      id: message.id,
      content: message.content,
      contentType: message.contentType,
      createdAt: message.createdAt,
      senderId: message.senderId,
      sender: {
        id: message.sender.id,
        userName: message.sender.userName,
        email: message.sender.email,
        avatar: message.sender.avatar,
      },
    }));

    return successResponse(
      formattedMessages,
      200,
      `Found ${formattedMessages.length} messages`
    );
  } catch (error) {
    console.error("Error getting messages:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
