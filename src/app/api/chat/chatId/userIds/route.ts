import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/types/api";

// Get all messages for a chat
export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string; userIds: string } }
) {
  try {
    const { chatId, userIds } = params;

    if (!chatId || !userIds) {
      return errorResponse("chatId and userId are required", 400);
    }

    const chatParticipant = await prisma.chatParticipant.findFirst({
      where: {
        chatId,
        userId: userIds,
      },
    });

    if (!chatParticipant) {
      return errorResponse("User is not a participant of this chat", 403);
    }

    const messages = await prisma.message.findMany({
      where: {
        chatId,
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
      orderBy: {
        createdAt: "asc",
      },
    });

    return successResponse(messages, 200, `Found ${messages.length} messages`);
  } catch (error) {
    console.error("Error getting messages:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
