import React, { useState, useEffect, useContext } from "react";
import api from "../interceptor/api";
import { AuthContext } from "../auth/AuthContext";
import { isApiError } from "../auth/errortypes";

interface Role {
  id: number;
  role_code: string;
  name: string;
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [roleCode, setRoleCode] = useState("");
  const [roleName, setRoleName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const {logout} = useContext(AuthContext)!

    useEffect(() => {
      const fetchRoles = async () => {
        try {
        
          const response = await api.get("/roles", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          });
          setRoles(response.data);
        } catch (error) {
          if (isApiError(error)) {
          if (error.response?.status === 401) {
            logout();
            window.location.href = "/login";
          }
          console.error("Error fetching roles:", error);
        }}
      };
  
      fetchRoles();
    }, [logout]);
    const handleSubmit = async () => {
      try {
        const roleData = { role_code: roleCode, name: roleName };
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        };
    
        if (editingId) {
          await api.put(`/roles/${editingId}`, roleData, config);
          // Update existing role in state
          setRoles(prev => prev.map(role => 
            role.id === editingId ? { ...role, ...roleData } : role
          ));
        } else {
          const response = await api.post("/roles", roleData, config); // Fixed endpoint from "/role" to "/roles"
          // Add new role to state
          setRoles(prev => [...prev, response.data]);
        }
        closeModal();
      } catch (error) {
        if (isApiError(error)) {
          if (error.response?.status === 401) {
            logout();
            window.location.href = "/login";
          }
          console.error("Error saving role:", error);
        }
      }
    };
    
    const handleDelete = async (id: number) => {
      if (window.confirm("Are you sure you want to delete this role?")) {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          };
          await api.delete(`/roles/${id}`, config);
          // Remove deleted role from state
          setRoles(prev => prev.filter(role => role.id !== id));
        } catch (error) {
          if (isApiError(error)) {
            if (error.response?.status === 401) {
              logout();
              window.location.href = "/login";
            }
            console.error("Error deleting role:", error);
          }
        }
      }
    };
  const openModal = (id?: number, code?: string, name?: string) => {
    setEditingId(id || null);
    setRoleCode(code || "");
    setRoleName(name || "");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setRoleCode("");
    setRoleName("");
    setEditingId(null);
  };



  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Role Management</h2>
        <button style={styles.addButton} onClick={() => openModal()}>
          + Add Role
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Role Code</th>
            <th style={styles.th}>Role Name</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id} style={styles.tableRow}>
              <td style={styles.td}>{role.id}</td>
              <td style={styles.td}>{role.role_code}</td>
              <td style={styles.td}>{role.name}</td>
              <td style={styles.td}>
                <button
                  style={styles.editButton}
                  onClick={() => openModal(role.id, role.role_code, role.name)}
                >
                  Edit
                </button>
                <button
                  style={styles.deleteButton}
                  onClick={() => handleDelete(role.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>{editingId ? "Edit Role" : "Add Role"}</h3>
            <input
              type="text"
              placeholder="Enter role code"
              value={roleCode}
              onChange={(e) => setRoleCode(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Enter role name"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              style={styles.input}
            />
            <div style={styles.modalButtons}>
              <button style={styles.saveButton} onClick={handleSubmit}>
                Save
              </button>
              <button style={styles.cancelButton} onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// **✅ Styled Components**
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "800px",
    margin: "80px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  },
  tableHeader: {
    backgroundColor: "#f2f2f2",
  },
  th: {
    padding: "10px",
    borderBottom: "2px solid #ddd",
    textAlign: "left",
  },
  td: {
    padding: "10px",
    borderBottom: "1px solid #ddd",
  },
  tableRow: {
    backgroundColor: "#fff",
  },
  editButton: {
    backgroundColor: "#008CBA",
    color: "white",
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    marginRight: "8px",
  },
  deleteButton: {
    backgroundColor: "#f44336",
    color: "white",
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    width: "300px",
    textAlign: "center",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxSizing: "border-box",
  },
  modalButtons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "15px",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    color: "black",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
};

export default RoleManagement;
