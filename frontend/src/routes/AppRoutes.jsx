import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "../pages/Login";

import Signup from "../pages/Signup";

import NewDashboard from "../pages/NewDashboard";

import ProtectedRoute from "../components/ProtectedRoute";
import OAuthSuccess from "../pages/OAuthSuccess";

export default function AppRoutes() {

  return (
    <Routes>

      {/* ROOT */}
      <Route
        path="/"
        element={
          <Navigate to="/login" />
        }
      />

      {/* AUTH */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      {/* DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <NewDashboard />
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route
        path="*"
        element={
          <Navigate to="/login" />
        }
      />

      {/* GITHUB */}
      <Route
       path="/oauth-success"
       element={<OAuthSuccess />}
       />
    </Routes>
  );
}