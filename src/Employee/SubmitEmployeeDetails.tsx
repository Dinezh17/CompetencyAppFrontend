import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../interceptor/api";
import { AuthContext } from "../auth/AuthContext";

interface Employee {
  employee_number: string;
  employee_name: string;
  job_code: string;
  reporting_employee_name: string;
  role_code: string;
  department_code: string;
  evaluation_status: boolean;
  evaluation_by?: string;
  last_evaluated_date?: string;
  department: string;
  role: string;
}

interface CompetencyDisplay {
  code: string;
  name: string;
  description: string;
  required_score: number;
  actual_score: number;
  gap: number;
}

const EmployeeEvaluationHod: React.FC = () => {
  const { employeeNumber } = useParams<{ employeeNumber: string }>();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [competencies, setCompetencies] = useState<CompetencyDisplay[]>([]);
  const [editingScores, setEditingScores] = useState(false);
  const [tempScores, setTempScores] = useState<{[key: string]: number}>({});
  const { user, logout } = useContext(AuthContext)!;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!employeeNumber) return;
      
      setLoading(true);
      try {
        const [employeeRes, competenciesRes] = await Promise.all([
          api.get(`/employee/${employeeNumber}`),
          api.get(`/employee-competencies/${employeeNumber}`)
        ]);

        setEmployee(employeeRes.data.employee);
        const competencyData = competenciesRes.data;
        setCompetencies(competenciesRes.data)

        const scoresObj: {[key: string]: number} = {};
        competencyData.forEach((comp :CompetencyDisplay) => {
          scoresObj[comp.code] = comp.actual_score;
        });
        
        setTempScores(scoresObj);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeNumber, logout]);

  const handleBack = () => {
    navigate("/employee-eval-hod");
  };

  const handleScoreChange = (code: string, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(Math.max(numValue, 0), 4);
      setTempScores(prev => ({
        ...prev,
        [code]: clampedValue
      }));
    }
  };
  const submitEvaluation = async () => {
    if (!employee || !user) return;
  
    try {
      const payload = {
        scores: Object.entries(tempScores).map(([code, score]) => ({
          competency_code: code,
          actual_score: score
        }))
      };
  
      const resposne =await api.post(`/evaluations/${employee.employee_number}`, payload);
      if (resposne) {
        window.location.href = `/employee-eval-hod/${employeeNumber}`;
      }
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      alert("Failed to submit evaluation. Please try again.");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not evaluated";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingText}>Loading employee details...</div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h3>Employee not found</h3>
          <button style={styles.backButton} onClick={handleBack}>
            Back to Employee List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.container }}>
      <div style={{...styles.header,marginTop:"80px"}}>
        <button style={styles.backButton} onClick={handleBack}>
          &larr; Back to List
        </button>
        <h2 style={styles.title}>Employee Evaluation</h2>
      </div>

      <div style={styles.detailsContainer}>
        <div style={styles.detailsSection}>
          <h3 style={styles.sectionTitle}>Basic Information</h3>
          <div style={styles.detailsGrid}>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Employee Number:</span>
              <span>{employee.employee_number}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Name:</span>
              <span>{employee.employee_name}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Job Code:</span>
              <span>{employee.job_code}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Reporting To:</span>
              <span>{employee.reporting_employee_name || 'N/A'}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Department:</span>
              <span>{employee.department}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Role:</span>
              <span>{employee.role}</span>
            </div>
          </div>
        </div>

        <div style={styles.detailsSection}>
          <h3 style={styles.sectionTitle}>Evaluation Status</h3>
          <div style={styles.detailsGrid}>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Status:</span>
              <span style={{
                color: employee.evaluation_status ? '#2E7D32' : '#C62828',
                fontWeight: '500'
              }}>
                {employee.evaluation_status ? 'Evaluated' : 'Pending'}
              </span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Evaluated By:</span>
              <span>{employee.evaluation_by || 'N/A'}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Last Evaluated:</span>
              <span>{formatDate(employee.last_evaluated_date)}</span>
            </div>
          </div>
        </div>
        
        <div style={styles.detailsSection}>
          <h3 style={styles.sectionTitle}>Competency Evaluation</h3>
          <table style={styles.competencyTable}>
            <thead>
              <tr>
                <th style={styles.competencyTh}>Code</th>
                <th style={styles.competencyTh}>Competency</th>
                <th style={styles.competencyTh}>Required</th>
                <th style={styles.competencyTh}>Actual</th>
                <th style={styles.competencyTh}>Gap</th>
              </tr>
            </thead>
            <tbody>
              {competencies.map((comp) => (
                <tr key={comp.code}>
                  <td style={styles.competencyTd}>{comp.code}</td>
                  <td style={styles.competencyTd}>
                    <div><strong>{comp.name}</strong></div>
                    <div style={styles.competencyDesc}>{comp.description}</div>
                  </td>
                  <td style={styles.competencyTd}>{comp.required_score}</td>
                  <td style={styles.competencyTd}>
                    {editingScores ? (
                      <input
                        type="number"
                        min="0"
                        max="4"
                        value={tempScores[comp.code] || 0}
                        onChange={(e) => handleScoreChange(comp.code, e.target.value)}
                        style={styles.scoreInput}
                      />
                    ) : (
                      comp.actual_score
                    )}
                  </td>
                  <td style={{
                    ...styles.competencyTd,
                    color: comp.gap >= 0 ? '#2E7D32' : '#C62828',
                    fontWeight: '500'
                  }}>
                    {comp.gap}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.popupActions}>
          {!editingScores ? (
            <button 
              style={{
                ...styles.evaluateButton,
                backgroundColor: '#4299e1'
              }}
              onClick={() => setEditingScores(true)}
              disabled={employee.evaluation_status}
            >
              {employee.evaluation_status ? 'Already Evaluated' : 'Evaluate'}
            </button>
          ) : (
            <>
              <button 
                style={{
                  ...styles.submitButton,
                  backgroundColor: '#2E7D32',
                  marginRight: '10px'
                }}
                onClick={submitEvaluation}
              >
                Submit Evaluation
              </button>
              <button 
                style={{
                  ...styles.cancelButton,
                  backgroundColor: '#C62828'
                }}
                onClick={() => setEditingScores(false)}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
// Inside your existing component, replace the styles object with the improved version:


const styles: { [key: string]: React.CSSProperties } = {
    container: {
        maxWidth: "1200px",
        margin: '20px auto',
        padding: "30px 20px",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: "#2d3748",
        backgroundColor: "#f8fafc",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    },
    header: {
        display: "flex",
        alignItems: "center",
        marginBottom: "28px",
        gap: "16px",
    },
    title: {
        fontSize: "28px",
        fontWeight: "600",
        color: "#1a365d",
        margin: 0,
    },
    backButton: {
        padding: "8px 16px",
        backgroundColor: "#edf2f7",
        color: "#4a5568",
        border: "none",
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
    },
    loadingContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "300px",
    },
    loadingText: {
        fontSize: "18px",
        color: "#4a5568",
    },
    errorContainer: {
        textAlign: "center",
        padding: "40px",
    },
    detailsContainer: {
        backgroundColor: "white",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        padding: "24px",
    },
    detailsSection: {
        marginBottom: "28px",
        padding: "16px 0",
        borderBottom: "1px solid #e2e8f0",
    },
    sectionTitle: {
        fontSize: "20px",
        fontWeight: "600",
        marginBottom: "16px",
        color: "#2d3748",
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    detailsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "20px",
        marginBottom: "20px",
    },
    detailItem: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    },
    detailLabel: {
        fontSize: "13px",
        color: "#718096",
        fontWeight: "500",
    },
    competencyTable: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "14px",
        marginTop: "16px",
    },
    competencyTh: {
        padding: "12px 16px",
        textAlign: "left",
        borderBottom: "1px solid #e2e8f0",
        color: "#4a5568",
        fontWeight: "600",
        backgroundColor: "#f7fafc",
    },
    competencyTd: {
        padding: "16px",
        borderBottom: "1px solid #e2e8f0",
        verticalAlign: "top",
    },
    competencyDesc: {
        fontSize: "13px",
        color: "#718096",
        marginTop: "8px",
        lineHeight: "1.5",
    },
    evaluateButton: {
      padding: "10px 20px",
      backgroundColor: "#3182ce",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",

    },
  
    // Clean Score Input
    scoreInput: {
      width: "50px",
      padding: "6px 8px",
      border: "1px solid #e2e8f0",
      borderRadius: "4px",
      fontSize: "14px",
      textAlign: "center",
     
    },
  
    // Action Buttons Container
    popupActions: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
      marginTop: "20px"
    },
  
    // Submit Button
    submitButton: {
      padding: "10px 20px",
      backgroundColor: "#38a169",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer"
    },
  
    // Cancel Button
    cancelButton: {
      padding: "10px 20px",
      backgroundColor: "#e53e3e",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer"
    }

};

export default EmployeeEvaluationHod;