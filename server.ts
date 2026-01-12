import "dotenv/config";
import next from "next";
import { createServer } from "http";
import { Server } from "socket.io";
import { getToken } from "next-auth/jwt";

import prisma from "./src/lib/prisma";

const dev = process.env.NODE_ENV !== "production";

declare global {
  var io: Server | undefined;
}

export {};

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    path: "/socket",
    cors: { origin: "*" },
  });

  global.io = io;

  io.use(async (socket, next) => {
    const token = await getToken({
      req: socket.request as unknown as Request,
      secret: process.env.AUTH_SECRET!,
    });

    if (!token?.sub) {
      return next(new Error("Unauthorized"));
    }

    socket.data.userId = token.sub;
    next();
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.data.userId);

    // Join user
    socket.on("join-user", () => {
      const userId = socket.data.userId;
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined user room`);
    });

    // Join chat
    socket.on("join-chat", (chatId: string) => {
      console.log(`User ${socket.data.userId} joined chat: ${chatId}`);
      socket.join(`chat:${chatId}`);
    });

    // Leave chat
    socket.on("leave-chat", (chatId: string) => {
      if (!chatId) return;

      const room = `chat:${chatId}`;
      socket.leave(room);

      console.log(`User ${socket.data.userId} left ${room}`);
    });

    // Send message
    socket.on("send-message", async ({ chatId, content }) => {
      try {
        const senderId = socket.data.userId;

        if (!chatId || !content?.trim()) return;

        const isMember = await prisma.chatParticipant.findFirst({
          where: {
            chatId,
            userId: senderId,
          },
        });

        if (!isMember) {
          console.warn("User not in chat:", senderId);
          return;
        }

        const message = await prisma.message.create({
          data: {
            chatId,
            senderId,
            content,
            contentType: "TEXT",
          },
          include: {
            chat: {
              include: {
                participants: true,
              },
            },
          },
        });

        await prisma.chatParticipant.updateMany({
          where: {
            chatId,
            userId: { not: senderId },
          },
          data: {
            unreadCount: { increment: 1 },
          },
        });

        io.to(`chat:${chatId}`).emit("new-message", message);

        message.chat.participants
          .filter((p) => p.userId !== senderId)
          .forEach((p) => {
            io.to(`user:${p.userId}`).emit("chat-updated", {
              chatId,
              lastMessage: message,
              incrementUnread: true,
            });
          });
      } catch (err) {
        console.error("send-message error:", err);
      }
    });

    // Mark as read
    socket.on("mark-as-read", async ({ chatId }) => {
      const userId = socket.data.userId;

      await prisma.message.updateMany({
        where: {
          chatId,
          senderId: { not: userId },
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      });

      await prisma.chatParticipant.update({
        where: {
          userId_chatId: {
            userId,
            chatId,
          },
        },
        data: {
          unreadCount: 0,
          lastReadAt: new Date(),
        },
      });

      socket.to(`chat:${chatId}`).emit("messages-read", {
        chatId,
        readerId: userId,
        readAt: new Date().toISOString(),
      });
    });

    // Typing
    socket.on("typing", ({ chatId }) => {
      if (!chatId) return;

      socket.to(`chat:${chatId}`).emit("user-typing", {
        chatId,
        userId: socket.data.userId,
      });
    });

    socket.on("stop-typing", ({ chatId }) => {
      if (!chatId) return;

      socket.to(`chat:${chatId}`).emit("user-stop-typing", {
        chatId,
        userId: socket.data.userId,
      });
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.data.userId);
    });
  });

  httpServer.listen(3000, "0.0.0.0", () => {
    console.log("> Server running on http://localhost:3000");
  });
});
