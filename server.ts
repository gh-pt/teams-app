import "dotenv/config";
import next from "next";
import { createServer } from "http";
import { Server } from "socket.io";
import { getToken } from "next-auth/jwt";

import prisma from "./src/lib/prisma";

const dev = process.env.NODE_ENV !== "production";

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

  // Socket auth
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

    // Join chat room
    socket.on("join-chat", (chatId: string) => {
      console.log(`User ${socket.data.userId} joined chat: ${chatId}`);
      socket.join(`chat:${chatId}`);
    });

    // Leave chat room
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

        // Check membership
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

        // Save message in DB
        const message = await prisma.message.create({
          data: {
            chatId,
            senderId,
            content,
            contentType: "TEXT",
          },
        });

        // Emit to everyone in the room
        io.to(`chat:${chatId}`).emit("new-message", message);
      } catch (err) {
        console.error("send-message error:", err);
      }
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
