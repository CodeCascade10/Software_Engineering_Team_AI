import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../services/auth';

function Home() {
  const [todos, setTodos] = useState([]);
  const token = getToken();

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get('http://localhost:8000/todos', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTodos(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTodos();
  }, [token]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Todo List</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className="bg-gray-100 p-4 mb-2">
            {todo.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;