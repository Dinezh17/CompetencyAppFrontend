import { useEffect, useState } from "react";
import axios from "axios";

interface GapData {
  gap1: number;
  gap2: number;
  gap3: number;
}

interface DepartmentData {
  departmentCode: string;
  departmentName: string;
  employeeCount: number;
  gapData: GapData;
  evaluatedCount: number;
  notEvaluatedCount: number;
}

interface CompetencyData {
  competencyCode: string;
  competencyName: string;
  gapData: GapData;
}

interface DashboardData {
  totalEmployees: number;
  totalEvaluated: number;
  totalNotEvaluated: number;
  departmentData: DepartmentData[];
  competencyData: CompetencyData[];
}

const Statistics:React.FC =()=> {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:8000/analytics/dashboard")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, []);

  const renderBar = (value: number, color: string) => (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
      <div
        style={{
          height: "20px",
          width: `${value * 10}px`,
          backgroundColor: color,
          marginRight: "8px",
        }}
      />
      <span>{value}</span>
    </div>
  );

  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;
  if (!data) return <div style={{ padding: "20px", color: "red" }}>Error loading data</div>;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "24px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "20px", color: "#333" }}>📊 Analytics Dashboard</h1>

      {/* Summary */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "32px" }}>
        <div style={cardStyle}>
          <h3>Total Employees</h3>
          <p style={countStyle}>{data.totalEmployees}</p>
        </div>
        <div style={cardStyle}>
          <h3>Evaluated</h3>
          <p style={countStyle}>{data.totalEvaluated}</p>
        </div>
        <div style={cardStyle}>
          <h3>Not Evaluated</h3>
          <p style={countStyle}>{data.totalNotEvaluated}</p>
        </div>
      </div>

      {/* Department-wise */}
      <h2 style={{ fontSize: "22px", marginBottom: "12px", color: "#555" }}>🏢 Department-wise Gaps</h2>
      {data.departmentData.map((dept) => (
        <div key={dept.departmentCode} style={sectionStyle}>
          <h3 style={{ marginBottom: "4px" }}>{dept.departmentName}</h3>
          <div>Employees: {dept.employeeCount} | Evaluated: {dept.evaluatedCount} | Not Evaluated: {dept.notEvaluatedCount}</div>
          <div style={{ marginTop: "8px" }}>
            {renderBar(dept.gapData.gap1, "#4caf50")}
            {renderBar(dept.gapData.gap2, "#ff9800")}
            {renderBar(dept.gapData.gap3, "#f44336")}
          </div>
        </div>
      ))}

      {/* Competency-wise */}
      <h2 style={{ fontSize: "22px", margin: "32px 0 12px", color: "#555" }}>🧠 Competency-wise Gaps</h2>
      {data.competencyData.map((comp) => (
        <div key={comp.competencyCode} style={sectionStyle}>
          <h3 style={{ marginBottom: "4px" }}>{comp.competencyName}</h3>
          <div style={{ marginTop: "8px" }}>
            {renderBar(comp.gapData.gap1, "#4caf50")}
            {renderBar(comp.gapData.gap2, "#ff9800")}
            {renderBar(comp.gapData.gap3, "#f44336")}
          </div>
        </div>
      ))}
    </div>
  );
}

// Inline styles
const cardStyle: React.CSSProperties = {
  backgroundColor: "#f0f0f0",
  padding: "16px",
  borderRadius: "8px",
  width: "180px",
  textAlign: "center",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
};

const countStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
  marginTop: "8px",
};

const sectionStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  border: "1px solid #ddd",
  padding: "12px",
  borderRadius: "6px",
  marginBottom: "16px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
};

export default Statistics;
