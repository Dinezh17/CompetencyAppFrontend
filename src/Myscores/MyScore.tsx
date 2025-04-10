import React, { useContext, useEffect, useState } from "react";
import api, { configureApi } from "../interceptor/api";
import { AuthContext } from "../auth/AuthContext";

interface CompetencyScore {
  code: string;
  name:string;
  required_score: number;
  actual_score: number;
}
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

const MyScores: React.FC = () => {
  const [scores, setScores] = useState<CompetencyScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null >(null);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useContext(AuthContext)!;
  useEffect(() => {
    configureApi(logout);
  }, [logout]);

  useEffect(() => {
    const userData = localStorage.getItem('userData')
    if (userData){
    const parsedData = JSON.parse(userData);
    const fetchScores = async () => {
      try {
        const response = await api.get(
          `/employee-competencies/${parsedData.username}`
        );
        const res =await api.get(`/employee/${parsedData.username}`);
        setEmployee(res.data.employee)
        console.log(res.data)
        setScores(response.data);
      } catch (err) {
        setError("Failed to fetch scores.");
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }else{
    setScores(prev=>prev)
  }
    
  }, []);
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not evaluated";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!employee) return <div style={styles.noData}>Employee not found</div>;

  return (
    <div style={{ ...styles.container }}>
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
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center",marginTop:"80px", marginBottom: "20px" }}>My Scores</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f4f4f4" }}>
            <th style={styles.thStyle}>Competency Code</th>
            <th style={styles.thStyle}>Name</th>
            <th style={styles.thStyle}>Required Score</th>
            <th style={styles.thStyle}>Actual Score</th>
            <th style={styles.thStyle}>Gap</th>
     
          </tr>
        </thead>
        <tbody>
          {scores.map((item, index) => (
            <tr key={index}>
              <td style={styles.tdStyle}>{item.code}</td>
              <td style={styles.tdStyle}>{item.name}</td>
              <td style={styles.tdStyle}>{item.required_score}</td>
              <td style={styles.tdStyle}>{item.actual_score?item.actual_score:"-"}</td>
              <td style={styles.tdStyle}>{item.actual_score?item.required_score-item.actual_score:"-"}</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
    </div>

  );
};

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
    tdStyle: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#2d3748",
      padding: "10px 12px",
      textAlign: "center",
      borderBottom: "1px solid #e2e8f0",
    },
    thStyle: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#2d3748",
      padding: "10px 12px",
      backgroundColor: "#edf2f7",
      textAlign: "center",
      borderBottom: "2px solid #cbd5e0",
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

export default MyScores;
