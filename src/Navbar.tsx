import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./auth/AuthContext";
const Navbar: React.FC = () => {
  const { user, logout } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Inline Styles
  const navbarStyle: React.CSSProperties = {
    backgroundColor: "#2c2f33", // Dark mode ash color
    color: "white",
    padding: "12px 20px",
    position: "fixed",
    width: "100%",
    top: 0,
    left: 0,
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const menuButtonStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "white",
    fontSize: "24px",
    cursor: "pointer",
    marginRight: "10px",
  };

  const sidebarStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: menuOpen ? "0" : "-250px",
    width: "250px",
    height: "100vh",
    backgroundColor: "#23272a",
    paddingTop: "60px",
    transition: "left 0.3s ease-in-out",
    boxShadow: menuOpen ? "2px 0 5px rgba(0, 0, 0, 0.3)" : "none",
    zIndex: 1100,
  };

  const sidebarLinkStyle: React.CSSProperties = {
    display: "block",
    padding: "12px 20px",
    color: "white",
    textDecoration: "none",
    fontSize: "16px",
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.5)",
    display: menuOpen ? "block" : "none",
    zIndex: 1099,
  };

  return (
    <>
      {/* Navbar */}
      <nav style={navbarStyle}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* Sidebar Toggle Button */}
          {user && (
            <button style={menuButtonStyle} onClick={() => setMenuOpen(!menuOpen)}>
              ☰
            </button>
          )}
          <Link to="/" style={{ color: "white", textDecoration: "none", fontSize: "18px", fontWeight: "bold" }}>
            Competency Management
          </Link>
        </div>

        {/* Centered User Info */}
        {user && (
          <div style={{ flex: 1, textAlign: "center", fontSize: "16px", fontWeight: 500, color: "#dcdcdc" }}>
            <span>
              {user.username} | {user.role.toUpperCase()} | Dept: {user.departmentId}
            </span>
          </div>
        )}

        {/* Right-side Auth Links or Logout */}
        <div style={{ display: "flex", gap: "15px" }}>
          {!user ? (
            <>
              <Link to="/login" style={{ color: "white", textDecoration: "none" }}>Login</Link>
              <Link to="/register" style={{ color: "white", textDecoration: "none" }}>Register</Link>
            </>
          ) : (
            <button
              style={{ backgroundColor: "#e74c3c", color: "white", border: "none", padding: "8px 14px", cursor: "pointer", borderRadius: "5px", fontSize: "14px", fontWeight: "bold" }}
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Sidebar */}
      {user && (
        <div style={sidebarStyle}>
          <Link to="/" style={sidebarLinkStyle} onClick={() => setMenuOpen(false)}>🏠 Home</Link>

          {/* HR MENU */}
          {user.role === "HR" && (
            <>
              <Link to="/department-crud" style={sidebarLinkStyle} onClick={() => setMenuOpen(false)}>Manage Department</Link>
              <Link to="/role-crud" style={sidebarLinkStyle} onClick={() => setMenuOpen(false)}>Manage Role</Link>
              <Link to="/competency-crud" style={sidebarLinkStyle} onClick={() => setMenuOpen(false)}>Manage Competency</Link>
              <Link to="/role-crud" style={sidebarLinkStyle} onClick={() => setMenuOpen(false)}>📋 Reports</Link>
            </>
          )}

          {/* HOD MENU */}
          {user.role === "HOD" && (
            <>
              <Link to="/evaluate-employees" style={sidebarLinkStyle} onClick={() => setMenuOpen(false)}>✅ Evaluate Employees</Link>
              <Link to="/department-reports" style={sidebarLinkStyle} onClick={() => setMenuOpen(false)}>📈 Department Reports</Link>
              <Link to="/hod-dashboard" style={sidebarLinkStyle} onClick={() => setMenuOpen(false)}>🏢 HOD Dashboard</Link>
            </>
          )}

          {/* Logout Option */}
          <button
            style={{
              ...sidebarLinkStyle,
              background: "none",
              border: "none",
              textAlign: "left",
              width: "100%",
              cursor: "pointer",
              fontSize: "16px",
            }}
            onClick={() => {
              logout();
              navigate("/");
              setMenuOpen(false);
            }}
          >
            🚪 Logout
          </button>
        </div>
      )}

      {/* Overlay (Closes Sidebar when clicking outside) */}
      <div style={overlayStyle} onClick={() => setMenuOpen(false)}></div>
    </>
  );
};

export default Navbar;