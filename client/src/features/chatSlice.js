// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// // Assuming chat API endpoint is /api/chat
// const CHAT_API_URL = "/api/v1/chats";

// export const fetchMessages = createAsyncThunk(
//   "chat/fetchMessages",
//   async (chatId, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${CHAT_API_URL}/${chatId}/messages`);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data || "Failed to fetch messages"
//       );
//     }
//   }
// );

// export const sendMessage = createAsyncThunk(
//   "chat/sendMessage",
//   async ({ chatId, message }, { rejectWithValue }) => {
//     try {
//       const response = await axios.post(`${CHAT_API_URL}`, {
//         userId:chatId,
//         message,
//       });
//       console.log(response)
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || "Failed to send message");
//     }
//   }
// );

// const chatSlice = createSlice({
//   name: "chat",
//   initialState: {
//     messages: [],
//     activeChat: null,
//     loading: false,
//     error: null,
//   },
//   reducers: {
//     setActiveChat: (state, action) => {
//       state.activeChat = action.payload;
//       state.messages = []; // Clear messages when switching chats
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchMessages.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchMessages.fulfilled, (state, action) => {
//         state.loading = false;
//         state.messages = action.payload;
//       })
//       .addCase(fetchMessages.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       .addCase(sendMessage.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(sendMessage.fulfilled, (state, action) => {
//         state.loading = false;
//         state.messages.push(action.payload);
//       })
//       .addCase(sendMessage.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { setActiveChat } = chatSlice.actions;
// export default chatSlice.reducer;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const CHAT_API_URL = "http://localhost:5000/api/v1/chats"; // Correct API URL

// Thunk to fetch messages for a specific chat
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (chatId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${CHAT_API_URL}/${chatId}/messages`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch messages"
      );
    }
  }
);

// Thunk to send a message (data sent in body)
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await axios.post(CHAT_API_URL, messageData); // Send entire message data in body
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send message"
      );
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    activeChat: null,
    loading: false,
    error: null,
  },
  reducers: {
    // Action to set the active chat
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
      state.messages = []; // Clear messages when switching chats
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear previous errors
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear previous errors
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push(action.payload); // Add the new message to the messages array
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setActiveChat } = chatSlice.actions;
export default chatSlice.reducer;
