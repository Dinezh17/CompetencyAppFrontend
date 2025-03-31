import React, { useState, useEffect, useContext } from "react";
import api from "../interceptor/api";
import { AuthContext } from "../auth/AuthContext";
import { isApiError } from "../auth/errortypes";

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
}

interface CompetencyScore {
  code: string;
  required_score: number;
  actual_score: number;
}

interface Competency {
  id: number;
  code: string;
  name: string;
  description: string | null;
}

interface CompetencyDisplay {
  code: string;
  name: string;
  description: string;
  required_score: number;
  actual_score: number;
  gap: number;
}

interface EmployeeCompetencyData {
  employee: {
    employee_number: string;
    employee_name: string;
    department: string;
    job_title: string;
  };
  competencies: CompetencyDisplay[];
}

const DepartmentManagerEvaluation: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [competencyData, setCompetencyData] = useState<EmployeeCompetencyData | null>(null);
  const [showCompetencyPopup, setShowCompetencyPopup] = useState(false);
  const [loadingCompetencies, setLoadingCompetencies] = useState(false);
  const [editingScores, setEditingScores] = useState(false);
  const [tempScores, setTempScores] = useState<{[key: string]: number}>({});
  const [competencyCatalog, setCompetencyCatalog] = useState<Competency[]>([]);
  const { user, logout } = useContext(AuthContext)!;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        };

        const competenciesRes = await api.get<Competency[]>("/competency", config);
        setCompetencyCatalog(competenciesRes.data);

        const employeesRes = await api.get<Employee[]>("/employees", config);
        
        
        setEmployees(employeesRes.data);
        setFilteredEmployees(employeesRes.data);
      } catch (error) {
        if (isApiError(error)) {
          if (error.response?.status === 401) {
            logout();
            window.location.href = "/login";
          }
          console.error("Error fetching data:", error);
        }
      }
    };
    
    fetchData();
  }, [user, logout]);

  useEffect(() => {
    applyFilters();
  }, [employees, searchTerm, statusFilter]);

  const applyFilters = () => {
    let result = [...employees];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(emp => 
        emp.employee_number.toLowerCase().includes(term) || 
        emp.employee_name.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "all") {
      const status = statusFilter === "evaluated";
      result = result.filter(emp => emp.evaluation_status === status);
    }

    setFilteredEmployees(result);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const fetchEmployeeCompetencies = async (employeeNumber: string) => {
    setLoadingCompetencies(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      };

      // Fetch basic scores from simplified API
      const scoresResponse = await api.get<CompetencyScore[]>(
        `/employee-competencies/${employeeNumber}`,
        config
      );

      // Find employee details from local state
      const employee = employees.find(e => e.employee_number === employeeNumber);

      // Enrich with competency details and calculate gap
      const enrichedCompetencies = scoresResponse.data.map(score => {
        const catalogEntry = competencyCatalog.find(c => c.code === score.code) || {
          name: score.code,
          description: "No description available"
        };
        
        return {
          ...score,
          name: catalogEntry.name,
          description: catalogEntry.description || "No description available",
          gap: score.actual_score - score.required_score
        };
      });

      // Initialize temp scores for editing
      const scoresObj = enrichedCompetencies.reduce((acc, curr) => {
        acc[curr.code] = curr.actual_score;
        return acc;
      }, {} as {[key: string]: number});
      
      setTempScores(scoresObj);

      setCompetencyData({
        employee: {
          employee_number: employeeNumber,
          employee_name: employee?.employee_name || "Unknown",
          department: user ? `Department ${user.departmentCode}` : "Unknown department",
          job_title: employee?.job_code || "Unknown position"
        },
        competencies: enrichedCompetencies
      });

      setShowCompetencyPopup(true);
      setEditingScores(false);
    } catch (error) {
      if (isApiError(error)) {
        if (error.response?.status === 401) {
          logout();
          window.location.href = "/login";
        }
        console.error("Error fetching competency data:", error);
      }
    } finally {
      setLoadingCompetencies(false);
    }
  };

  const handleScoreChange = (code: string, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      // Ensure score doesn't exceed 3
      const clampedValue = Math.min(Math.max(numValue, 0), 3);
      setTempScores(prev => ({
        ...prev,
        [code]: clampedValue
      }));
    }
  };

  const submitEvaluation = async () => {
    if (!competencyData || !user) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      };

      // Prepare the payload
      const payload = {
        employee_number: competencyData.employee.employee_number,
        evaluator_id: user.username,
        scores: Object.entries(tempScores).map(([code, score]) => ({
          competency_code: code,
          actual_score: score
        }))
      };

      await api.post("/evaluations", payload, config);

      // Update local state to reflect the evaluation
      setEmployees(prev => 
        prev.map(emp => 
          emp.employee_number === competencyData.employee.employee_number
            ? { 
                ...emp, 
                evaluation_status: true,
                evaluation_by: user.username,
                last_evaluated_date: new Date().toISOString()
              }
            : emp
        )
      );

      // Close the popup
      setShowCompetencyPopup(false);
    } catch (error) {
      if (isApiError(error)) {
        if (error.response?.status === 401) {
          logout();
          window.location.href = "/login";
        }
        console.error("Error submitting evaluation:", error);
        alert("Failed to submit evaluation. Please try again.");
      }
    }
  };

  const renderCompetencyPopup = () => {
    if (!showCompetencyPopup || !competencyData) return null;

    return (
      <div style={styles.popupOverlay}>
        <div style={styles.popupContent}>
          <div style={styles.popupHeader}>
            <h3>Competency Evaluation for {competencyData.employee.employee_name}</h3>
            <button 
              style={styles.closeButton}
              onClick={() => setShowCompetencyPopup(false)}
            >
              ×
            </button>
          </div>
          
          <div style={styles.employeeInfo}>
            <p><strong>Employee Number:</strong> {competencyData.employee.employee_number}</p>
            <p><strong>Department:</strong> {competencyData.employee.department}</p>
            <p><strong>Job Title:</strong> {competencyData.employee.job_title}</p>
          </div>
          
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
              {competencyData.competencies.map((comp) => (
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
                        max="3"
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
                    color: comp.gap >= 0 ? 'green' : 'red',
                    fontWeight: 'bold'
                  }}>
                    {comp.gap}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={styles.popupActions}>
            {!editingScores ? (
              <button 
                style={styles.editButton}
                onClick={() => setEditingScores(true)}
              >
                Evaluate
              </button>
            ) : (
              <>
                <button 
                  style={styles.submitButton}
                  onClick={submitEvaluation}
                >
                  Submit Evaluation
                </button>
                <button 
                  style={styles.cancelButton}
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

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Employee Evaluation (Department Manager)</h2>
      
      <div style={styles.filterContainer}>
        <input
          type="text"
          placeholder="Search by name or number..."
          value={searchTerm}
          onChange={handleSearch}
          style={styles.searchInput}
        />
        
        <select
          value={statusFilter}
          onChange={handleStatusFilter}
          style={styles.filterSelect}
        >
          <option value="all">All Statuses</option>
          <option value="evaluated">Evaluated</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th style={styles.th}>Employee Number</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Job Details</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <tr key={employee.employee_number} style={styles.tableRow}>
                <td style={styles.td}>{employee.employee_number}</td>
                <td style={styles.td}>{employee.employee_name}</td>
                <td style={styles.td}>{employee.job_code}</td>
                <td style={styles.td}>
                  <span style={{ 
                    color: employee.evaluation_status ? 'green' : 'red',
                    fontWeight: 'bold'
                  }}>
                    {employee.evaluation_status ? 'Evaluated' : 'Pending'}
                  </span>
                  {employee.evaluation_status && employee.evaluation_by && (
                    <div style={styles.evaluatorInfo}>
                      Evaluated by: {employee.evaluation_by}
                    </div>
                  )}
                </td>
                <td style={styles.td}>
                  <button 
                    style={styles.viewButton}
                    onClick={() => fetchEmployeeCompetencies(employee.employee_number)}
                    disabled={loadingCompetencies}
                  >
                    {loadingCompetencies ? 'Loading...' : 'Evaluate'}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                No employees match the current filters
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {renderCompetencyPopup()}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "1200px",
    margin: "80px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  filterContainer: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    alignItems: "center",
  },
  searchInput: {
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    flex: 1,
    maxWidth: "300px",
  },
  filterSelect: {
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ddd",
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
  viewButton: {
    padding: "6px 12px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  evaluatorInfo: {
    fontSize: "12px",
    color: "#666",
    marginTop: "4px",
  },
  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  popupContent: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    width: "80%",
    maxWidth: "900px",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  popupHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#666",
  },
  employeeInfo: {
    marginBottom: "20px",
    padding: "10px",
    backgroundColor: "#f9f9f9",
    borderRadius: "4px",
  },
  competencyTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  },
  competencyTh: {
    padding: "10px",
    borderBottom: "2px solid #ddd",
    textAlign: "left",
    backgroundColor: "#f2f2f2",
  },
  competencyTd: {
    padding: "10px",
    borderBottom: "1px solid #eee",
  },
  competencyDesc: {
    fontSize: "12px",
    color: "#666",
    marginTop: "4px",
  },
  scoreInput: {
    width: "60px",
    padding: "4px",
    border: "1px solid #ddd",
    borderRadius: "4px",
  },
  popupActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
    paddingTop: "10px",
    borderTop: "1px solid #eee",
  },
  editButton: {
    padding: "8px 16px",
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  submitButton: {
    padding: "8px 16px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  cancelButton: {
    padding: "8px 16px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default DepartmentManagerEvaluation;