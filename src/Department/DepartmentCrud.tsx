import React, { useState, useEffect, useContext } from "react";
import api from "../interceptor/api";
import { AuthContext } from "../auth/AuthContext";
import { isApiError } from "../auth/errortypes";

interface Department {
  id: number;
  department_code: string;
  name: string;
}

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Department, 'id'>>({
    department_code: '',
    name: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const { logout } = useContext(AuthContext)!;

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get("/departments", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setDepartments(response.data);
      } catch (error) {
        if (isApiError(error)) {
          if (error.response?.status === 401) {
            logout();
            window.location.href = "/login";
          }
          console.error("Error fetching departments:", error);
        }
      }
    };

    fetchDepartments();
  }, [logout]);

  const handleSubmit = async () => {
    if (!formData.department_code.trim() || !formData.name.trim()) {
      alert("Department code and name are required!");
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      };

      if (editingId) {
        await api.put(`/departments/${formData.department_code}`, formData, config);
        setDepartments(prev => prev.map(dept => 
          dept.id === editingId ? { ...dept, ...formData } : dept
        ));
      } else {
        const response = await api.post("/departments", formData, config);
        setDepartments(prev => [...prev, response.data]);
      }
      closeModal();
    } catch (error) {
      if (isApiError(error)) {
        if (error.response?.status === 401) {
          logout();
          window.location.href = "/login";
        }
        console.error("Error saving department:", error);
      }
    }
  };

  const handleDelete = async (code: string) => {
    if (window.confirm("Delete this department?")) {
      try {
        await api.delete(`/departments/${code}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setDepartments(prev => prev.filter(dept => dept.department_code !== code));
      } catch (error) {
        if (isApiError(error)) {
          if (error.response?.status === 401) {
            logout();
            window.location.href = "/login";
          }
          console.error("Error deleting department:", error);
        }
      }
    }
  };

  const openModal = (department?: Department) => {
    if (department) {
      setEditingId(department.id);
      setFormData({
        department_code: department.department_code,
        name: department.name
      });
    } else {
      setEditingId(null);
      setFormData({ department_code: '', name: '' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Styles with proper TypeScript types
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '20px auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      marginTop: '80px' // Added to account for navbar
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    table: {
      border: '1px solid #ddd' ,
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginTop: '10px'
    },
    tableHeader: {
      border: '1px solid #ddd' ,
      backgroundColor: '#f5f5f5'
    },
    th: {
      border: '1px solid #ddd' ,
      padding: '12px',
      borderBottom: '1px solid #ddd',
      textAlign: 'left' as const,
      fontWeight: 500
    },
    td: {
      border: '1px solid #ddd' ,
      padding: '12px',
      borderBottom: '1px solid #eee'
    },
    button: {
      padding: '8px 12px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      marginRight: '8px'
    },
    modalOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      width: '400px',
      maxWidth: '90%'
    },
    input: {
      width: '100%',
      padding: '10px',
      margin: '8px 0',
      border: '1px solid #ddd',
      borderRadius: '4px',
      boxSizing: 'border-box' as const
    },
    modalFooter: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
      marginTop: '20px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Department Management</h2>
        <button 
          style={{ ...styles.button, backgroundColor: '#4CAF50', color: 'white' }}
          onClick={() => openModal()}
        >
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
            <tr key={dept.id}>
              <td style={styles.td}>{dept.id}</td>
              <td style={styles.td}>{dept.department_code}</td>
              <td style={styles.td}>{dept.name}</td>
              <td style={styles.td}>
                <button
                  style={{ ...styles.button, backgroundColor: '#2196F3', color: 'white' }}
                  onClick={() => openModal(dept)}
                >
                  Edit
                </button>
                <button
                  style={{ ...styles.button, backgroundColor: '#f44336', color: 'white' }}
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
            <h3>{editingId ? "Edit Department" : "Add Department"}</h3>
            
            <input
              type="text"
              name="department_code"
              placeholder="Department code"
              value={formData.department_code}
              onChange={handleInputChange}
              style={{ ...styles.input, backgroundColor: editingId ? '#f5f5f5' : 'white' }}
              readOnly={!!editingId}
            />
            
            <input
              type="text"
              name="name"
              placeholder="Department name"
              value={formData.name}
              onChange={handleInputChange}
              style={styles.input}
            />
            
            <div style={styles.modalFooter}>
              <button 
                style={{ ...styles.button, backgroundColor: '#4CAF50', color: 'white' }}
                onClick={handleSubmit}
              >
                Save
              </button>
              <button 
                style={{ ...styles.button, backgroundColor: '#f5f5f5' }}
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;