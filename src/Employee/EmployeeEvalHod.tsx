import React, { useState, useEffect, useContext } from "react";
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
}

interface Department {
  id: number;
  department_code: string;
  name: string;
}

interface Role {
  id: number;
  role_code: string;
  name: string;
}

const DepartmentManagerEvaluation: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { user } = useContext(AuthContext)!;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const [employeesRes, deptsRes, rolesRes] = await Promise.all([
          api.get<Employee[]>("/employees"),
          api.get<Department[]>("/departments"),
          api.get<Role[]>("/roles")
        ]);
        
        setEmployees(employeesRes.data);
        setFilteredEmployees(employeesRes.data);
        setDepartments(deptsRes.data);
        setRoles(rolesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchData();
  }, [user]);

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

  const viewEmployeeDetails = (employeeNumber: string) => {
    window.location.href = `/employee-eval-hod/${employeeNumber}`;

  };

  return (
    <div style={{...styles.container, marginTop: '80px'}}>
      <h2 style={styles.title}>Employee Evaluation (Department Manager)</h2>
      
      <div style={styles.filterContainer}>
        <input
          type="text"
          placeholder="Search by name or number"
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
      
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
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
                      {employee.evaluation_status && employee.evaluation_by && (
                        <div style={styles.evaluatorInfo}>
                          Evaluated by: {employee.evaluation_by}
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>{formattedDate}</td>
                    <td style={styles.td}>
                      <button 
                        style={styles.viewButton}
                        onClick={() => viewEmployeeDetails(employee.employee_number)}
                      >
                        View/Evaluate
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} style={styles.emptyMessage}>
                  No employees match the current filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Styles remain the same as in your original code
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "30px 20px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#2d3748",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  title: {
    fontSize: "28px",
    marginBottom: "28px",
    fontWeight: "600",
    color: "#1a365d",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  filterContainer: {
    display: "flex",
    gap: "16px",
    marginBottom: "28px",
    flexWrap: "wrap",
    backgroundColor: "white",
    padding: "16px",
    borderRadius: "8px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  searchInput: {
    padding: "10px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    flex: "1",
    minWidth: "240px",
    fontSize: "14px",
    transition: "all 0.2s",
    outline: "none",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)"
  },
  filterSelect: {
    padding: "10px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    minWidth: "180px",
    fontSize: "14px",
    backgroundColor: "#fff",
    cursor: "pointer",
    transition: "all 0.2s",
    outline: "none"
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: {
    padding: "16px",
    textAlign: "left",
    backgroundColor: "#f7fafc",
    color: "#4a5568",
    fontWeight: "600",
    borderBottom: "1px solid #e2e8f0"
  },
  td: {
    padding: "16px",
    borderBottom: "1px solid #e2e8f0",
    verticalAlign: "middle",
  },
  tableRow: {
    backgroundColor: "#fff",
    transition: "background-color 0.2s"
  },
  employeeName: {
    fontWeight: "600",
    color: "#2d3748",
  },
  employeeNumber: {
    fontSize: "12px",
    color: "#718096",
    marginTop: "4px",
  },
  statusBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  evaluatorInfo: {
    fontSize: "12px",
    color: "#718096",
    marginTop: "6px",
  },
  viewButton: {
    padding: "8px 14px",
    backgroundColor: "transparent",
    color: "#4299e1",
    border: "1px solid #4299e1",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  emptyMessage: {
    textAlign: "center",
    padding: "40px",
    color: "#718096",
    fontSize: "15px",
  }
};

export default DepartmentManagerEvaluation;