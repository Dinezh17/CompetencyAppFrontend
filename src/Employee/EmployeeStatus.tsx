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

interface Role {
  role_code: string;
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

interface EmployeeDetails {
  employee: Employee;
  department: string;
  role: string;
  competencies: CompetencyDisplay[];
}

const EmployeeEvaluation: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [employeeDetails, setEmployeeDetails] = useState<EmployeeDetails | null>(null);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { logout } = useContext(AuthContext)!;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        };

        const [employeesRes, deptsRes, rolesRes, competenciesRes] = await Promise.all([
          api.get<Employee[]>("/employees", config),
          api.get<Department[]>("/departments", config),
          api.get<Role[]>("/roles", config),
          api.get<Competency[]>("/competency", config)
        ]);
        
        setEmployees(employeesRes.data);
        setFilteredEmployees(employeesRes.data);
        setDepartments(deptsRes.data);
        setRoles(rolesRes.data);
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

  const fetchEmployeeDetails = async (employeeNumber: string) => {
    setLoadingDetails(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      };

      // Fetch competency scores
      const scoresResponse = await api.get<CompetencyScore[]>(
        `/employee-competencies/${employeeNumber}`,
        config
      );

      const employee = employees.find(e => e.employee_number === employeeNumber);
      if (!employee) return;

      const department = departments.find(d => d.department_code === employee.department_code);
      const role = roles.find(r => r.role_code === employee.role_code);

      const enrichedCompetencies = scoresResponse.data.map(score => {
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

      setEmployeeDetails({
        employee,
        department: department?.name || employee.department_code,
        role: role?.name || employee.role_code,
        competencies: enrichedCompetencies
      });

      setShowDetailsPopup(true);
    } catch (error) {
      if (isApiError(error)) {
        if (error.response?.status === 401) {
          logout();
          window.location.href = "/login";
        }
        console.error("Error fetching employee details:", error);
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  const renderDetailsPopup = () => {
    if (!showDetailsPopup || !employeeDetails) return null;

    const formatDate = (dateString?: string) => {
      if (!dateString) return "Not evaluated";
      return new Date(dateString).toLocaleDateString();
    };

    return (
      <div style={styles.popupOverlay}>
        <div style={styles.popupContent}>
          <div style={styles.popupHeader}>
            <h3>Employee Details</h3>
            <button 
              style={styles.closeButton}
              onClick={() => setShowDetailsPopup(false)}
            >
              ×
            </button>
          </div>
          
          <div style={styles.detailsSection}>
            <h4 style={styles.sectionTitle}>Basic Information</h4>
            <div style={styles.detailsGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Employee Number:</span>
                <span>{employeeDetails.employee.employee_number}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Name:</span>
                <span>{employeeDetails.employee.employee_name}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Job Code:</span>
                <span>{employeeDetails.employee.job_code}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Reporting To:</span>
                <span>{employeeDetails.employee.reporting_employee_name || 'N/A'}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Department:</span>
                <span>{employeeDetails.department}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Role:</span>
                <span>{employeeDetails.role}</span>
              </div>
            </div>
          </div>

          <div style={styles.detailsSection}>
            <h4 style={styles.sectionTitle}>Evaluation Status</h4>
            <div style={styles.detailsGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Status:</span>
                <span style={{
                  color: employeeDetails.employee.evaluation_status ? '#2E7D32' : '#C62828',
                  fontWeight: '500'
                }}>
                  {employeeDetails.employee.evaluation_status ? 'Evaluated' : 'Pending'}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Evaluated By:</span>
                <span>{employeeDetails.employee.evaluation_by || 'N/A'}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Last Evaluated:</span>
                <span>{formatDate(employeeDetails.employee.last_evaluated_date)}</span>
              </div>
            </div>
          </div>

          <div style={styles.detailsSection}>
            <h4 style={styles.sectionTitle}>Competency Scores</h4>
            <table style={styles.competencyTable}>
              <thead>
                <tr>
                  <th style={styles.competencyTh}>Competency</th>
                  <th style={styles.competencyTh}>Required</th>
                  <th style={styles.competencyTh}>Actual</th>
                  <th style={styles.competencyTh}>Gap</th>
                </tr>
              </thead>
              <tbody>
                {employeeDetails.competencies.map((comp) => (
                  <tr key={comp.code}>
                    <td style={styles.competencyTd}>
                      <div><strong>{comp.name}</strong> ({comp.code})</div>
                      <div style={styles.competencyDesc}>{comp.description}</div>
                    </td>
                    <td style={styles.competencyTd}>{comp.required_score}</td>
                    <td style={styles.competencyTd}>{comp.actual_score}</td>
                    <td style={{
                      ...styles.competencyTd,
                      color: comp.gap >= 0 ? '#4CAF50' : '#F44336',
                    }}>
                      {comp.gap}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          placeholder="Search by name or number"
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
              {dept.name}
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
      
      <div style={styles.actionBar}>
        <div style={styles.selectAllContainer}>
          <input
            type="checkbox"
            checked={selectAll}
            onChange={toggleSelectAll}
            style={styles.checkbox}
            id="selectAll"
          />
          <label htmlFor="selectAll" style={styles.selectLabel}>
            Select All ({filteredEmployees.length})
          </label>
        </div>
        
        <div style={styles.actionGroup}>
          <span style={styles.selectedCount}>
            {selectedEmployees.length} selected
          </span>
          
          <button
            style={{
              ...styles.actionButton,
              opacity: selectedEmployees.length === 0 ? 0.5 : 1,
              cursor: selectedEmployees.length === 0 ? 'not-allowed' : 'pointer'
            }}
            onClick={markAsPending}
            disabled={selectedEmployees.length === 0}
          >
            Mark as Pending
          </button>
        </div>
      </div>
      
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}></th>
              <th style={styles.th}>Employee</th>
              <th style={styles.th}>Job Code</th>
              <th style={styles.th}>Reporting To</th>
              <th style={styles.th}>Department</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Last Evaluated</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => {
                const deptName = departments.find(d => d.department_code === employee.department_code)?.name || employee.department_code;
                const roleName = roles.find(r => r.role_code === employee.role_code)?.name || employee.role_code;
                const formattedDate = employee.last_evaluated_date 
                  ? new Date(employee.last_evaluated_date).toLocaleDateString() 
                  : 'N/A';

                return (
                  <tr key={employee.employee_number} style={styles.tableRow}>
                    <td style={styles.td}>
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee.employee_number)}
                        onChange={() => toggleSelectEmployee(employee.employee_number)}
                        style={styles.checkbox}
                        id={`employee-${employee.employee_number}`}
                      />
                    </td>
                    <td style={styles.td}>
                      <div style={styles.employeeName}>{employee.employee_name}</div>
                      <div style={styles.employeeNumber}>{employee.employee_number}</div>
                    </td>
                    <td style={styles.td}>{employee.job_code}</td>
                    <td style={styles.td}>{employee.reporting_employee_name || 'N/A'}</td>
                    <td style={styles.td}>{deptName}</td>
                    <td style={styles.td}>{roleName}</td>
                    <td style={styles.td}>
                      <span style={{ 
                        ...styles.statusBadge,
                        backgroundColor: employee.evaluation_status ? '#E8F5E9' : '#FFEBEE',
                        color: employee.evaluation_status ? '#2E7D32' : '#C62828',
                      }}>
                        {employee.evaluation_status ? 'Evaluated' : 'Pending'}
                      </span>
                    </td>
                    <td style={styles.td}>{formattedDate}</td>
                    <td style={styles.td}>
                      <button 
                        style={styles.viewButton}
                        onClick={() => fetchEmployeeDetails(employee.employee_number)}
                        disabled={loadingDetails}
                      >
                        {loadingDetails ? '...' : 'Details'}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} style={styles.emptyMessage}>
                  No employees match the current filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {renderDetailsPopup()}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "80px 20px 20px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#333",
  },
  title: {
    fontSize: "24px",
    marginBottom: "24px",
    fontWeight: "500",
  },
  filterContainer: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  searchInput: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    flex: "1",
    minWidth: "240px",
    fontSize: "14px",
  },
  filterSelect: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    minWidth: "160px",
    fontSize: "14px",
    backgroundColor: "#fff",
  },
  actionBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    padding: "12px 0",
    borderBottom: "1px solid #eee",
  },
  selectAllContainer: {
    display: "flex",
    alignItems: "center",
  },
  checkbox: {
    marginRight: "8px",
    width: "16px",
    height: "16px",
  },
  selectLabel: {
    fontSize: "14px",
    cursor: "pointer",
  },
  actionGroup: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  selectedCount: {
    fontSize: "14px",
    color: "#666",
  },
  actionButton: {
    padding: "8px 16px",
    backgroundColor: "#f0f0f0",
    color: "#333",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "500",
  },
  tableContainer: {
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    borderRadius: "6px",
    overflow: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    borderBottom: "1px solid #eee",
    fontWeight: "500",
    color: "#666",
    backgroundColor: "#fafafa",
  },
  td: {
    padding: "12px 16px",
    borderBottom: "1px solid #eee",
    verticalAlign: "middle",
  },
  tableRow: {
    backgroundColor: "#fff",
    // '&:hover': {
    //   backgroundColor: "#f9f9f9",
    // },
  },
  employeeName: {
    fontWeight: "500",
  },
  employeeNumber: {
    fontSize: "12px",
    color: "#666",
    marginTop: "2px",
  },
  statusBadge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
  },
  viewButton: {
    padding: "6px 12px",
    backgroundColor: "transparent",
    color: "#2196F3",
    border: "1px solid #2196F3",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
  },
  emptyMessage: {
    textAlign: "center",
    padding: "24px",
    color: "#666",
  },
  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  popupContent: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "8px",
    width: "90%",
    maxWidth: "900px",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  },
  popupHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#999",
  },
  detailsSection: {
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "500",
    marginBottom: "12px",
    color: "#444",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  },
  detailItem: {
    display: "flex",
    flexDirection: "column",
  },
  detailLabel: {
    fontSize: "12px",
    color: "#666",
    marginBottom: "4px",
  },
  competencyTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  competencyTh: {
    padding: "12px 16px",
    textAlign: "left",
    borderBottom: "1px solid #eee",
    color: "#666",
  },
  competencyTd: {
    padding: "12px 16px",
    borderBottom: "1px solid #eee",
  },
  competencyDesc: {
    fontSize: "12px",
    color: "#666",
    marginTop: "4px",
    lineHeight: "1.4",
  },
};

export default EmployeeEvaluation;