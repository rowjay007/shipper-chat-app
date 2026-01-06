const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const dev = process.env.NODE_ENV !== "production";
const hostname = dev ? "localhost" : "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    "https://shipper-chat-app-p2xb.onrender.com",
    "http://localhost:3000",
  ].filter(Boolean);

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("user:online", async (userId) => {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { onlineStatus: true, lastSeen: new Date() },
        });

        socket.join(`user:${userId}`);
        io.emit("user:status", { userId, isOnline: true });
      } catch (error) {
        console.error("Error updating user online status:", error);
      }
    });

    socket.on("user:offline", async (userId) => {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { onlineStatus: false, lastSeen: new Date() },
        });

        io.emit("user:status", { userId, isOnline: false });
      } catch (error) {
        console.error("Error updating user offline status:", error);
      }
    });

    socket.on("chat:join", (chatRoomId) => {
      socket.join(`chat:${chatRoomId}`);
      console.log(`Socket ${socket.id} joined chat:${chatRoomId}`);
    });

    socket.on("chat:leave", (chatRoomId) => {
      socket.leave(`chat:${chatRoomId}`);
      console.log(`Socket ${socket.id} left chat:${chatRoomId}`);
    });

    socket.on("message:send", async (data) => {
      try {
        const message = await prisma.message.create({
          data: {
            roomId: data.chatRoomId,
            senderId: data.senderId,
            content: data.content,
          },
          include: {
            sender: true,
          },
        });

        await prisma.chatRoom.update({
          where: { id: data.chatRoomId },
          data: { updatedAt: new Date(), lastMessageAt: new Date() },
        });

        io.to(`chat:${data.chatRoomId}`).emit("message:new", message);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("message:error", { error: "Failed to send message" });
      }
    });

    socket.on("typing:start", (data) => {
      socket.to(`chat:${data.chatRoomId}`).emit("typing:start", data);
    });

    socket.on("typing:stop", (data) => {
      socket.to(`chat:${data.chatRoomId}`).emit("typing:stop", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
