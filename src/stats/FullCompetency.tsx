// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// // Define TypeScript interfaces for our data
// interface EmployeeCompetency {
//   id: number;
//   employee_number: string;
//   competency_code: string;
//   required_score: number;
//   actual_score: number;
//   gap?: number; // This will be calculated
//   employee_name?: string; // Optional if you want to include names
//   competency_name?: string; // Optional if you want to include names
// }

// const EmployeeCompetenciesTable: React.FC = () => {
//   const [competencies, setCompetencies] = useState<EmployeeCompetency[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);

//   // Fetch employee competency data
//   useEffect(() => {
//     const fetchEmployeeCompetencies = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get('http://127.0.0.1:8000/employee-competencies');
        
//         // Calculate gap for each record
//         const dataWithGap = response.data.map((item: EmployeeCompetency) => ({
//           ...item,
//           gap: item.required_score - item.actual_score
//         }));
        
//         setCompetencies(dataWithGap);
//         setError(null);
//       } catch (err) {
//         setError('Failed to fetch employee competency data');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEmployeeCompetencies();
//   }, []);

//   // Group competencies by employee
//   const groupByEmployee = () => {
//     const grouped: Record<string, EmployeeCompetency[]> = {};
    
//     competencies.forEach(comp => {
//       if (!grouped[comp.employee_number]) {
//         grouped[comp.employee_number] = [];
//       }
//       grouped[comp.employee_number].push(comp);
//     });
    
//     return grouped;
//   };

//   // Toggle expand/collapse for employee details
//   const toggleEmployee = (employeeNumber: string) => {
//     if (expandedEmployee === employeeNumber) {
//       setExpandedEmployee(null);
//     } else {
//       setExpandedEmployee(employeeNumber);
//     }
//   };

//   // Determine the severity class based on the gap level
//   const getGapSeverityClass = (gap: number) => {
//     if (gap > 2) return 'bg-red-100';
//     if (gap > 0) return 'bg-yellow-100';
//     return 'bg-green-100';
//   };

//   if (loading && competencies.length === 0) {
//     return <div className="text-center p-5">Loading...</div>;
//   }

//   if (error && competencies.length === 0) {
//     return <div className="text-red-500 text-center p-5">{error}</div>;
//   }

//   const groupedCompetencies = groupByEmployee();

//   return (
//     <div className="p-5 font-sans">
//       <h1 className="text-2xl mb-5">Employee Competencies</h1>
      
//       {/* Main Employee Competency Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse mb-5">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="p-3 text-left border">Employee Number</th>
//               <th className="p-3 text-left border">Competencies Count</th>
//               <th className="p-3 text-center border">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {Object.entries(groupedCompetencies).map(([employeeNumber, comps]) => (
//               <React.Fragment key={employeeNumber}>
//                 <tr className="border-b">
//                   <td className="p-3 border">{employeeNumber}</td>
//                   <td className="p-3 border">{comps.length}</td>
//                   <td className="p-3 border text-center">
//                     <button 
//                       onClick={() => toggleEmployee(employeeNumber)}
//                       className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
//                     >
//                       {expandedEmployee === employeeNumber ? 'Hide' : 'Show'} Details
//                     </button>
//                   </td>
//                 </tr>
                
//                 {/* Expanded details row */}
//                 {expandedEmployee === employeeNumber && (
//                   <tr>
//                     <td colSpan={3} className="p-3 border">
//                       <div className="ml-5">
//                         <h3 className="text-lg font-semibold mb-2">Competency Details</h3>
//                         <table className="w-full border-collapse">
//                           <thead>
//                             <tr className="bg-gray-50">
//                               <th className="p-2 text-left border">Competency Code</th>
//                               <th className="p-2 text-center border">Required Score</th>
//                               <th className="p-2 text-center border">Actual Score</th>
//                               <th className="p-2 text-center border">Gap</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {comps.map((comp) => (
//                               <tr 
//                                 key={comp.id} 
//                                 className={getGapSeverityClass(comp.gap || 0)}
//                               >
//                                 <td className="p-2 border">{comp.competency_code}</td>
//                                 <td className="p-2 text-center border">{comp.required_score}</td>
//                                 <td className="p-2 text-center border">{comp.actual_score}</td>
//                                 <td className="p-2 text-center border font-semibold">
//                                   {comp.gap}
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     </td>
//                   </tr>
//                 )}
//               </React.Fragment>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default EmployeeCompetenciesTable;
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
}

const EmployeeCompetencyTable: React.FC = () => {
  const [data, setData] = useState<EmployeeCompetency[]>([]);
  const { logout } = useContext(AuthContext)!;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/employee-competencies", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setData(response.data);
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
  };

  return (
    <div style={styles.container}>
      <h2>Employee Competencies</h2>
      <table style={styles.table}>
        <thead style={styles.tableHeader}>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Employee Number</th>
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
