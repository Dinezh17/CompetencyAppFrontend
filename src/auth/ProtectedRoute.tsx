// auth/ProtectedRouteWithRole.tsx
import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "./AuthContext";

interface ProtectedRouteWithRoleProps {
  allowedRoles: string[];
}

const ProtectedRouteWithRole: React.FC<ProtectedRouteWithRoleProps> = ({ allowedRoles }) => {
  const { user } = useContext(AuthContext)!;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRouteWithRole;