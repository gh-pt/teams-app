import prisma from "@/lib/prisma";
import { chatSchema } from "@/lib/schemas/chatSchema";
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/types/api";

// Create a chat
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const validated = chatSchema.safeParse(body);

//     if (!validated.success) {
//       return errorResponse("Invalid data", 400, validated.error.issues);
//     }

//     const { participants, message, groupName, groupAvatar } = validated.data;

//     // Determine chat type based on participants length
//     const chatType = participants.length > 2 ? "GROUP" : "PRIVATE";

//     let chat = await prisma.chat.findFirst({
//       where: {
//         AND: [
//           {
//             participants: {
//               every: {
//                 userId: {
//                   in: participants,
//                 },
//               },
//             },
//           },
//           {
//             participants: {
//               none: {
//                 userId: {
//                   notIn: participants,
//                 },
//               },
//             },
//           },
//         ],
//         chatType,
//       },
//       include: {
//         messages: {
//           orderBy: {
//             createdAt: "desc",
//           },
//           take: 1,
//         },
//         participants: {
//           include: {
//             user: {
//               select: {
//                 id: true,
//                 userName: true,
//                 email: true,
//                 avatar: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     if (chat) {
//       // Update existing chat with new message
//       chat = await prisma.chat.update({
//         where: { id: chat.id },
//         data: {
//           messages: {
//             create: {
//               senderId: participants[0],
//               content: message,
//               contentType: "TEXT",
//             },
//           },
//           updatedAt: new Date(),
//         },
//         include: {
//           messages: {
//             orderBy: {
//               createdAt: "desc",
//             },
//             take: 1,
//           },
//           participants: {
//             include: {
//               user: {
//                 select: {
//                   id: true,
//                   userName: true,
//                   email: true,
//                   avatar: true,
//                 },
//               },
//             },
//           },
//         },
//       });

//       return successResponse(chat, 200, "Message sent successfully");
//     } else {
//       // Create new chat with participants and first message
//       chat = await prisma.chat.create({
//         data: {
//           chatType,
//           groupName: chatType === "GROUP" ? groupName : null,
//           groupAvatar: chatType === "GROUP" ? groupAvatar : null,
//           participants: {
//             create: participants.map((userId) => ({
//               userId,
//             })),
//           },
//           messages: {
//             create: {
//               senderId: participants[0],
//               content: message,
//               contentType: "TEXT",
//             },
//           },
//         },
//         include: {
//           messages: {
//             orderBy: {
//               createdAt: "desc",
//             },
//             take: 1,
//           },
//           participants: {
//             include: {
//               user: {
//                 select: {
//                   id: true,
//                   userName: true,
//                   email: true,
//                   avatar: true,
//                 },
//               },
//             },
//           },
//         },
//       });

//       return successResponse(chat, 201, "Chat created successfully");
//     }
//   } catch (error) {
//     console.error("Error creating or updating chat:", error);
//     return errorResponse(
//       error instanceof Error ? error.message : "Unknown error",
//       500
//     );
//   }
// }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = chatSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse("Invalid data", 400, validated.error.issues);
    }

    const { participants, groupName, groupAvatar } = validated.data;

    const chatType = participants.length > 2 ? "GROUP" : "PRIVATE";

    if (chatType === "PRIVATE") {
      const existingChat = await prisma.chat.findFirst({
        where: {
          participants: {
            every: {
              userId: {
                in: participants,
              },
            },
          },
        },
        include: {
          participants: {
            select: {
              joinedAt: true,
              chatId: true,
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

      if (existingChat) {
        return successResponse(existingChat, 200, "Chat already exists");
      }
    }

    const newChat = await prisma.chat.create({
      data: {
        chatType,
        groupName: chatType === "GROUP" ? groupName : null,
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

    return successResponse(newChat, 201, "Chat created successfully");
  } catch (error) {
    console.error("Error creating chat:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
