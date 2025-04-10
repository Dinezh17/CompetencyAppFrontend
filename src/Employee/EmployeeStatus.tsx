import React, { useState, useEffect, useContext } from "react";
import api, { configureApi } from "../interceptor/api";
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
  role_code: string;
  name: string;
}

const EmployeeEvaluation: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { logout } = useContext(AuthContext)!;

  useEffect(() => {
    configureApi(logout);
  }, [logout]);

  useEffect(() => {
    const fetchData = async () => {
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
      await api.patch("/employees/evaluation-status", {
        employee_numbers: selectedEmployees,
        status: false
      });

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
      console.error("Error updating evaluation status:", error);
    }
  };

  const viewEmployeeDetails = (employeeNumber: string) => {
    setLoadingDetails(true);
    window.location.href = `/employee-details/${employeeNumber}`;

  };

  return (
    <div style={{...styles.container, marginTop: '80px' }}>
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
                        onClick={() => viewEmployeeDetails(employee.employee_number)}
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
  actionBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  selectAllContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    cursor: "pointer",
    accentColor: "#4299e1",
  },
  selectLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#4a5568",
    cursor: "pointer",
  },
  actionGroup: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  selectedCount: {
    fontSize: "14px",
    color: "#4a5568",
    fontWeight: "500",
    backgroundColor: "#edf2f7",
    padding: "6px 12px",
    borderRadius: "20px",
  },
  actionButton: {
    padding: "10px 20px",
    backgroundColor: "#e53e3e",
    color: "white",
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
    border: '1px solid #ddd',
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

export default EmployeeEvaluation;