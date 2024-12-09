import Chat from "../models/chatModel.js";
import userModel from "../models/userModel.js";
export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user._id }).populate(
      "users messages.sender",
      "name email"
    );
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: "Error fetching chats" });
  }
};

export const createChat = async (req, res) => {
  const { userId, message } = req.body; // 'userId' is the recipient (Person B)

  try {
    // Check if both users exist
    const user1 = await userModel.findById(req.user._id); // Person A (logged-in user)
    const user2 = await userModel.findById(userId); // Person B (the other user)

    if (!user1 || !user2) {
      return res.status(400).json({ error: "One or both users do not exist" });
    }

    // Check if a chat already exists between Person A and Person B
    let chat = await Chat.findOne({
      users: { $all: [req.user._id, userId] }, // Match both users
    });

    // If chat exists, push new message(s)
    if (chat) {
      chat.messages.push({
        sender: req.user._id,
        message: message, // Add the new message from Person A
      });
      await chat.save();
    } else {
     
      chat = await Chat.create({
        users: [req.user._id, userId],
        messages: [
          {
            sender: req.user._id,
            message: message, // Initialize with the first message from Person A
          },
        ],
      });
    }

    res.json(chat);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creating or updating chat" });
  }
};
