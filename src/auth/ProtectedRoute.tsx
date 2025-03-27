import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
  // Check if user is authenticated
  const isAuthenticated = () => {
    const userData = localStorage.getItem('userData');
    if (!userData) return false;
    
    try {
      const parsedData = JSON.parse(userData);
      return !!parsedData.token;
    } catch {
      return false;
    }
  };

  // If not authenticated, redirect to login
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;