import React, { useEffect, useState } from "react";
import axios from "axios";

interface CompetencyScore {
  code: string;
  name:string;
  required_score: number;
  actual_score: number;
}

const MyScores: React.FC = () => {
  const [scores, setScores] = useState<CompetencyScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  
  useEffect(() => {
    const userData = localStorage.getItem('userData')
    if (userData){
    const parsedData = JSON.parse(userData);
    const fetchScores = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/employee-competencies/${parsedData.username}`
        );
        setScores(response.data);
      } catch (err) {
        setError("Failed to fetch scores.");
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }else{
    setScores(prev=>prev)
  }
    
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center",marginTop:"80px", marginBottom: "20px" }}>My Scores</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f4f4f4" }}>
            <th style={thStyle}>Competency Code</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Required Score</th>
            <th style={thStyle}>Actual Score</th>
            <th style={thStyle}>Gap</th>
     
          </tr>
        </thead>
        <tbody>
          {scores.map((item, index) => (
            <tr key={index}>
              <td style={tdStyle}>{item.code}</td>
              <td style={tdStyle}>{item.name}</td>
              <td style={tdStyle}>{item.required_score}</td>
              <td style={tdStyle}>{item.actual_score?item.actual_score:"-"}</td>
              <td style={tdStyle}>{item.actual_score?item.required_score-item.actual_score:"-"}</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "10px",
  textAlign: "left",
  fontSize:"20px",
  fontWeight: "bold",
};

const tdStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "left",
  fontSize:"20px"
};

export default MyScores;
