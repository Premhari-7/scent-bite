// src/components/PrivateRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    // Not logged in, redirect to home
    return <Navigate to="/" />;
  }

  // Logged in, show the page
  return children;
};

export default PrivateRoute;
