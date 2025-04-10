import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";



const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f9fafb", 
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    padding: "24px",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)", 
    borderRadius: "12px", 
  },
  heading: {
    textAlign: "center" as const,
    marginBottom: "24px",
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#333333",
  },
  input: {
    width: "95%",
    padding: "10px",
    marginBottom: "16px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  select: {
    width: "100%",
    padding: "10px",
    marginBottom: "16px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#2563eb", 
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
};


const UserRegistration: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const formData = {
      username: data.get("username") as string,
      email: data.get("email") as string,
      password: data.get("password") as string
    };
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/register/", formData);
      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      alert("Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>User Registration</h2>
        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input type="text" name="username" required style={styles.input} />

          <label>Email</label>
          <input type="email" name="email" required style={styles.input} />

          <label>Password</label>
          <input type="password" name="password" required style={styles.input} />

        
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserRegistration;
