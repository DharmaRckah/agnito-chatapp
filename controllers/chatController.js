
import Chat from "../models/chatModel.js";
import userModel from "../models/userModel.js";

export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user._id })
      .populate("users", "name email")
      .populate("messages.sender", "name");
    res.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Error fetching chats" });
  }
};
// Controller to create a new chat or update an existing one
export const createChat = async (req, res) => {
  const { userId, message } = req.body;

  try {
    // Fetch users involved in the chat
    const user1 = await userModel.findById(req.user._id);
    const user2 = await userModel.findById(userId);

    if (!user1 || !user2) {
      return res.status(400).json({ error: "Invalid users" });
    }

    // Check if a chat already exists between the two users
    let chat = await Chat.findOne({
      users: { $all: [req.user._id, userId] },
    });

    // If the chat exists, push the new message to it
    if (chat) {
      chat.messages.push({ sender: req.user._id, message });
      await chat.save();
    } else {
      // If no existing chat, create a new one
      chat = await Chat.create({
        users: [req.user._id, userId],
        messages: [{ sender: req.user._id, message }],
      });
    }

    // Access the io instance
    const io = req.app.get("io"); // Ensure io instance is accessible
    if (io) {
      // Emit the new message to the chat rooms
      const roomIds = chat.users.map(user => user.toString()); // Assuming room ID is based on user IDs
      roomIds.forEach(roomId => {
        io.to(roomId).emit("newMessage", {
          sender: { _id: req.user._id, name: user1.name },
          message,
        });
      });
    } else {
      console.error("Socket.IO instance not found");
    }

    // Respond with the updated chat
    res.json(chat);
  } catch (error) {
    console.error("Error creating or updating chat:", error);
    res.status(500).json({ error: "Error creating or updating chat" });
  }
};
