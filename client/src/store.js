import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice"; // Assuming you have authSlice in place

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  devTools: true,
});

export default store;
