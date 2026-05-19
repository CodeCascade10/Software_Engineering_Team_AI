import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import { auth } from './services/api';
import { setToken, getToken, removeToken } from './services/auth';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    removeToken();
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;