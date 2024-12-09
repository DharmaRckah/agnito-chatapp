
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import toast, { Toaster } from "react-hot-toast";

// Initialize Socket.IO connection (ensure this URL matches your backend)
const socket = io("http://localhost:5050");

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user"));

  // Redirect to login if no token
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // Fetch users excluding the current user
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/v1/users/allUsers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const filteredUsers = response.data.users.filter((u) => u._id !== user._id);
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users.");
      }
    };
    fetchUsers();
  }, [token, user._id]);

  // Fetch chat messages for the selected user
  const fetchChat = async (selectedUserId) => {
    try {
      const response = await axios.get("/api/v1/users/userChats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const chat = response.data.find((chat) => chat.users.some((u) => u._id === selectedUserId));
      setMessages(
        (chat?.messages || []).map((msg) => ({
          ...msg,
          sender: msg.sender || { name: "Unknown", _id: "unknown" },
        }))
      );
    } catch (error) {
      console.error("Error fetching chat:", error);
      toast.error("Failed to fetch chat.");
    }
  };

  // Handle selecting a user
  const handleUserSelection = (user) => {
    setSelectedUser(user);
    fetchChat(user._id);
    socket.emit("joinRoom", user._id); // Join the selected user's room
  };

  // Listen for real-time messages
  useEffect(() => {
    const handleNewMessage = (message) => {
      // Only update the chat for clients that aren't the sender
      if (message.sender._id !== user._id) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    };

    socket.on("newMessage", handleNewMessage);

    // Cleanup listener on component unmount or when selectedUser changes
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [selectedUser, user._id]);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!selectedUser || !message) {
      toast.error("Please select a user and enter a message.");
      return;
    }

    const roomId = selectedUser._id; // Room ID is the selected user's ID
    const messageData = {
      roomId,
      message,
      sender: { _id: user._id, name: user.name },
    };

    try {
      // Save message to backend
      await axios.post(
        "/api/v1/chats",
        { userId: selectedUser._id, message },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Emit message to Socket.IO
      socket.emit("sendMessage", messageData); // Send message to the server

      // Optimistically update messages
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setMessage(""); // Clear input after sending
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex space-x-4">
        {/* Users List */}
        <div className="w-1/3">
          <h2 className="text-xl mb-4">User Profile: {user?.name || "Unknown"}</h2>
          <List dense sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
            {users.map((u) => (
              <ListItem key={u._id} disablePadding>
                <ListItemButton onClick={() => handleUserSelection(u)}>
                  <ListItemAvatar>
                    <Avatar alt={u.name} src={`/static/images/avatar/${u._id}.jpg`} />
                  </ListItemAvatar>
                  <ListItemText primary={u.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </div>

        {/* Chat Window */}
        <div className="w-2/3">
          {selectedUser ? (
            <div>
              <h2 className="text-xl mb-4">Chat with {selectedUser.name}</h2>
              <div className="border p-4 h-64 overflow-y-scroll mb-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-2 ${msg.sender?._id === user._id ? "text-right" : "text-left"}`}
                  >
                    <div className={msg.sender?._id === user._id ? "text-blue-500" : "text-black"}>
                      <strong>{msg.sender?.name || "Unknown"}:</strong> {msg.message}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex space-x-4">
                <input
                  type="text"
                  className="border p-2 w-full"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button className="bg-blue-500 text-white p-2" onClick={handleSendMessage}>
                  Send
                </button>
              </div>
            </div>
          ) : (
            <p>Select a user to start chatting</p>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default UserDashboard;
