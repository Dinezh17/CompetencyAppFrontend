import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "./AuthContext";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext)!; 
  const [loading, setLoading] = useState(false);

  const onFinish = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const values = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      const response = await axios.post("http://127.0.0.1:8000/login/", values);

      const userData = {
        token: response.data.access_token,
        username: response.data.user,
        role: response.data.role,
        departmentCode: response.data.department_code,
      };

      login(userData);
      alert("Login Successful!");
      navigate("/dashboard");
    } catch (error) {
      alert("Login Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <div style={{ width: "320px", padding: "24px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)", borderRadius: "8px", border: "1px solid #ddd", backgroundColor: "#fff" }}>
        <h2 style={{ textAlign: "center", color: "#333" }}>Login</h2>
        
        <form onSubmit={onFinish} style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: "8px", color: "#555" }}>Email</label>
          <input type="email" name="email" required placeholder="Enter your email" style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px", marginBottom: "16px" }} />
          
          <label style={{ marginBottom: "8px", color: "#555" }}>Password</label>
          <input type="password" name="password" required placeholder="Enter your password" style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px", marginBottom: "16px" }} />
          
          <button type="submit" disabled={loading} style={{ padding: "10px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <span>Don't have an account? </span>
          <button onClick={() => navigate("/register")} style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", padding: "0" }}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
