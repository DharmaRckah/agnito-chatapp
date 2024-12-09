import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/authSlice";
import { connectSocket } from "../services/socket";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // If the user is already logged in, redirect based on their role
    if (token && user?.role) {
      connectSocket(token); // Connect to the socket if logged in
      
        navigate("/user/dashboard");
      
    }
  }, [token, user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password })).then(({ payload }) => {
      if (payload?.accessToken) {
        connectSocket(payload.accessToken);
        toast.success("Login successful!")
        // alert("Login successful!");

      
          if (payload?.user) {
          navigate("/user/dashboard");
        }
      } else if (payload?.error) {
        toast.error("Login failed. Please try again.")
        alert(payload.error.message || "Login failed. Please try again.");
      }
    });
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://plus.unsplash.com/premium_photo-1684761949804-fd8eb9a5b6cc?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
      }}
    >
      <div className="p-6 max-w-sm w-full bg-white bg-opacity-90 shadow-md rounded-md">
        <form onSubmit={handleSubmit}>
          <h2 className="text-center text-2xl font-semibold mb-6">Login</h2>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="border p-2 w-full rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              className="border p-2 w-full rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 w-full rounded-md hover:bg-blue-600"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Don’t have an account?{" "}
            <a href="/register" className="text-blue-500 hover:underline">
              Register
            </a>
          </p>
        </div>
      </div>
      <Toaster/>
    </div>
  );
};

export default LoginPage;
