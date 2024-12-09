import express from "express";

import { authMiddlewares } from "../middlewares/authMiddlewares.js";
import { getUserChats } from "../controllers/chatController.js";
import { getAlluserController } from "../controllers/userController.js";

const router = express.Router();

router.get("/userChats", authMiddlewares, getUserChats); // Get all users
router.get("/allUsers", authMiddlewares, getAlluserController);
export default router;
