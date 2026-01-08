import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/types/api";
import { messageSchema } from "@/lib/schemas/messageSchema";

// Create a new message in a chat
export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params;

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
