import React, { useState } from "react";


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
  department: string;
  role: string;
}
const Home: React.FC = () => {
    const [employee, setEmployee] = useState<Employee | null>(null);
  
  const containerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f9f9f9",
  };

  const boxStyle: React.CSSProperties = {
    padding: "40px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
  };

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        <h1 style={titleStyle}>Competency Management App</h1>
      </div>
    </div>
  );
};

export default Home;
