import express from "express";
import { getUserChats, createChat } from "../controllers/chatController.js";
import { authMiddlewares } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.get("/", authMiddlewares, getUserChats); // Get all chats for logged-in user
router.post("/", authMiddlewares, createChat); // Create a new chat

export default router;
