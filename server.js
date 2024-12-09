import express from "express";
import http from "http";
import { Server } from "socket.io";

import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cors from "cors";
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.use(cors({ origin: "*" }));
app.use(express.json());

// MongoDB connection
import connectDb from "./config/db.js"
connectDb()

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/chats", chatRoutes);
app.use("/api/v1/users", userRoutes);

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  // Join room for private messaging
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
  });

  // Handle sending messages
  socket.on("sendMessage", ({ roomId, message }) => {
    io.to(roomId).emit("newMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
