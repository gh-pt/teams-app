"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { ActionResult } from "@/types";

interface UserData {
  id: string;
  userName: string;
  email: string;
  avatar: string | null;
}

// Get all users
export async function getUsers(): Promise<ActionResult<UserData[]>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        status: "error",
        error: "Unauthorized",
      };
    }

    const users = await prisma.user.findMany({
      where: {
        id: {
          not: session.user.id,
        },
      },
      orderBy: {
        userName: "asc",
      },
    });

    return {
      status: "success",
      data: users,
    };
  } catch (error) {
    console.error("Error getting users:", error);
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Search users by query
export async function searchUsers(
  query: string
): Promise<ActionResult<UserData[]>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        status: "error",
        error: "Unauthorized",
      };
    }

    if (!query || query.trim().length === 0) {
      return {
        status: "success",
        data: [],
      };
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: {
              not: session.user.id,
            },
          },
          {
            OR: [
              {
                userName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        userName: true,
        email: true,
        avatar: true,
      },
      take: 20,
      orderBy: {
        userName: "asc",
      },
    });

    return { status: "success", data: users };
  } catch (error) {
    console.error("Error searching users:", error);
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

