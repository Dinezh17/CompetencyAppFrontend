import React, { useState, useEffect, useContext } from "react";
import api from "../interceptor/api";
import { AuthContext } from "../auth/AuthContext";
import { isApiError } from "../auth/errortypes";

interface Competency {
  id: number;
  code: string;
  name: string;
  description?: string;
  required_score: number;
}

const CompetencyManagement: React.FC = () => {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Competency, 'id'>>({ 
    code: '', 
    name: '', 
    description: '', 
    required_score: 0 
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const { logout } = useContext(AuthContext)!;

  useEffect(() => {
    const fetchCompetencies = async () => {
      try {
        const response = await api.get("/competency", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setCompetencies(response.data);
      } catch (error) {
        if (isApiError(error)) {
          if (error.response?.status === 401) {
            logout();
            window.location.href = "/login";
          }
          console.error("Error fetching competencies:", error);
        }
      }
    };

    fetchCompetencies();
  }, [logout]);

  const handleSubmit = async () => {
    if (!formData.code.trim() || !formData.name.trim() || formData.required_score <= 0) {
      alert("Code, name and score are required!");
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      };

      if (editingId) {
        await api.put(`/competency/${editingId}`, formData, config);
        setCompetencies(prev => prev.map(c => 
          c.id === editingId ? { ...c, ...formData } : c
        ));
      } else {
        const response = await api.post("/competency", formData, config);
        setCompetencies(prev => [...prev, response.data]);
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
    if (window.confirm("Delete this competency?")) {
      try {
        await api.delete(`/competency/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setCompetencies(prev => prev.filter(c => c.id !== id));
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
      setFormData({
        code: competency.code,
        name: competency.name,
        description: competency.description || '',
        required_score: competency.required_score
      });
    } else {
      setEditingId(null);
      setFormData({ code: '', name: '', description: '', required_score: 0 });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'required_score' ? Number(value) : value
    }));
  };

  // Styles with proper TypeScript types
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '20px auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      marginTop: '80px' 
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    table: {
      width: '100%',
      border: '1px solid #ddd' ,
      borderCollapse: 'collapse' as const,
      marginTop: '10px'
    },
    tableHeader: {
      
      border: '1px solid #ddd' ,
      backgroundColor: '#f5f5f5'
      
    },
    th: {
      padding: '12px',
      border: '1px solid #ddd' ,
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
        <h2>Competency Management</h2>
        <button 
          style={{ ...styles.button, backgroundColor: '#4CAF50', color: 'white' }}
          onClick={() => openModal()}
        >
          + Add Competency
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th style={styles.th}>Code</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Description</th>
            <th style={styles.th}>Required Score</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {competencies.map((competency) => (
            <tr key={competency.id}>
              <td style={{...styles.td,whiteSpace: 'nowrap'}}>{competency.code}</td>
              <td style={styles.td}>{competency.name}</td>
              <td style={styles.td}>{competency.description || '-'}</td>
              <td style={styles.td}>{competency.required_score}</td>
              <td style={styles.td}>
                <button
                  style={{ ...styles.button, backgroundColor: '#2196F3', color: 'white',margin:'3px' }}
                  onClick={() => openModal(competency)}
                >
                  Edit
                </button>
                <button
                  style={{ ...styles.button, backgroundColor: '#f44336', color: 'white' ,margin:'3px'}}
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
              name="code"
              placeholder="Competency code"
              value={formData.code}
              onChange={handleInputChange}
              style={{ ...styles.input, backgroundColor: editingId ? '#f5f5f5' : 'white' }}
              readOnly={!!editingId}
            />
            
            <input
              type="text"
              name="name"
              placeholder="Competency name"
              value={formData.name}
              onChange={handleInputChange}
              style={styles.input}
            />
            
            <textarea
              name="description"
              placeholder="Description (optional)"
              value={formData.description}
              onChange={handleInputChange}
              style={{ ...styles.input, minHeight: '80px' }}
            />
            
            <input
              type="number"
              name="required_score"
              placeholder="Required score"
              value={formData.required_score}
              onChange={handleInputChange}
              // min="1"
              // max="5"
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

export default CompetencyManagement;