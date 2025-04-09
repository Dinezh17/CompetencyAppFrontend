import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Define TypeScript interfaces for our data
interface CompetencyGap {
  competencyCode: string;
  competencyName: string;
  gap1: number;
  gap2: number;
  gap3: number;
  totalGapEmployees: number;
}

interface EmployeeGap {
  employeeNumber: string;
  requiredScore: number;
  actualScore: number;
  gap: number;
  employee_name?: string; // Add optional employee_name field
}

interface Employee {
  employee_number: string;
  employee_name: string;
  job_code: string;
  reporting_employee_name: string;
  role_code: string;
  department_code: string;
}

const CompetencyGapTable: React.FC = () => {
  const [competencyGaps, setCompetencyGaps] = useState<CompetencyGap[]>([]);
  const [employeeGaps, setEmployeeGaps] = useState<EmployeeGap[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedCompetency, setSelectedCompetency] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch competency gap data and employee data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch competency gaps
        const competencyResponse = await axios.get('http://127.0.0.1:8000/analytics/by-competency');
        setCompetencyGaps(competencyResponse.data);
        
        // Fetch all employees
        const employeeResponse = await axios.get("http://127.0.0.1:8000/employees", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }});
        setEmployees(employeeResponse.data);
       
        setError(null);
      } catch (err) {
        setError('Failed to fetch initial data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to fetch employee details for a specific competency and merge with employee names
  const fetchEmployeeDetails = async (competencyCode: string) => {
    try {
      setLoading(true);

      const response = await axios.get(`http://127.0.0.1:8000/analytics/details/by-competency/${competencyCode}`);
      
      // Merge the gap data with employee names
      const gapsWithNames = response.data.map((gap: EmployeeGap) => {
        const employee = employees.find(emp => emp.employee_number === gap.employeeNumber);
        return {
          ...gap,
          employee_name: employee ? employee.employee_name : 'Unknown'
        };
      });
      
      setEmployeeGaps(gapsWithNames);
      setSelectedCompetency(competencyCode);
      setShowDetails(true);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch employee details for competency ${competencyCode}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Close details modal
  const closeDetails = () => {
    setShowDetails(false);
  };

  // Determine the severity class based on the gap level
  const getGapSeverityClass = (gap: number) => {
    if (gap === 3) return 'bg-red-100';
    if (gap === 2) return 'bg-yellow-100';
    if (gap === 1) return 'bg-green-100';
    return '';
  };

  if (loading && competencyGaps.length === 0) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>;
  }

  if (error && competencyGaps.length === 0) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px',marginTop: '80px'  }}>Competency Gap Analysis</h1>
      
      {/* Main Competency Gap Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Competency Code</th>
              <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Competency Name</th>
              <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Gap Level 1</th>
              <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Gap Level 2</th>
              <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Gap Level 3</th>
              <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Total</th>
              <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {competencyGaps.map((gap) => (
              <tr key={gap.competencyCode} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{gap.competencyCode}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{gap.competencyName}</td>
                <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', backgroundColor: gap.gap1 > 0 ? '#e6ffec' : '' }}>{gap.gap1}</td>
                <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', backgroundColor: gap.gap2 > 0 ? '#fff9e6' : '' }}>{gap.gap2}</td>
                <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', backgroundColor: gap.gap3 > 0 ? '#ffebeb' : '' }}>{gap.gap3}</td>
                <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', fontWeight: 'bold',backgroundColor :"skyblue"  }}>{gap.totalGapEmployees}</td>
                <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                  <button 
                    onClick={() => fetchEmployeeDetails(gap.competencyCode)}
                    style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Employee Details Modal */}
      {showDetails && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            width: '80%',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>
                Employee Gaps for Competency: {selectedCompetency}
              </h2>
              <button
                onClick={closeDetails}
                style={{
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Loading employee details...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f0f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Employee Number</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Employee Name</th>
                    <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Required Score</th>
                    <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Actual Score</th>
                    <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeGaps.map((employee, index) => (
                    <tr key={index} style={{ backgroundColor: getGapSeverityClass(employee.gap) }}>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>{employee.employeeNumber}</td>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>{employee.employee_name || 'N/A'}</td>
                      <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>{employee.requiredScore}</td>
                      <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>{employee.actualScore}</td>
                      <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', fontWeight: 'bold' }}>{employee.gap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {employeeGaps.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '20px' }}>No employee gaps found for this competency</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetencyGapTable;