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
}

interface Role {
  role_code: string;
  name: string;
}

interface Department {
  id: number;
  department_code: string;
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
  const [department_code, setDepartmentId] = useState<string>("");
  const [editingEmployeeNumber, setEditingEmployeeNumber] = useState<string | null>(null);
  const { logout } = useContext(AuthContext)!;

  useEffect(() => {
    configureApi(logout);
  }, [logout]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        

        const [employeesRes, rolesRes, deptsRes] = await Promise.all([
          api.get<Employee[]>("/employees"),
          api.get<Role[]>("/roles"),
          api.get<Department[]>("/departments")
        ]);
        
        setEmployees(employeesRes.data);
        setRoles(rolesRes.data);
        setDepartments(deptsRes.data);
      } catch (error) {
       
          console.error("Error fetching data:", error);
        
      }
    };
    
    fetchData();
  }, [logout]);

  const handleSubmit = async () => {
    if (!employeeNumber.trim() || !employeeName.trim() || !jobCode.trim() || !roleCode.trim() || !department_code.trim()) {
      alert("All required fields must be filled!");
      return;
    }

    try {
      const employeeData = {
        employee_number: employeeNumber,
        employee_name: employeeName,
        job_code: jobCode,
        reporting_employee_name: reportingEmployeeName,
        role_code: roleCode,
        department_code: department_code
      };

     

      if (editingEmployeeNumber) {
        await api.put(`/employees/${editingEmployeeNumber}`, employeeData);
        setEmployees(prev => prev.map(e => 
          e.employee_number === editingEmployeeNumber ? { ...e, ...employeeData } : e
        ));
      } else {
        const response = await api.post("/employees", employeeData);
        setEmployees(prev => [...prev, response.data]);
      }
      closeModal();
    } catch (error) {
      
        console.error("Error saving employee:", error);
      
    }
  };

  const handleDelete = async (employeeNumber: string) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
       
        await api.delete(`/employees/${employeeNumber}`);
        setEmployees(prev => prev.filter(e => e.employee_number !== employeeNumber));
      } catch (error) {
        
          console.error("Error deleting employee:", error);
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
      setDepartmentId(employee.department_code);
    } else {
      setEditingEmployeeNumber(null);
      setEmployeeNumber("");
      setEmployeeName("");
      setJobCode("");
      setReportingEmployeeName("");
      setRoleCode("");
      setDepartmentId("");
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // Simple styles
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
      border: '1px solid #ddd',
      textAlign: 'left' as const,
      fontWeight: 500
    },
    td: {
      padding: '12px',
      border: '1px solid #ddd',
    },
    button: {
      padding: '8px 12px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      marginRight: '8px'
    },
    addButton: {
      backgroundColor: '#4CAF50',
      color: 'white'
    },
    editButton: {
      backgroundColor: '#2196F3',
      color: 'white'
    },
    deleteButton: {
      backgroundColor: '#f44336',
      color: 'white'
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
      width: '500px',
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
    select: {
      width: '100%',
      padding: '10px',
      margin: '8px 0',
      border: '1px solid #ddd',
      borderRadius: '4px',
      backgroundColor: 'white'
    },
    modalFooter: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
      marginTop: '20px'
    },
    saveButton: {
      backgroundColor: '#4CAF50',
      color: 'white'
    },
    cancelButton: {
      backgroundColor: '#f5f5f5'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Employee Management</h2>
        <button 
          style={{ ...styles.button, ...styles.addButton }} 
          onClick={() => openModal()}
        >
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
            <tr key={employee.employee_number}>
              <td style={styles.td}>{employee.employee_number}</td>
              <td style={styles.td}>{employee.employee_name}</td>
              <td style={styles.td}>{employee.job_code}</td>
              <td style={styles.td}>{employee.reporting_employee_name || '-'}</td>
              <td style={styles.td}>
                {roles.find(r => r.role_code === employee.role_code)?.name || employee.role_code}
              </td>
              <td style={styles.td}>
                {departments.find(d => d.department_code === employee.department_code)?.name || employee.department_code}
              </td>
              <td style={styles.td}>
                <button
                  style={{ ...styles.button, ...styles.editButton }}
                  onClick={() => openModal(employee)}
                >
                  Edit
                </button>
                <button
                  style={{ ...styles.button, ...styles.deleteButton }}
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
              placeholder="Employee Number *"
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              style={styles.input}
              disabled={!!editingEmployeeNumber}
              required
            />
            
            <input
              type="text"
              placeholder="Employee Name *"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              style={styles.input}
              required
            />
            
            <input
              type="text"
              placeholder="Job Code *"
              value={jobCode}
              onChange={(e) => setJobCode(e.target.value)}
              style={styles.input}
              required
            />
            
            <input
              type="text"
              placeholder="Reporting Employee Name"
              value={reportingEmployeeName}
              onChange={(e) => setReportingEmployeeName(e.target.value)}
              style={styles.input}
            />
            
            <select
              value={roleCode}
              onChange={(e) => setRoleCode(e.target.value)}
              style={styles.select}
              required
            >
              <option value="">Select Role *</option>
              {roles.map((role) => (
                <option key={role.role_code} value={role.role_code}>
                  {role.name}
                </option>
              ))}
            </select>
            
            <select
              value={department_code}
              onChange={(e) => setDepartmentId(e.target.value)}
              style={styles.select}
              required
            >
              <option value="">Select Department *</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.department_code}>
                  {dept.name}
                </option>
              ))}
            </select>
            
            <div style={styles.modalFooter}>
              <button 
                style={{ ...styles.button, ...styles.saveButton }}
                onClick={handleSubmit}
              >
                Save
              </button>
              <button 
                style={{ ...styles.button, ...styles.cancelButton }}
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

export default EmployeeManagement;