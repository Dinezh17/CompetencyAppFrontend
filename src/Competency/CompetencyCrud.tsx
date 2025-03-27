// CompetencyManagement.tsx
import React, { useState, useEffect, useContext } from "react";
import api from "../interceptor/api";
import { AuthContext } from "../auth/AuthContext";
import { isApiError } from "../auth/errortypes";

interface Competency {
  id: number;
  code: string;
  name: string;
  description?: string;
}

const CompetencyManagement: React.FC = () => {
  const [competency, setCompetency] = useState<Competency[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const { logout } = useContext(AuthContext)!;

  useEffect(() => {
    const fetchCompetency = async () => {
      try {
        const response = await api.get("/competency", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setCompetency(response.data);
      } catch (error) {
        if (isApiError(error)) {
          if (error.response?.status === 401) {
            logout();
            window.location.href = "/login";
          }
          console.error("Error fetching competency:", error);
        }
      }
    };

    fetchCompetency();
  }, [logout]);

  const handleSubmit = async () => {
    try {
      const competencyData = { code, name, description };
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      };

      if (editingId) {
        await api.put(`/competency/${editingId}`, competencyData, config);
        setCompetency(prev => prev.map(c => 
          c.id === editingId ? { ...c, ...competencyData } : c
        ));
      } else {
        const response = await api.post("/competency", competencyData, config);
        setCompetency(prev => [...prev, response.data]);
      }
      closeModal();
    } catch (error) {
      if (isApiError(error)) {
        if (error.response?.status === 401) {
          logout();
          window.location.href = "/login";
        }
        console.error("Error saving competency:", error);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this competency?")) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        };
        await api.delete(`/competency/${id}`, config);
        setCompetency(prev => prev.filter(c => c.id !== id));
      } catch (error) {
        if (isApiError(error)) {
          if (error.response?.status === 401) {
            logout();
            window.location.href = "/login";
          }
          console.error("Error deleting competency:", error);
        }
      }
    }
  };

  const openModal = (competency?: Competency) => {
    if (competency) {
      setEditingId(competency.id);
      setCode(competency.code);
      setName(competency.name);
      setDescription(competency.description || "");
    } else {
      setEditingId(null);
      setCode("");
      setName("");
      setDescription("");
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Competency Management</h2>
        <button style={styles.addButton} onClick={() => openModal()}>
          + Add Competency
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th style={styles.th}>Code</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Description</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {competency.map((competency) => (
            <tr key={competency.id} style={styles.tableRow}>
              <td style={styles.td}>{competency.code}</td>
              <td style={styles.td}>{competency.name}</td>
              <td style={styles.td}>{competency.description}</td>
              <td style={styles.td}>
                <button
                  style={styles.editButton}
                  onClick={() => openModal(competency)}
                >
                  Edit
                </button>
                <button
                  style={styles.deleteButton}
                  onClick={() => handleDelete(competency.id)}
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
            <h3>{editingId ? "Edit Competency" : "Add Competency"}</h3>
            <input
              type="text"
              placeholder="Enter competency code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Enter competency name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
            />
            <textarea
              placeholder="Enter description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{...styles.input, minHeight: '80px'}}
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

export default CompetencyManagement;