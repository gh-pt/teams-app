"use server";

import { Chat } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { ActionResult } from "@/types";

export async function searchChats(
  data: string[]
): Promise<ActionResult<Chat[]>> {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        AND: [
          // 1️⃣ Chat must contain ALL users
          ...data.map((userId) => ({
            participants: {
              some: {
                userId,
              },
            },
          })),
          // 2️⃣ Chat must NOT contain extra users
          {
            participants: {
              every: {
                userId: {
                  in: data,
                },
              },
            },
          },
        ],
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

    return { status: "success", data: chats };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
