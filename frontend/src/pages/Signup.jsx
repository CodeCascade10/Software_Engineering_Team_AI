import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import API from "../api/axios";


export default function Signup() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
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

      await API.post(
        "/auth/signup",
        formData
      );

      navigate("/");

    } catch (err) {

      alert("Signup Failed");
    }
  };


  return (

    <div className="h-screen flex items-center justify-center">

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-[350px]"
      >

        <h1 className="text-3xl font-bold">
          Signup
        </h1>

        <input
          type="text"
          name="name"
          placeholder="Name"
          className="border p-3 rounded"
          onChange={handleChange}
        />

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
          Signup
        </button>

        <Link to="/">
          Already have an account?
        </Link>

      </form>

    </div>
  );
}