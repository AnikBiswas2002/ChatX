import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// userSocketMap: { userId: socketId }
const userSocketMap = {}; // ✅ Declare this FIRST

// ✅ Now safely define this function
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    console.log(`User ${userId} connected: ${socket.id}`);
    userSocketMap[userId] = socket.id;

    // Broadcast current online users
    io.emit("onlineUsers", Object.keys(userSocketMap));
  }

  socket.on("disconnect", () => {
    const disconnectedUserId = Object.keys(userSocketMap).find(
      (key) => userSocketMap[key] === socket.id
    );

    if (disconnectedUserId) {
      console.log(`User ${disconnectedUserId} disconnected`);
      delete userSocketMap[disconnectedUserId];
      io.emit("onlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { app, server, io };
