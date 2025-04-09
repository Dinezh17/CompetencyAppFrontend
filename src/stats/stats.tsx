import { useContext, useEffect, useState } from "react";
import api, { configureApi } from "../interceptor/api";
import { AuthContext } from "../auth/AuthContext";

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

type GapTotal = {
  gap1: number;
  gap2: number;
  gap3: number;
};

// Function to calculate total department gaps
const calculateTotalDepartmentGaps = (departments?: DepartmentData[]): GapTotal => {
  const total = { gap1: 0, gap2: 0, gap3: 0 };
  if (!departments) return total;

  for (const dept of departments) {
    total.gap1 += dept.gapData.gap1;
    total.gap2 += dept.gapData.gap2;
    total.gap3 += dept.gapData.gap3;
  }

  return total;
};

// Function to calculate total competency gaps
const calculateTotalCompetencyGaps = (competencies?: CompetencyData[]): GapTotal => {
  const total = { gap1: 0, gap2: 0, gap3: 0 };
  if (!competencies) return total;

  for (const comp of competencies) {
    total.gap1 += comp.gapData.gap1;
    total.gap2 += comp.gapData.gap2;
    total.gap3 += comp.gapData.gap3;
  }

  return total;
};

const Statistics: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"departments" | "competencies">("departments");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedCompetency, setSelectedCompetency] = useState<string>("all");
  const {logout} = useContext(AuthContext)!
  useEffect(() => {
    configureApi(logout);
  }, [logout]);

  useEffect(() => {
    api
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

  const renderVerticalGapBars = (gapData: GapData) => {
    // Fixed height for the chart container
    const chartHeight = 250;
    const barWidth = 60;
    
    // Find the maximum value to establish scale
    const maxValue = Math.max(gapData.gap1, gapData.gap2, gapData.gap3, 1);

    // Calculate heights based on percentage
    const calculateBarHeight = (value: number) => {
      return value > 0 ? Math.max((value / maxValue) * 180, 10) : 0; // Minimum 10px for visibility if value > 0
    };

    const barHeights = {
      gap1: calculateBarHeight(gapData.gap1),
      gap2: calculateBarHeight(gapData.gap2),
      gap3: calculateBarHeight(gapData.gap3)
    };

    return (
      <div style={{
        marginTop: "20px",
        padding: "10px",
        height: `${chartHeight}px`,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end"
      }}>
        {/* Gap 1 Bar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0 20px" }}>
          <div style={{ position: "relative", height: "200px", width: barWidth, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ 
              fontWeight: "bold", 
              marginBottom: "5px", 
              textAlign: "center"
            }}>
              {gapData.gap1}
            </div>
            {gapData.gap1 > 0 ? (
              <div style={{ 
                width: "100%", 
                height: `${barHeights.gap1}px`, 
                backgroundColor: "#4caf50", 
                borderRadius: "4px 4px 0 0"
              }}></div>
            ) : (
              <div style={{ 
                width: "100%", 
                height: "1px", 
                backgroundColor: "#e0e0e0", 
                borderRadius: "4px 4px 0 0"
              }}></div>
            )}
          </div>
          <div style={{ marginTop: "10px", fontSize: "14px", fontWeight: "500" }}>1</div>
        </div>
        
        {/* Gap 2 Bar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0 20px" }}>
          <div style={{ position: "relative", height: "200px", width: barWidth, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ 
              fontWeight: "bold", 
              marginBottom: "5px", 
              textAlign: "center"
            }}>
              {gapData.gap2}
            </div>
            {gapData.gap2 > 0 ? (
              <div style={{ 
                width: "100%", 
                height: `${barHeights.gap2}px`, 
                backgroundColor: "#ff9800", 
                borderRadius: "4px 4px 0 0"
              }}></div>
            ) : (
              <div style={{ 
                width: "100%", 
                height: "1px", 
                backgroundColor: "#e0e0e0", 
                borderRadius: "4px 4px 0 0"
              }}></div>
            )}
          </div>
          <div style={{ marginTop: "10px", fontSize: "14px", fontWeight: "500" }}>2</div>
        </div>
        
        {/* Gap 3 Bar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0 20px" }}>
          <div style={{ position: "relative", height: "200px", width: barWidth, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ 
              fontWeight: "bold", 
              marginBottom: "5px", 
              textAlign: "center"
            }}>
              {gapData.gap3}
            </div>
            {gapData.gap3 > 0 ? (
              <div style={{ 
                width: "100%", 
                height: `${barHeights.gap3}px`, 
                backgroundColor: "#f44336", 
                borderRadius: "4px 4px 0 0"
              }}></div>
            ) : (
              <div style={{ 
                width: "100%", 
                height: "1px", 
                backgroundColor: "#e0e0e0", 
                borderRadius: "4px 4px 0 0"
              }}></div>
            )}
          </div>
          <div style={{ marginTop: "10px", fontSize: "14px", fontWeight: "500" }}>3</div>
        </div>
      </div>
    );
  };

  if (loading) return <div style={loadingStyle}>Loading dashboard data...</div>;
  if (!data) return <div style={errorStyle}>Error loading data. Please try again later.</div>;

  const departmentsToShow = selectedDepartment === "all" 
    ? data.departmentData 
    : data.departmentData.filter(dept => dept.departmentCode === selectedDepartment);

  const competenciesToShow = selectedCompetency === "all"
    ? data.competencyData
    : data.competencyData.filter(comp => comp.competencyCode === selectedCompetency);

  const allDepartmentsGapData = calculateTotalDepartmentGaps(data.departmentData);
  const allCompetenciesGapData = calculateTotalCompetencyGaps(data.competencyData);

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>
        <span style={{ marginRight: "10px",marginTop: '80px'  }}>📊</span>
        Analytics Dashboard
      </h1>

      {/* Summary Cards */}
      <div style={cardsContainerStyle}>
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Total Employees</h3>
          <p style={countStyle}>{data.totalEmployees}</p>
        </div>
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Evaluated</h3>
          <p style={countStyle}>{data.totalEvaluated}</p>
          <span style={percentageStyle}>
            {((data.totalEvaluated / data.totalEmployees) * 100).toFixed(1)}%
          </span>
        </div>
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Not Evaluated</h3>
          <p style={countStyle}>{data.totalNotEvaluated}</p>
          <span style={percentageStyle}>
            {((data.totalNotEvaluated / data.totalEmployees) * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={tabsContainerStyle}>
        <button 
          style={{
            ...tabStyle,
            backgroundColor: activeTab === "departments" ? "#3498db" : "#e0e0e0",
            color: activeTab === "departments" ? "white" : "#333",
          }}
          onClick={() => setActiveTab("departments")}
        >
          🏢 Departments
        </button>
        <button 
          style={{
            ...tabStyle,
            backgroundColor: activeTab === "competencies" ? "#3498db" : "#e0e0e0",
            color: activeTab === "competencies" ? "white" : "#333",
          }}
          onClick={() => setActiveTab("competencies")}
        >
          🧠 Competencies
        </button>
      </div>

      {/* Department Section */}
      {activeTab === "departments" && (
        <div style={sectionContainerStyle}>
          <div style={selectorContainerStyle}>
            <label style={selectorLabelStyle}>Select Department:</label>
            <select 
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)}
              style={selectorStyle}
            >
              <option value="all">All Departments</option>
              {data.departmentData.map(dept => (
                <option key={dept.departmentCode} value={dept.departmentCode}>
                  {dept.departmentName}
                </option>
              ))}
            </select>
          </div>

          {/* All Departments Summary */}
          {selectedDepartment === "all" && (
            <div style={summaryCardStyle}>
              <h3 style={summaryTitleStyle}>All Departments Summary</h3>
              <div style={statsContainerStyle}>
                <div style={statStyle}>
                  <span style={statLabelStyle}>Total Departments:</span>
                  <span style={statValueStyle}>{data.departmentData.length}</span>
                </div>
                <div style={statStyle}>
                  <span style={statLabelStyle}>Total Employees:</span>
                  <span style={statValueStyle}>{data.totalEmployees}</span>
                </div>
              </div>
              {renderVerticalGapBars(allDepartmentsGapData)}
            </div>
          )}

          {/* Individual Department Cards */}
          {departmentsToShow.map((dept) => (
            <div key={dept.departmentCode} style={detailCardStyle}>
              <h3 style={detailTitleStyle}>{dept.departmentName}</h3>
              <div style={statsContainerStyle}>
                <div style={statStyle}>
                  <span style={statLabelStyle}>Employees:</span>
                  <span style={statValueStyle}>{dept.employeeCount}</span>
                </div>
                <div style={statStyle}>
                  <span style={statLabelStyle}>Evaluated:</span>
                  <span style={statValueStyle}>{dept.evaluatedCount}</span>
                </div>
                <div style={statStyle}>
                  <span style={statLabelStyle}>Not Evaluated:</span>
                  <span style={statValueStyle}>{dept.notEvaluatedCount}</span>
                </div>
              </div>
              {renderVerticalGapBars(dept.gapData)}
            </div>
          ))}
        </div>
      )}

      {/* Competency Section */}
      {activeTab === "competencies" && (
        <div style={sectionContainerStyle}>
          <div style={selectorContainerStyle}>
            <label style={selectorLabelStyle}>Select Competency:</label>
            <select 
              value={selectedCompetency} 
              onChange={(e) => setSelectedCompetency(e.target.value)}
              style={selectorStyle}
            >
              <option value="all">All Competencies</option>
              {data.competencyData.map(comp => (
                <option key={comp.competencyCode} value={comp.competencyCode}>
                  {comp.competencyName}
                </option>
              ))}
            </select>
          </div>

          {/* All Competencies Summary */}
          {selectedCompetency === "all" && (
            <div style={summaryCardStyle}>
              <h3 style={summaryTitleStyle}>All Competencies Summary</h3>
              <div style={statsContainerStyle}>
                <div style={statStyle}>
                  <span style={statLabelStyle}>Total Competencies:</span>
                  <span style={statValueStyle}>{data.competencyData.length}</span>
                </div>
              </div>
              {renderVerticalGapBars(allCompetenciesGapData)}
            </div>
          )}

          {/* Individual Competency Cards */}
          {competenciesToShow.map((comp) => (
            <div key={comp.competencyCode} style={detailCardStyle}>
              <h3 style={detailTitleStyle}>{comp.competencyName}</h3>
              {renderVerticalGapBars(comp.gapData)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Enhanced Styles
const containerStyle: React.CSSProperties = {
  fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  padding: "24px",
  
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  maxWidth: "1200px",
  margin: "0 auto",
};

const titleStyle: React.CSSProperties = {
  fontSize: "28px",
  marginBottom: "24px",
  color: "#2c3e50",
  borderBottom: "2px solid #3498db",
  paddingBottom: "12px",
  display: "flex",
  alignItems: "center",
};

const cardsContainerStyle: React.CSSProperties = {
  display: "flex",
  gap: "20px",
  marginBottom: "32px",
  flexWrap: "wrap",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  minWidth: "180px",
  flex: "1",
  textAlign: "center",
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  position: "relative",
};

const cardTitleStyle: React.CSSProperties = {
  color: "#7f8c8d",
  fontSize: "16px",
  fontWeight: "normal",
  marginBottom: "12px",
};

const countStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "bold",
  margin: "8px 0",
  color: "#2c3e50",
};

const percentageStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#7f8c8d",
};

const tabsContainerStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  marginBottom: "24px",
};

const tabStyle: React.CSSProperties = {
  padding: "12px 24px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px",
  transition: "all 0.2s ease",
};

const sectionContainerStyle: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: "8px",
  padding: "24px",
  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
};

const selectorContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  marginBottom: "24px",
};

const selectorLabelStyle: React.CSSProperties = {
  marginRight: "12px",
  fontSize: "16px",
  fontWeight: "500",
  color: "#555",
};

const selectorStyle: React.CSSProperties = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  minWidth: "250px",
  fontSize: "16px",
};

const summaryCardStyle: React.CSSProperties = {
  marginBottom: "24px",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  padding: "20px",
  backgroundColor: "#f8f9fa",
};

const summaryTitleStyle: React.CSSProperties = {
  fontSize: "18px",
  color: "#2c3e50",
  marginBottom: "16px",
  paddingBottom: "8px",
  borderBottom: "1px solid #e0e0e0",
};

const detailCardStyle: React.CSSProperties = {
  marginBottom: "16px",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  padding: "20px",
  backgroundColor: "white",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  cursor: "default",
};

const detailTitleStyle: React.CSSProperties = {
  fontSize: "18px",
  color: "#3498db",
  marginBottom: "16px",
};

const loadingStyle: React.CSSProperties = {
  padding: "40px",
  textAlign: "center",
  fontSize: "18px",
  color: "#555",
};

const errorStyle: React.CSSProperties = {
  padding: "40px",
  textAlign: "center",
  fontSize: "18px",
  color: "#e74c3c",
  backgroundColor: "#fadbd8",
  borderRadius: "8px",
};

const statsContainerStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "16px",
  marginBottom: "12px",
};

const statStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const statLabelStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#7f8c8d",
  marginRight: "6px",
};

const statValueStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#2c3e50",
};

export default Statistics;