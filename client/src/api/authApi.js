import axios from "axios";

const API_URL = "/api/v1/auth";

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error.response?.data || "An error occurred during login";
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error.response?.data || "An error occurred during registration";
  }
};
