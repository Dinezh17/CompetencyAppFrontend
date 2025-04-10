import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { configureApi } from "../interceptor/api";
import { AuthContext } from "../auth/AuthContext";

interface Competency {
  code: string;
  name: string;
  required_score: number;
  actual_score: number;
}
interface AllCompetency {
    code: string;
    name: string;
    required_score: number;
    description:string |""
  }
  
interface EmployeeDetails {
  employee_number: string;
  employee_name: string;
  department: string;
  role: string;
}

const EmployeeCompetencyAssignment: React.FC = () => {
  const { employeeNumber } = useParams<{ employeeNumber: string }>();
  const navigate = useNavigate();
  
  const [employee, setEmployee] = useState<EmployeeDetails | null>(null);
  const [assignedCompetencies, setAssignedCompetencies] = useState<Competency[]>([]);
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableCompetencies, setAvailableCompetencies] = useState<AllCompetency[]>([]);

  const { logout } = useContext(AuthContext)!;
  
  useEffect(() => {
    configureApi(logout);
  }, [logout]);
  
  // Function to fetch all data
  const fetchAllData = async () => {
    if (!employeeNumber) {
      navigate('/employees');
      return;
    }
    
    try {
      const [compsRes, empCompsRes, empDetailsRes] = await Promise.all([
        api.get("/competency"),
        api.get(`/employees/${employeeNumber}/assignedcompetencies`),
        api.get(`/employee/${employeeNumber}`)
      ]);

      setAssignedCompetencies(empCompsRes.data);
      setEmployee(empDetailsRes.data.employee);
      
      // Get available competencies (all competencies not assigned to employee)
      const assignedCodes = new Set(empCompsRes.data.map((c: Competency) => c.code));
      const available = compsRes.data.filter((c: Competency) => !assignedCodes.has(c.code));
      setAvailableCompetencies(available);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [employeeNumber, navigate]);

  const toggleCompetency = (code: string) => {
    setSelectedCompetencies(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const selectAll = (type: 'available' | 'assigned') => {
    if (type === 'available') {
      setSelectedCompetencies(availableCompetencies.map(c => c.code));
    } else {
      setSelectedCompetencies(assignedCompetencies.map(c => c.code));
    }
  };

  const clearSelection = () => {
    setSelectedCompetencies([]);
  };

  const handleAssign = async () => {
    if (!employeeNumber || selectedCompetencies.length === 0) return;

    try {
      // Filter only competencies that are not already assigned
      const competenciesToAssign = selectedCompetencies.filter(
        code => !assignedCompetencies.some(c => c.code === code)
      );
      
      if (competenciesToAssign.length === 0) return;
      
      await api.post(
        `/employees/${employeeNumber}/assigncompetencies`,
        competenciesToAssign
      );
      
      // Refresh data after assignment
      await fetchAllData();
      setSelectedCompetencies([]);
    } catch (error) {
      console.error("Error assigning competencies:", error);
    }
  };

  const handleRemove = async () => {
    if (!employeeNumber || selectedCompetencies.length === 0) return;

    try {
      // Filter only competencies that are currently assigned
      const competenciesToRemove = selectedCompetencies.filter(
        code => assignedCompetencies.some(c => c.code === code)
      );
      
      if (competenciesToRemove.length === 0) return;
      
      await api.delete(
        `/employees/${employeeNumber}/deletecompetencies`,
        { data: competenciesToRemove }
      );
      
      // Refresh data after removal
      await fetchAllData();
      setSelectedCompetencies([]);
    } catch (error) {
      console.error("Error removing competencies:", error);
    }
  };

  const goBackToEmployees = () => {
    navigate('/employees');
  };

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
    employeeInfo: {
      backgroundColor: '#f5f5f5',
      padding: '15px',
      borderRadius: '4px',
      marginBottom: '20px'
    },
    mainContent: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '20px'
    },
    section: {
      margin: '15px 0',
      minHeight: '250px',
      borderRadius: '4px'
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px',
      paddingBottom: '8px',
      borderBottom: '1px solid #ddd'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      border: '1px solid #eee',
    },
    tableHead: {
      border: '1px solid #eee',
      backgroundColor: '#f9f9f9',
    },
    tableHeadCell: {
      border: '1px solid #eee',
      padding: '12px 15px',
      textAlign: 'left' as const,
      fontWeight: 'bold',
      borderBottom: '2px solid #ddd'
    },
    tableCell: {
      border: '1px solid #eee',
      padding: '10px 15px',
      borderBottom: '1px solid #eee',
      textAlign: 'left' as const
    },
    tableRow: {
      border: '1px solid #eee',
    },
    checkbox: {
      cursor: 'pointer',
      width: '18px',
      height: '18px'
    },
    actionsContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '20px',
      paddingTop: '15px',
      borderTop: '1px solid #eee'
    },
    buttonGroup: {
      display: 'flex',
      gap: '10px'
    },
    button: {
      padding: '8px 12px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'bold'
    },
    actionButton: {
      padding: '10px 15px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'bold'
    },
    loading: {
      textAlign: 'center' as const,
      marginTop: '50px',
      fontSize: '18px'
    },
    noData: {
      padding: '15px',
      textAlign: 'center' as const,
      fontStyle: 'italic',
      color: '#777'
    },
    scoreCell: {
      textAlign: 'center' as const,
      width: '100px'
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!employee) return <div style={styles.noData}>Employee not found</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Manage Competencies for {employee.employee_name}</h2>
        <button 
          style={{ ...styles.button, backgroundColor: '#f5f5f5' }}
          onClick={goBackToEmployees}
        >
          Back to Employees
        </button>
      </div>

      <div style={styles.employeeInfo}>
        <p><strong>Employee Number:</strong> {employee.employee_number}</p>
        <p><strong>Department:</strong> {employee.department}</p>
        <p><strong>Role:</strong> {employee.role}</p>
      </div>

      <div style={styles.mainContent}>
        {/* Available Competencies Table */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3>Available Competencies</h3>
            <div style={styles.buttonGroup}>
              <button 
                style={{ ...styles.button, backgroundColor: '#e0e0e0' }}
                onClick={() => selectAll('available')}
                disabled={availableCompetencies.length === 0}
              >
                Select All
              </button>
              <button 
                style={{ ...styles.button, backgroundColor: '#e0e0e0' }}
                onClick={clearSelection}
                disabled={selectedCompetencies.length === 0}
              >
                Clear Selection
              </button>
            </div>
          </div>
          
          {availableCompetencies.length === 0 ? (
            <div style={styles.noData}>No available competencies</div>
          ) : (
            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr>
                  <th style={{...styles.tableHeadCell, width: '50px'}}></th>
                  <th style={{...styles.tableHeadCell, width: '120px'}}>Code</th>
                  <th style={styles.tableHeadCell}>Name</th>
                  <th style={styles.tableHeadCell}>Description</th>
                  <th style={{...styles.tableHeadCell, width: '100px'}}>Required Score</th>
                </tr>
              </thead>
              <tbody>
                {availableCompetencies.map(comp => (
                  <tr key={`available-${comp.code}`} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <input
                        type="checkbox"
                        id={`avail-${comp.code}`}
                        checked={selectedCompetencies.includes(comp.code)}
                        onChange={() => toggleCompetency(comp.code)}
                        style={styles.checkbox}
                      />
                    </td>

                    <td style={styles.tableCell}>
                      <strong>{comp.code}</strong>
                    </td>
                    <td style={styles.tableCell}>
                      <label htmlFor={`avail-${comp.code}`} style={{cursor: 'pointer'}}>
                        {comp.name + "||" +comp.description}
                      </label>
                    </td>
                    <td style={{...styles.tableCell, ...styles.scoreCell}}>
                      {comp.required_score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Assigned Competencies Table */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3>Assigned Competencies</h3>
            <div style={styles.buttonGroup}>
              <button 
                style={{ ...styles.button, backgroundColor: '#e0e0e0' }}
                onClick={() => selectAll('assigned')}
                disabled={assignedCompetencies.length === 0}
              >
                Select All
              </button>
              <button 
                style={{ ...styles.button, backgroundColor: '#e0e0e0' }}
                onClick={clearSelection}
                disabled={selectedCompetencies.length === 0}
              >
                Clear Selection
              </button>
            </div>
          </div>
          
          {assignedCompetencies.length === 0 ? (
            <div style={styles.noData}>No competencies assigned</div>
          ) : (
            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr>
                  <th style={{...styles.tableHeadCell, width: '50px'}}></th>
                  <th style={{...styles.tableHeadCell, width: '120px'}}>Code</th>
                  <th style={styles.tableHeadCell}>Name</th>
                  <th style={{...styles.tableHeadCell, width: '100px'}}>Required</th>
                  <th style={{...styles.tableHeadCell, width: '100px'}}>Actual</th>
                </tr>
              </thead>
              <tbody>
                {assignedCompetencies.map(comp => (
                  <tr key={`assigned-${comp.code}`} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <input
                        type="checkbox"
                        id={`assigned-${comp.code}`}
                        checked={selectedCompetencies.includes(comp.code)}
                        onChange={() => toggleCompetency(comp.code)}
                        style={styles.checkbox}
                      />
                    </td>
                    <td style={styles.tableCell}>
                      <strong>{comp.code}</strong>
                    </td>
                    <td style={styles.tableCell}>
                      <label htmlFor={`assigned-${comp.code}`} style={{cursor: 'pointer'}}>
                        {comp.name}
                      </label>
                    </td>
                    <td style={{...styles.tableCell, ...styles.scoreCell}}>
                      {comp.required_score}
                    </td>
                    <td style={{...styles.tableCell, ...styles.scoreCell}}>
                      {comp.actual_score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={styles.actionsContainer}>
          <div></div> {/* Empty div for spacing */}
          <div style={styles.buttonGroup}>
            <button 
              style={{ 
                ...styles.actionButton, 
                backgroundColor: selectedCompetencies.length === 0 || 
                  selectedCompetencies.every(c => assignedCompetencies.some(ac => ac.code === c)) 
                  ? '#ccc' : '#4CAF50', 
                color: 'white' 
              }}
              onClick={handleAssign}
              disabled={selectedCompetencies.length === 0 || 
                        selectedCompetencies.every(c => assignedCompetencies.some(ac => ac.code === c))}
            >
              Assign Selected
            </button>
            <button 
              style={{ 
                ...styles.actionButton, 
                backgroundColor: selectedCompetencies.length === 0 || 
                  selectedCompetencies.every(c => !assignedCompetencies.some(ac => ac.code === c)) 
                  ? '#ccc' : '#f44336', 
                color: 'white' 
              }}
              onClick={handleRemove}
              disabled={selectedCompetencies.length === 0 || 
                        selectedCompetencies.every(c => !assignedCompetencies.some(ac => ac.code === c))}
            >
              Remove Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCompetencyAssignment;