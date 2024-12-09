
import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";

import connectDb from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors({ origin: "*" }));
app.use(express.json());

// MongoDB connection
connectDb();

// Attach io instance to the app for global access
app.set("io", io);

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/chats", chatRoutes);
app.use("/api/v1/users", userRoutes);

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Join a room
  socket.on("joinRoom", (roomId) => {
    console.log(`Socket ${socket.id} joining room ${roomId}`);
    socket.join(roomId);  // Join the specified room
  });

  // Handle sending messages
  socket.on("sendMessage", ({ roomId, message }) => {
    console.log(`Message sent to room ${roomId}:`, message);

    // Emit the message to all clients connected to the server (including the sender)
    io.emit("newMessage", message);  // This sends the message to **all clients** connected to the server

    // If you want to send it to clients in a specific room, use:
    // io.to(roomId).emit("newMessage", message);  // Only sends to clients in the specified room
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
