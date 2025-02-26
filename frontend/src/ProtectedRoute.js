import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; 

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />; // Redirect if not logged in
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      localStorage.removeItem("token");
      return <Navigate to="/" replace />;
    }

    const userType = decoded.userType; // Extract user type from token

    if (adminOnly && userType !== "admin") {
      return <Navigate to="/" replace />; // Only admins can access
    }
  } catch (error) {
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }

  return children; // Render the page if authenticated
};

export default ProtectedRoute;
