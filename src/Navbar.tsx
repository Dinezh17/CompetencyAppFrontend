import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./auth/AuthContext";

const Navbar: React.FC = () => {
  const { user, logout } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Color theme from the provided palette
  const theme = {
    primary: "#5D001E",    // Dark red
    secondary: "#9A1750",  // Medium purple-red
    accent: "#EE4C7C",     // Pink
    light: "#E3E2DF",      // Light gray (from #ESE2DF - assuming this was meant to be #E3E2DF)
    lighter: "#EAFBC",     // Very light gray (from #ESAFBC - assuming this was meant to be #EAFAFC or similar)
  };

  // Inline Styles
  const navbarStyle: React.CSSProperties = {
    backgroundColor: theme.primary,
    color: theme.light,
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
    boxSizing: "border-box", // Ensure padding is included in width
  };

  const menuButtonStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    color: theme.light,
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
    backgroundColor: theme.secondary,
    paddingTop: "60px",
    transition: "left 0.3s ease-in-out",
    boxShadow: menuOpen ? "2px 0 5px rgba(0, 0, 0, 0.3)" : "none",
    zIndex: 1100,
  };

  const sidebarLinkStyle: React.CSSProperties = {
    display: "block",
    padding: "12px 20px",
    color: theme.light,
    textDecoration: "none",
    fontSize: "20px",
    transition: "background-color 0.2s",
    
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

  const rightSideContainerStyle: React.CSSProperties = {
    display: "flex",
    gap: "15px",
    alignItems: "center",
    flexShrink: 0, // Prevent shrinking on small screens
    marginLeft: "15px", // Add some spacing from the center content
  };

  const logoutButtonStyle: React.CSSProperties = {
    backgroundColor: theme.accent,
    color: theme.light,
    border: "none",
    padding: "8px 14px",
    cursor: "pointer",
    borderRadius: "5px",
    fontSize: "14px",
    fontWeight: "bold",
    whiteSpace: "nowrap", // Prevent text wrapping
  };

  const userInfoStyle: React.CSSProperties = {
    flex: 1,
    textAlign: "center",
    fontSize: "16px",
    fontWeight: 500,
    color: theme.light,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    padding: "0 15px", // Add padding to prevent text touching edges
  };

  return (
    <>
      {/* Navbar */}
      <nav style={navbarStyle}>
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          {/* Sidebar Toggle Button */}
          {user && (
            <button style={menuButtonStyle} onClick={() => setMenuOpen(!menuOpen)}>
              ☰
            </button>
          )}
          <Link 
            to="/" 
            style={{ 
              color: theme.light, 
              textDecoration: "none", 
              fontSize: "18px", 
              fontWeight: "bold",
              whiteSpace: "nowrap",
            }}
          >
            Competency Management
          </Link>
        </div>

        {/* Centered User Info */}
        {user && (
          <div style={userInfoStyle}>
            <span>
              {user.username} | {user.role.toUpperCase()} | Dept: {user.departmentCode}
            </span>
          </div>
        )}

        {/* Right-side Auth Links or Logout */}
        <div style={rightSideContainerStyle}>
          {!user ? (
            <>
              <Link to="/login" style={{ color: theme.light, textDecoration: "none" }}>Login</Link>
              <Link to="/register" style={{ color: theme.light, textDecoration: "none" }}>Register</Link>
            </>
          ) : (
            <button
              style={logoutButtonStyle}
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
          <Link to="/" style={sidebarLinkStyle} onClick={() => setMenuOpen(false)}>Home</Link>

          {/* HR MENU */}
          {user.role === "HR" && (
            <>
              <Link to="/department-crud" style={sidebarLinkStyle} onClick={() => setMenuOpen(false)}>Department</Link>
              <Link to="/role-crud" style={sidebarLinkStyle} onClick={() => setMenuOpen(false)}>Role</Link>
              <Link to="/competency-crud" style={sidebarLinkStyle} onClick={() => setMenuOpen(false)}>Competency</Link>
              <Link to="/role-assign-crud" style={sidebarLinkStyle} onClick={() => setMenuOpen(false)}>Role Assign</Link>
              <Link to="/employee-crud" style={sidebarLinkStyle} onClick={() => setMenuOpen(false)}>Employee</Link>
              <Link to="/employee-excel" style={sidebarLinkStyle} onClick={() => setMenuOpen(false)}>Employee Excel Upload</Link>
              <Link to="/employee-eval" style={sidebarLinkStyle} onClick={() => setMenuOpen(false)}>List Employee</Link>
              <Link to="/employee-stats" style={sidebarLinkStyle} onClick={() => setMenuOpen(false)}>Employee Stats</Link>

            </>
          )}

          {/* HOD MENU */}
          {user.role === "HOD" && (
            <>
              <Link to="/employee-eval-hod" style={sidebarLinkStyle} onClick={() => setMenuOpen(false)}>Evaluate Employees</Link>
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
             
            }}
            onClick={() => {
              logout();
              navigate("/");
              setMenuOpen(false);
            }}
          >Logout
          </button>
        </div>
      )}

      {/* Overlay (Closes Sidebar when clicking outside) */}
      <div style={overlayStyle} onClick={() => setMenuOpen(false)}></div>
    </>
  );
};

export default Navbar;