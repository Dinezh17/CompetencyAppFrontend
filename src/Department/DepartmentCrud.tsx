import React, { useState, useEffect } from "react";
import api from "../interceptor/api";

interface Department {
  id: number;
  department_code:string;
  name: string;
}

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [departmentName, setDepartmentName] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [editingCode, setEditingCode] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/departments")
      .then((res) => setDepartments(res.data))
      .catch((error) => console.error("Error fetching departments:", error));
  }, []);

  const openModal = (code?: string, name?: string) => {
    setEditingCode(code || null);
    setDepartmentCode(code || "");
    setDepartmentName(name || "");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setDepartmentName("");
    setDepartmentCode("");
    setEditingCode(null);
  };
  const handleSubmit = () => {
    const departmentData = {
      department_code: departmentCode,
      name: departmentName,
    };

    if (editingCode) {
      api
        .put(`/departments/${editingCode}`, departmentData)
        .then(() => {
          setDepartments((prev) =>
            prev.map((dept) =>
              dept.department_code === departmentData.department_code ? { ...dept, ...departmentData } : dept
            )
          );
          closeModal();
        })
        .catch((error) => console.error("Error updating department:", error));
    } else {
      api
        .post("/departments", departmentData)
        .then((res) => {
          setDepartments((prev) => [...prev, res.data]);
          closeModal();
        })
        .catch((error) => console.error("Error adding department:", error));
    }
  };

  const handleDelete = (code: string) => {
    if (window.confirm("⚠️ Are you sure you want to delete this department?")) {
      api
        .delete(`/departments/${code}`)
        .then(() => {
          setDepartments((prev) => prev.filter((dept) => dept.department_code !== code));
        })
        .catch((error) => console.error("Error deleting department:", error));
    }
  };
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Department Management</h2>
        <button style={styles.addButton} onClick={() => openModal()}>
          + Add Department
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Code</th>

            <th style={styles.th}>Department Name</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((dept) => (
            <tr key={dept.id} style={styles.tableRow}>
              <td style={styles.td}>{dept.id}</td>
              <td style={styles.td}>{dept.department_code}</td>

              <td style={styles.td}>{dept.name}</td>
              <td style={styles.td}>
                <button
                  style={styles.editButton}
                  onClick={() => openModal(dept.department_code, dept.name)}
                >
                  Edit
                </button>
                <button
                  style={styles.deleteButton}
                  onClick={() => handleDelete(dept.department_code)}
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
            <h3>{editingCode? "Edit Department" : "Add Department"}</h3>
            <input
              type="text"
              placeholder="Enter department code"
              value={departmentCode}
              onChange={(e) => setDepartmentCode(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Enter department name"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
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

export default DepartmentManagement;
