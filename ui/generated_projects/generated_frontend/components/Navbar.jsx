import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ isLoggedIn, handleLogout }) {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <Link to="/" className="text-lg font-bold">
        Todo App
      </Link>
      {isLoggedIn ? (
        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={handleLogout}>
          Logout
        </button>
      ) : (
        <Link to="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Login
        </Link>
      )}
    </nav>
  );
}

export default Navbar;