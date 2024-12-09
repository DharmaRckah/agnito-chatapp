
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import { sendMessage, receiveMessage } from "../services/socket";

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const { accessToken, user } = useSelector((state) => ({
    accessToken: state.auth.accessToken,
    user: state.auth.user,
  }));

  // Fetch the list of all users (excluding the logged-in user)
  useEffect(() => {
    if (accessToken) {
      const fetchUsers = async () => {
        try {
          const response = await axios.get(
            "http://localhost:5000/api/v1/users/allUsers",
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          const fetchedUsers = response.data.users || [];
          const filteredUsers = fetchedUsers.filter((u) => u._id !== user._id);
          setUsers(filteredUsers);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
      fetchUsers();
    }
  }, [accessToken, user._id]);

  // Fetch chats and filter messages between logged-in user and selected user
  const fetchChat = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/users/userChats",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      // Find chat that includes both users
      const userChats = response.data;
      const chat = userChats.find((chat) =>
        chat.users.some((u) => u._id === selectedUser._id)
      );

      // If a chat exists, set messages from that chat
      if (chat) {
        setMessages(chat.messages || []);
      } else {
        setMessages([]); // Clear messages if no chat is found
      }
    } catch (error) {
      console.error("Error fetching chat:", error);
    }
  };

  // Listen for incoming messages via socket
  useEffect(() => {
    receiveMessage((newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });
  }, []);

  const handleUserSelection = (user) => {
    setSelectedUser(user);
    fetchChat(); // Fetch chat for selected user
  };

  const handleSendMessage = () => {
    if (selectedUser && message) {
      sendMessage(selectedUser._id, message);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: { _id: user._id, name: user.name }, message },
      ]);
      setMessage("");
    }
  };

  return (
    <div className="p-6">
      <div className="flex space-x-4">
        <div className="w-1/3">
          <h2 className="text-xl mb-4">User Profile: {user.name}</h2>
          <List
            dense
            sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
          >
            {users.map((user) => (
              <ListItem key={user._id} disablePadding>
                <ListItemButton onClick={() => handleUserSelection(user)}>
                  <ListItemAvatar>
                    <Avatar
                      alt={user.name}
                      src={`/static/images/avatar/${user._id}.jpg`}
                    />
                  </ListItemAvatar>
                  <ListItemText primary={user.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </div>
        <div className="w-2/3">
          {selectedUser ? (
            <div>
              <h2 className="text-xl mb-4">Chat with {selectedUser.name}</h2>
              <div className="border p-4 h-64 overflow-y-scroll mb-4">
                {messages.map((msg, index) => (
                  <div
                    key={msg._id} // Use message ID for key
                    className={`mb-2 ${
                      msg.sender._id === user._id ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={
                        msg.sender._id === user._id
                          ? "text-blue-500"
                          : "text-black"
                      }
                    >
                      <strong>{msg.sender.name}:</strong> {msg.message}
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
                />
                <button
                  className="bg-blue-500 text-white p-2"
                  onClick={handleSendMessage}
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <p>Select a user to start chatting</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
