import React, { useEffect, useState, useContext } from "react";
import api from "../interceptor/api";
import { AuthContext } from "../auth/AuthContext";
import { isApiError } from "../auth/errortypes";

interface EmployeeCompetency {
  id: number;
  employee_number: string;
  competency_code: string;
  required_score: number;
  actual_score: number | null;
  employee_name?: string; // Add optional employee_name field
}

interface Employee {
  employee_number: string;
  employee_name: string;
  // Add other employee fields if needed
}

const EmployeeCompetencyTable: React.FC = () => {
  const [data, setData] = useState<EmployeeCompetency[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { logout } = useContext(AuthContext)!;
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch employee competencies
        const competenciesResponse = await api.get("/employee-competencies", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        // Fetch all employees
        const employeesResponse = await api.get("/employees", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        setEmployees(employeesResponse.data);
        
        // Merge employee names with competencies data
        const mergedData = competenciesResponse.data.map((comp: EmployeeCompetency) => {
          const employee = employeesResponse.data.find(
            (emp: Employee) => emp.employee_number === comp.employee_number
          );
          return {
            ...comp,
            employee_name: employee ? employee.employee_name : 'Unknown'
          };
        });
        
        setData(mergedData);
      } catch (error) {
        if (isApiError(error)) {
          if (error.response?.status === 401) {
            logout();
            window.location.href = "/login";
          }
          console.error("Error fetching data:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [logout]);

  const styles = {
    container: {
      maxWidth: "1200px",
      margin: "40px auto",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
      marginTop: "80px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse" as const,
    },
    tableHeader: {
      backgroundColor: "#f5f5f5",
    },
    th: {
      padding: "12px",
      borderBottom: "1px solid #ddd",
      textAlign: "left" as const,
      fontWeight: 500,
    },
    td: {
      padding: "12px",
      borderBottom: "1px solid #eee",
    },
    loading: {
      textAlign: "center" as const,
      padding: "20px",
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h2>Employee Competencies</h2>
      <table style={styles.table}>
        <thead style={styles.tableHeader}>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Employee Number</th>
            <th style={styles.th}>Employee Name</th>
            <th style={styles.th}>Competency Code</th>
            <th style={styles.th}>Required Score</th>
            <th style={styles.th}>Actual Score</th>
            <th style={styles.th}>Gap</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td style={styles.td}>{row.id}</td>
              <td style={styles.td}>{row.employee_number}</td>
              <td style={styles.td}>{row.employee_name || 'N/A'}</td>
              <td style={styles.td}>{row.competency_code}</td>
              <td style={styles.td}>{row.required_score}</td>
              <td style={styles.td}>{row.actual_score ?? 0}</td>
              <td style={styles.td}>
                {row.required_score - (row.actual_score ?? 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeCompetencyTable;