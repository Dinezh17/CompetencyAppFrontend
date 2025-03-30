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
  department_id: number;
}

interface Role {
  role_code: string;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [jobCode, setJobCode] = useState("");
  const [reportingEmployeeName, setReportingEmployeeName] = useState("");
  const [roleCode, setRoleCode] = useState("");
  const [departmentId, setDepartmentId] = useState<number>(0);
  const [editingEmployeeNumber, setEditingEmployeeNumber] = useState<string | null>(null);
  const { logout } = useContext(AuthContext)!;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        };

        const [employeesRes, rolesRes, deptsRes] = await Promise.all([
          api.get<Employee[]>("/employees", config),
          api.get<Role[]>("/roles", config),
          api.get<Department[]>("/departments", config)
        ]);
        
        setEmployees(employeesRes.data);
        setRoles(rolesRes.data);
        setDepartments(deptsRes.data);
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

  const handleSubmit = async () => {
    try {
      const employeeData = {
        employee_number: employeeNumber,
        employee_name: employeeName,
        job_code: jobCode,
        reporting_employee_name: reportingEmployeeName,
        role_code: roleCode,
        department_id: departmentId
      };

      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      };

      if (editingEmployeeNumber) {
        await api.put(`/employees/${editingEmployeeNumber}`, employeeData, config);
        setEmployees(prev => prev.map(e => 
          e.employee_number === editingEmployeeNumber ? { ...e, ...employeeData } : e
        ));
      } else {
        const response = await api.post("/employees", employeeData, config);
        setEmployees(prev => [...prev, response.data]);
      }
      closeModal();
    } catch (error) {
      if (isApiError(error)) {
        if (error.response?.status === 401) {
          logout();
          window.location.href = "/login";
        }
        console.error("Error saving employee:", error);
      }
    }
  };

  const handleDelete = async (employeeNumber: string) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        };
        await api.delete(`/employees/${employeeNumber}`, config);
        setEmployees(prev => prev.filter(e => e.employee_number !== employeeNumber));
      } catch (error) {
        if (isApiError(error)) {
          if (error.response?.status === 401) {
            logout();
            window.location.href = "/login";
          }
          console.error("Error deleting employee:", error);
        }
      }
    }
  };

  const openModal = (employee?: Employee) => {
    if (employee) {
      setEditingEmployeeNumber(employee.employee_number);
      setEmployeeNumber(employee.employee_number);
      setEmployeeName(employee.employee_name);
      setJobCode(employee.job_code);
      setReportingEmployeeName(employee.reporting_employee_name);
      setRoleCode(employee.role_code);
      setDepartmentId(employee.department_id);
    } else {
      setEditingEmployeeNumber(null);
      setEmployeeNumber("");
      setEmployeeName("");
      setJobCode("");
      setReportingEmployeeName("");
      setRoleCode("");
      setDepartmentId(0);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Employee Management</h2>
        <button style={styles.addButton} onClick={() => openModal()}>
          + Add Employee
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th style={styles.th}>Employee Number</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Job Code</th>
            <th style={styles.th}>Reporting To</th>
            <th style={styles.th}>Role</th>
            <th style={styles.th}>Department</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.employee_number} style={styles.tableRow}>
              <td style={styles.td}>{employee.employee_number}</td>
              <td style={styles.td}>{employee.employee_name}</td>
              <td style={styles.td}>{employee.job_code}</td>
              <td style={styles.td}>{employee.reporting_employee_name || '-'}</td>
              <td style={styles.td}>
                {roles.find(r => r.role_code === employee.role_code)?.name || employee.role_code}
              </td>
              <td style={styles.td}>
                {departments.find(d => d.id === employee.department_id)?.name || employee.department_id}
              </td>
              <td style={styles.td}>
                <button
                  style={styles.editButton}
                  onClick={() => openModal(employee)}
                >
                  Edit
                </button>
                <button
                  style={styles.deleteButton}
                  onClick={() => handleDelete(employee.employee_number)}
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
            <h3>{editingEmployeeNumber ? "Edit Employee" : "Add Employee"}</h3>
            
            <input
              type="text"
              placeholder="Employee Number"
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              style={styles.input}
              disabled={!!editingEmployeeNumber}
            />
            
            <input
              type="text"
              placeholder="Employee Name"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              style={styles.input}
            />
            
            <input
              type="text"
              placeholder="Job Code"
              value={jobCode}
              onChange={(e) => setJobCode(e.target.value)}
              style={styles.input}
            />
            
            <input
              type="text"
              placeholder="Reporting Employee Name (optional)"
              value={reportingEmployeeName}
              onChange={(e) => setReportingEmployeeName(e.target.value)}
              style={styles.input}
            />
            
            <select
              value={roleCode}
              onChange={(e) => setRoleCode(e.target.value)}
              style={styles.input}
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.role_code} value={role.role_code}>
                  {role.name}
                </option>
              ))}
            </select>
            
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(Number(e.target.value))}
              style={styles.input}
            >
              <option value="0">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            
            <div style={styles.modalButtons}>
              <button style={styles.saveButton} onClick={handleSubmit}>
                Save
              </button>
              <button style={styles.cancelButton} onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reuse the same styles object from CompetencyManagement
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "1200px",
    margin: "80px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
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
  editButton: {
    backgroundColor: "#008CBA",
    color: "white",
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    marginRight: "8px",
  },
  deleteButton: {
    backgroundColor: "#f44336",
    color: "white",
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    width: "400px",
    textAlign: "center",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxSizing: "border-box",
  },
  modalButtons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "15px",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    color: "black",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
};

export default EmployeeManagement;