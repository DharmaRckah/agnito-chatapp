import { io } from "socket.io-client";

let socket;

// Connect to the socket with the provided token
export const connectSocket = (accessToken) => {
  // Only connect if socket is not already connected
  if (!socket || !socket.connected) {
    socket = io("http://localhost:5000", {
      auth: { token: accessToken },
    });

    // Handle connection errors
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });
  }
};

// Disconnect the socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

// Send a message to a specific chat
export const sendMessage = (chatId, message) => {
  if (socket && socket.connected) {
    socket.emit("sendMessage", { chatId, message });
  }
};

// Listen for incoming messages
export const receiveMessage = (callback) => {
  if (socket) {
    socket.on("receiveMessage", callback);
  }
};

// Remove the listener for incoming messages
export const removeReceiveMessageListener = () => {
  if (socket) {
    socket.off("receiveMessage");
  }
};
