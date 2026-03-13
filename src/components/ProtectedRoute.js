import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../core/services/JwtService";

const ProtectedRoute = () => {
  const token = getToken();

  return token ? <Outlet /> : <Navigate to="/catalogo" replace />;
};

export default ProtectedRoute;