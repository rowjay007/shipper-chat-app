import { prisma } from "@/lib/prisma";
import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";

export type SocketServer = SocketIOServer;

export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("user:online", async (userId: string) => {
      await prisma.user.update({
        where: { id: userId },
        data: { onlineStatus: true, lastSeen: new Date() },
      });

      socket.join(`user:${userId}`);
      io.emit("user:status", { userId, isOnline: true });
    });

    socket.on("user:offline", async (userId: string) => {
      await prisma.user.update({
        where: { id: userId },
        data: { onlineStatus: false, lastSeen: new Date() },
      });

      io.emit("user:status", { userId, isOnline: false });
    });

    socket.on("chat:join", (chatRoomId: string) => {
      socket.join(`chat:${chatRoomId}`);
    });

    socket.on("chat:leave", (chatRoomId: string) => {
      socket.leave(`chat:${chatRoomId}`);
    });

    socket.on(
      "message:send",
      async (data: {
        chatRoomId: string;
        senderId: string;
        content: string;
      }) => {
        const message = await prisma.message.create({
          data: {
            chatRoomId: data.chatRoomId,
            senderId: data.senderId,
            content: data.content,
          },
          include: {
            sender: true,
          },
        });

        io.to(`chat:${data.chatRoomId}`).emit("message:new", message);
      }
    );

    socket.on(
      "typing:start",
      (data: { chatRoomId: string; userId: string }) => {
        socket.to(`chat:${data.chatRoomId}`).emit("typing:start", data);
      }
    );

    socket.on("typing:stop", (data: { chatRoomId: string; userId: string }) => {
      socket.to(`chat:${data.chatRoomId}`).emit("typing:stop", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}
