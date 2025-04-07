import React, { useState, useEffect, useContext } from "react";
import api from "../interceptor/api";
import { AuthContext } from "../auth/AuthContext";
import { isApiError } from "../auth/errortypes";

interface Role {
  id: number;
  role_code: string;
  name: string;
}

interface Competency {
  code: string;
  name: string;
  description?: string;
}

const RoleCompetencyAssignment: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [assignedCompetencies, setAssignedCompetencies] = useState<string[]>([]);
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { logout } = useContext(AuthContext)!;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        };

        const [rolesRes, compsRes] = await Promise.all([
          api.get("/roles", config),
          api.get("/competency", config)
        ]);

        setRoles(rolesRes.data);
        setCompetencies(compsRes.data);
        setLoading(false);
      } catch (error) {
        if (isApiError(error)) {
          if (error.response?.status === 401) {
            logout();
            window.location.href = "/login";
          }
          console.error("Error fetching data:", error);
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [logout]);

  const fetchRoleCompetencies = async (roleCode: string) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      };
      const response = await api.get(`/roles/${roleCode}/competencies`, config);
      setAssignedCompetencies(response.data);
    } catch (error) {
      if (isApiError(error)) {
        if (error.response?.status === 401) {
          logout();
          window.location.href = "/login";
        }
        console.error("Error fetching role competencies:", error);
      }
    }
  };

  const openAssignmentModal = async (role: Role) => {
    setCurrentRole(role);
    await fetchRoleCompetencies(role.role_code);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCompetencies([]);
  };

  const toggleCompetency = (code: string) => {
    setSelectedCompetencies(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const handleAssign = async () => {
    if (!currentRole || selectedCompetencies.length === 0) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      };
      
      await api.post(
        `/roles/${currentRole.role_code}/competencies`,
        selectedCompetencies,
        config
      );
      
      await fetchRoleCompetencies(currentRole.role_code);
      setSelectedCompetencies([]);
    } catch (error) {
      if (isApiError(error)) {
        if (error.response?.status === 401) {
          logout();
          window.location.href = "/login";
        }
        console.error("Error assigning competencies:", error);
      }
    }
  };

  const handleRemove = async () => {
    if (!currentRole || selectedCompetencies.length === 0) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      };
      
      await api.delete(
        `/roles/${currentRole.role_code}/competencies`,
        { ...config, data: selectedCompetencies }
      );
      
      await fetchRoleCompetencies(currentRole.role_code);
      setSelectedCompetencies([]);
    } catch (error) {
      if (isApiError(error)) {
        if (error.response?.status === 401) {
          logout();
          window.location.href = "/login";
        }
        console.error("Error removing competencies:", error);
      }
    }
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
      borderCollapse: 'collapse' as const,
      marginTop: '10px'
    },
    tableHeader: {
      backgroundColor: '#f5f5f5'
    },
    th: {
      padding: '12px',
      borderBottom: '1px solid #ddd',
      textAlign: 'left' as const,
      fontWeight: 500
    },
    td: {
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
      width: '70vw', // 70% of viewport width
      height: '70vh', // 70% of viewport height
      maxWidth: '90%',
      maxHeight: '90%',
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden'
    },
    modalContent: {
      flex: 1,
      overflow: 'auto',
      padding: '10px'
    },
    compSection: {
      margin: '15px 0',
      height: '45%', // Each section takes about half of the available space
      overflowY: 'auto' as const,
      border: '1px solid #eee',
      padding: '10px',
      borderRadius: '4px'
    },
    compItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid #f0f0f0'
    },
    label: {
      marginLeft: '8px',
      cursor: 'pointer',
      flex: 1,
      textAlign: 'left' as const
    },
    modalFooter: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
      marginTop: '20px',
      paddingTop: '15px',
      borderTop: '1px solid #eee'
    },
    loading: {
      textAlign: 'center' as const,
      marginTop: '50px',
      fontSize: '18px'
    }
  };

 

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Role Competency Assignment</h2>
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
          {roles.map(role => (
            <tr key={role.id}>
              <td style={styles.td}>{role.id}</td>
              <td style={styles.td}>{role.role_code}</td>
              <td style={styles.td}>{role.name}</td>
              <td style={styles.td}>
                <button
                  style={{ ...styles.button, backgroundColor: '#2196F3', color: 'white' }}
                  onClick={() => openAssignmentModal(role)}
                >
                  Manage Competencies
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Competency Assignment Modal */}
      {modalOpen && currentRole && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Manage Competencies for {currentRole.name}</h3>
            
            <div style={styles.compSection}>
              <h4>Available Competencies</h4>
              {competencies
                .filter(c => !assignedCompetencies.includes(c.code))
                .map(comp => (
                  <div key={comp.code} style={styles.compItem}>
                    <input
                      type="checkbox"
                      id={`avail-${comp.code}`}
                      checked={selectedCompetencies.includes(comp.code)}
                      onChange={() => toggleCompetency(comp.code)}
                    />
                    <label htmlFor={`avail-${comp.code}`} style={styles.label}>
                      <strong>{comp.code}</strong>: {comp.name}
                    </label>
                  </div>
                ))}
                {competencies.filter(c => !assignedCompetencies.includes(c.code)).length === 0 && (
                  <p>No available competencies</p>
                )}
            </div>

            <div style={styles.compSection}>
              <h4>Assigned Competencies</h4>
              {assignedCompetencies.length === 0 ? (
                <p>No competencies assigned</p>
              ) : (
                competencies
                  .filter(c => assignedCompetencies.includes(c.code))
                  .map(comp => (
                    <div key={comp.code} style={styles.compItem}>
                      <input
                        type="checkbox"
                        id={`assigned-${comp.code}`}
                        checked={selectedCompetencies.includes(comp.code)}
                        onChange={() => toggleCompetency(comp.code)}
                      />
                      <label htmlFor={`assigned-${comp.code}`} style={styles.label}>
                        <strong>{comp.code}</strong>: {comp.name}
                      </label>
                    </div>
                  ))
              )}
            </div>

            <div style={styles.modalFooter}>
              <button 
                style={{ 
                  ...styles.button, 
                  backgroundColor: selectedCompetencies.length === 0 || 
                    selectedCompetencies.every(c => assignedCompetencies.includes(c)) 
                    ? '#ccc' : '#4CAF50', 
                  color: 'white' 
                }}
                onClick={handleAssign}
                disabled={selectedCompetencies.length === 0 || 
                          selectedCompetencies.every(c => assignedCompetencies.includes(c))}
              >
                Assign Selected
              </button>
              <button 
                style={{ 
                  ...styles.button, 
                  backgroundColor: selectedCompetencies.length === 0 || 
                    selectedCompetencies.every(c => !assignedCompetencies.includes(c)) 
                    ? '#ccc' : '#f44336', 
                  color: 'white' 
                }}
                onClick={handleRemove}
                disabled={selectedCompetencies.length === 0 || 
                          selectedCompetencies.every(c => !assignedCompetencies.includes(c))}
              >
                Remove Selected
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

export default RoleCompetencyAssignment;