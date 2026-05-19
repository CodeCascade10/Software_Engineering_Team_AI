import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import API from "../api/axios";


export default function Login() {

  const navigate = useNavigate();

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

      const res = await API.post(
        "/auth/login",
        formData
      );

      localStorage.setItem(
        "token",
        res.data.access_token
      );

      navigate("/dashboard");

    } catch (err) {

      alert("Login Failed");
    }
  };


  return (

    <div className="h-screen flex items-center justify-center">

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-[350px]"
      >

        <h1 className="text-3xl font-bold">
          Login
        </h1>

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="border p-3 rounded"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border p-3 rounded"
          onChange={handleChange}
        />

        <button
          className="bg-black text-white p-3 rounded"
        >
          Login
        </button>

        <Link to="/signup">
          Don't have an account?
        </Link>

      </form>

    </div>
  );
}