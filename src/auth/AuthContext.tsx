import React, { createContext, useState, useEffect } from "react";

interface AuthContextType {
  user: {token: string,refresh:string, username: string; role: string; departmentCode: string } | null;
  login: (userData: { token: string;refresh:string; username: string; role: string; departmentCode: string }) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ token: string,refresh:string,username: string; role: string; departmentCode: string } | null>(null);

  // Check localStorage on app load
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      localStorage.setItem("token",parsedUser.token)
      localStorage.setItem("refresh",parsedUser.refresh)
    }
  }, []);

  // Login function
  const login = (userData: { token: string;refresh:string; username: string; role: string; departmentCode: string }) => {
    localStorage.setItem("userData", JSON.stringify(userData));
    setUser(userData);
    localStorage.setItem("token",userData.token)
    localStorage.setItem("refresh",userData.refresh)
  };

  // Logout function
  const logout = () => {

    localStorage.removeItem("userData");
    setUser(null);
    localStorage.removeItem("refresh")
    localStorage.removeItem("token")
    window.location.href = "/";

  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
