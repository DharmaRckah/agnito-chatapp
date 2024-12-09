import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false); // State to track password visibility
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/v1/auth/login", { email, password });
      const user = response.data.user;
      sessionStorage.setItem("token", response.data.accessToken);
      sessionStorage.setItem("user", JSON.stringify(user)); // Stringify the user object before storing
      toast.success(response.data.message);
      navigate("/user/dashboard");
    } catch (error) {
      toast.error(error.response?.data.message);
    }
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
          <div className="mb-6 relative">
            <label className="block text-gray-700">Password</label>
            <input
              type={passwordVisible ? "text" : "password"} // Toggle password visibility
              className="border p-2 w-full rounded-md pr-10" // Added padding-right for the eye icon
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* Eye Icon for toggling password visibility */}
            <button
              type="button"
              className="absolute right-2 top-1/2 transform "
              onClick={() => setPasswordVisible(!passwordVisible)} // Toggle password visibility
            >
              {passwordVisible ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
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
      <Toaster />
    </div>
  );
};

export default LoginPage;
