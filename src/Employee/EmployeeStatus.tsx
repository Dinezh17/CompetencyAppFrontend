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

interface Department {
  id: number;
  department_code: string;
  name: string;
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
  description: string;
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

const EmployeeEvaluation: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [competencyData, setCompetencyData] = useState<EmployeeCompetencyData | null>(null);
  const [showCompetencyPopup, setShowCompetencyPopup] = useState(false);
  const [loadingCompetencies, setLoadingCompetencies] = useState(false);
  const { logout } = useContext(AuthContext)!;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        };

        const [employeesRes, deptsRes, competenciesRes] = await Promise.all([
          api.get<Employee[]>("/employees", config),
          api.get<Department[]>("/departments", config),
          api.get<Competency[]>("/competency", config)
        ]);
        
        setEmployees(employeesRes.data);
        setFilteredEmployees(employeesRes.data);
        setDepartments(deptsRes.data);
        setCompetencies(competenciesRes.data);
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
  }, [logout]);

  useEffect(() => {
    applyFilters();
  }, [employees, searchTerm, departmentFilter, statusFilter]);

  const applyFilters = () => {
    let result = [...employees];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(emp => 
        emp.employee_number.toLowerCase().includes(term) || 
        emp.employee_name.toLowerCase().includes(term)
      );
    }

    if (departmentFilter !== "all") {
      result = result.filter(emp => emp.department_code === departmentFilter);
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

  const handleDepartmentFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDepartmentFilter(e.target.value);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const toggleSelectEmployee = (employeeNumber: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeNumber)
        ? prev.filter(num => num !== employeeNumber)
        : [...prev, employeeNumber]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.employee_number));
    }
    setSelectAll(!selectAll);
  };

  const markAsPending = async () => {
    if (selectedEmployees.length === 0) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      };

      await api.patch("/employees/evaluation-status", {
        employee_numbers: selectedEmployees,
        status: false
      }, config);

      setEmployees(prev => 
        prev.map(emp => 
          selectedEmployees.includes(emp.employee_number)
            ? { 
                ...emp, 
                evaluation_status: false,
                evaluation_by: undefined,
                last_evaluated_date: undefined
              }
            : emp
        )
      );

      setSelectedEmployees([]);
      setSelectAll(false);
    } catch (error) {
      if (isApiError(error)) {
        if (error.response?.status === 401) {
          logout();
          window.location.href = "/login";
        }
        console.error("Error updating evaluation status:", error);
      }
    }
  };

  const fetchEmployeeCompetencies = async (employeeNumber: string) => {
    setLoadingCompetencies(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      };

      const scoresResponse = await api.get<CompetencyScore[]>(
        `/employee-competencies/${employeeNumber}`,
        config
      );

      const employee = employees.find(e => e.employee_number === employeeNumber);
      const department = departments.find(d => d.department_code === employee?.department_code);

      const enrichedCompetencies = scoresResponse.data.map(score => {
        // Look up competency details from the fetched competencies data
        const competencyDetails = competencies.find(c => c.code === score.code) || {
          name: score.code,
          description: "No description available"
        };
        
        return {
          ...score,
          name: competencyDetails.name,
          description: competencyDetails.description,
          gap: score.actual_score - score.required_score
        };
      });

      setCompetencyData({
        employee: {
          employee_number: employeeNumber,
          employee_name: employee?.employee_name || "Unknown",
          department: department?.name || "Unknown department",
          job_title: employee?.job_code || "Unknown position"
        },
        competencies: enrichedCompetencies
      });

      setShowCompetencyPopup(true);
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

  const renderCompetencyPopup = () => {
    if (!showCompetencyPopup || !competencyData) return null;

    return (
      <div style={styles.popupOverlay}>
        <div style={styles.popupContent}>
          <div style={styles.popupHeader}>
            <h3>Competency Scores for {competencyData.employee.employee_name}</h3>
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
                  <td style={styles.competencyTd}>{comp.actual_score}</td>
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
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Employee Evaluation</h2>
      
      <div style={styles.filterContainer}>
        <input
          type="text"
          placeholder="Search by name or number..."
          value={searchTerm}
          onChange={handleSearch}
          style={styles.searchInput}
        />
        
        <select
          value={departmentFilter}
          onChange={handleDepartmentFilter}
          style={styles.filterSelect}
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept.department_code} value={dept.department_code}>
              {dept.name} ({dept.department_code})
            </option>
          ))}
        </select>
        
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
      
      <div style={styles.bulkActions}>
        <div style={styles.selectAllContainer}>
          <input
            type="checkbox"
            checked={selectAll}
            onChange={toggleSelectAll}
            style={styles.checkbox}
          />
          <span>Select All ({filteredEmployees.length})</span>
        </div>
        
        <div style={styles.selectedCount}>
          Selected: {selectedEmployees.length}
        </div>
        
        <button
          style={styles.bulkActionButton}
          onClick={markAsPending}
          disabled={selectedEmployees.length === 0}
        >
          Mark Selected as Pending
        </button>
      </div>
      
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th style={styles.th}>Select</th>
            <th style={styles.th}>Employee Number</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Department</th>
            <th style={styles.th}>Job Details</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <tr key={employee.employee_number} style={styles.tableRow}>
                <td style={styles.td}>
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(employee.employee_number)}
                    onChange={() => toggleSelectEmployee(employee.employee_number)}
                    style={styles.checkbox}
                  />
                </td>
                <td style={styles.td}>{employee.employee_number}</td>
                <td style={styles.td}>{employee.employee_name}</td>
                <td style={styles.td}>
                  {departments.find(d => d.department_code === employee.department_code)?.name || employee.department_code}
                </td>
                <td style={styles.td}>
                  {employee.job_code}
                  <button 
                    style={styles.viewButton}
                    onClick={() => fetchEmployeeCompetencies(employee.employee_number)}
                    disabled={loadingCompetencies}
                  >
                    {loadingCompetencies ? 'Loading...' : 'View Scores'}
                  </button>
                </td>
                <td style={styles.td}>
                  <span style={{ 
                    color: employee.evaluation_status ? 'green' : 'red',
                    fontWeight: 'bold'
                  }}>
                    {employee.evaluation_status ? 'Evaluated' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
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
  bulkActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    padding: "10px",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
  },
  selectAllContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  checkbox: {
    cursor: "pointer",
  },
  selectedCount: {
    fontWeight: "bold",
  },
  bulkActionButton: {
    padding: "8px 16px",
    backgroundColor: "#ff9800",
    color: "white",
    border: "none",
    borderRadius: "4px",
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
  viewButton: {
    marginLeft: "10px",
    padding: "4px 8px",
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
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
};

export default EmployeeEvaluation;