import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const response = await API.post(
        "/auth/login",
        formData
      );

      login(response.data.access_token);

      navigate("/dashboard");

    } catch (err) {

      console.error(err);

      alert("Login Failed");
    }
  };

  return (

    <div className="min-h-screen bg-black flex items-center justify-center">

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 w-[400px] bg-zinc-900 border border-zinc-800 p-10 rounded-2xl shadow-2xl"
      >
        <div className="text-blue-500 text-sm font-bold tracking-widest">
          CODE NEXUS AI
        </div>

        <h1 className="text-4xl font-bold text-white">
          AI Engineering Team
        </h1>
        <p className="text-zinc-400">
          Login to continue
        </p>

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="bg-zinc-800 text-white p-4 rounded-xl outline-none border border-zinc-700 focus:border-blue-500"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="bg-zinc-800 text-white p-4 rounded-xl outline-none border border-zinc-700 focus:border-blue-500"
          onChange={handleChange}
        />

        <button
          className="bg-blue-600 hover:bg-blue-700 transition-all text-white p-4 rounded-xl font-semibold"
        >
          Login
        </button>

        <Link
          to="/signup"
          className="text-blue-400 hover:text-blue-300"
        >
          Don't have an account?
        </Link>

      </form>

    </div>
  );
}