import React, { useState, useEffect, useContext } from "react";
import api from "./interceptor/api";
import { AuthContext } from "./auth/AuthContext";
import { isApiError } from "./auth/errortypes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface Department {
  department_code: string;
  name: string;
}

interface Employee {
  employee_number: string;
  employee_name: string;
  department_code: string;
  evaluation_status: boolean;
}

interface CompetencyScore {
  code: string;
  required_score: number;
  actual_score: number;
}

interface AnalyticsData {
  totalEmployees: number;
  departmentCounts: { department: string; count: number }[];
  competencyOverview: { name: string; value: number }[];
  lowPerformers: Employee[];
  highPotential: Employee[];
  promotionReady: Employee[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const { logout } = useContext(AuthContext)!;

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        };

        const response = await api.get("/analytics/employee-metrics", config);
        setData(response.data);
        setLoading(false);
      } catch (error) {
        if (isApiError(error)) {
          if (error.response?.status === 401) {
            logout();
            window.location.href = "/login";
          }
          console.error("Error fetching analytics data:", error);
        }
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [logout]);

  const filteredLowPerformers = selectedDepartment === "all" 
    ? data?.lowPerformers 
    : data?.lowPerformers.filter(e => e.department_code === selectedDepartment);

  const filteredHighPotential = selectedDepartment === "all" 
    ? data?.highPotential 
    : data?.highPotential.filter(e => e.department_code === selectedDepartment);

  const filteredPromotionReady = selectedDepartment === "all" 
    ? data?.promotionReady 
    : data?.promotionReady.filter(e => e.department_code === selectedDepartment);

  if (loading) return <div style={styles.loading}>Loading analytics data...</div>;
  if (!data) return <div style={styles.error}>Failed to load analytics data</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Employee Analytics Dashboard</h2>

      {/* Summary Cards */}
      <div style={styles.summaryContainer}>
        <div style={styles.summaryCard}>
          <h3 style={styles.summaryTitle}>Total Employees</h3>
          <p style={styles.summaryValue}>{data.totalEmployees}</p>
        </div>

        <div style={styles.summaryCard}>
          <h3 style={styles.summaryTitle}>Departments</h3>
          <p style={styles.summaryValue}>{data.departmentCounts.length}</p>
        </div>

        <div style={styles.summaryCard}>
          <h3 style={styles.summaryTitle}>Low Performers</h3>
          <p style={styles.summaryValue}>{data.lowPerformers.length}</p>
        </div>

        <div style={styles.summaryCard}>
          <h3 style={styles.summaryTitle}>High Potential</h3>
          <p style={styles.summaryValue}>{data.highPotential.length}</p>
        </div>
      </div>

      {/* Department Filter */}
      <div style={styles.filterContainer}>
        <label htmlFor="departmentFilter" style={styles.filterLabel}>
          Filter by Department:
        </label>
        <select
          id="departmentFilter"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">All Departments</option>
          {data.departmentCounts.map((dept) => (
            <option key={dept.department} value={dept.department}>
              {dept.department}
            </option>
          ))}
        </select>
      </div>

      {/* Charts Row */}
      <div style={styles.chartsRow}>
        {/* Department Distribution */}
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Employees by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.departmentCounts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Employees" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Competency Overview */}
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Competency Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.competencyOverview}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.competencyOverview.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employee Lists */}
      <div style={styles.listsContainer}>
        {/* Low Performing Employees */}
        <div style={styles.listContainer}>
          <h3 style={styles.listTitle}>Low-Performing Employees ({filteredLowPerformers?.length || 0})</h3>
          <div style={styles.listContent}>
            {filteredLowPerformers?.length ? (
              <table style={styles.listTable}>
                <thead>
                  <tr>
                    <th style={styles.listTh}>Employee</th>
                    <th style={styles.listTh}>Department</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLowPerformers.map((emp) => (
                    <tr key={emp.employee_number}>
                      <td style={styles.listTd}>
                        <div>{emp.employee_name}</div>
                        <div style={styles.employeeId}>{emp.employee_number}</div>
                      </td>
                      <td style={styles.listTd}>{emp.department_code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={styles.noData}>No low-performing employees found</p>
            )}
          </div>
        </div>

        {/* High Potential Employees */}
        <div style={styles.listContainer}>
          <h3 style={styles.listTitle}>High-Potential Employees ({filteredHighPotential?.length || 0})</h3>
          <div style={styles.listContent}>
            {filteredHighPotential?.length ? (
              <table style={styles.listTable}>
                <thead>
                  <tr>
                    <th style={styles.listTh}>Employee</th>
                    <th style={styles.listTh}>Department</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHighPotential.map((emp) => (
                    <tr key={emp.employee_number}>
                      <td style={styles.listTd}>
                        <div>{emp.employee_name}</div>
                        <div style={styles.employeeId}>{emp.employee_number}</div>
                      </td>
                      <td style={styles.listTd}>{emp.department_code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={styles.noData}>No high-potential employees found</p>
            )}
          </div>
        </div>

        {/* Promotion Ready Employees */}
        <div style={styles.listContainer}>
          <h3 style={styles.listTitle}>Promotion-Ready Employees ({filteredPromotionReady?.length || 0})</h3>
          <div style={styles.listContent}>
            {filteredPromotionReady?.length ? (
              <table style={styles.listTable}>
                <thead>
                  <tr>
                    <th style={styles.listTh}>Employee</th>
                    <th style={styles.listTh}>Department</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPromotionReady.map((emp) => (
                    <tr key={emp.employee_number}>
                      <td style={styles.listTd}>
                        <div>{emp.employee_name}</div>
                        <div style={styles.employeeId}>{emp.employee_number}</div>
                      </td>
                      <td style={styles.listTd}>{emp.department_code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={styles.noData}>No promotion-ready employees found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  title: {
    fontSize: "24px",
    marginBottom: "24px",
    color: "#333",
    fontWeight: "600",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    fontSize: "18px",
  },
  error: {
    textAlign: "center",
    padding: "40px",
    fontSize: "18px",
    color: "#f44336",
  },
  summaryContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  summaryTitle: {
    fontSize: "16px",
    color: "#666",
    marginBottom: "8px",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#333",
  },
  filterContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "24px",
    gap: "12px",
  },
  filterLabel: {
    fontSize: "14px",
    color: "#666",
  },
  filterSelect: {
    padding: "8px 12px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    minWidth: "200px",
  },
  chartsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
    gap: "24px",
    marginBottom: "32px",
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  chartTitle: {
    fontSize: "16px",
    fontWeight: "500",
    marginBottom: "16px",
    color: "#333",
    textAlign: "center",
  },
  listsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "24px",
  },
  listContainer: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  listTitle: {
    fontSize: "16px",
    fontWeight: "500",
    marginBottom: "16px",
    color: "#333",
  },
  listContent: {
    minHeight: "200px",
  },
  listTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  listTh: {
    padding: "8px",
    textAlign: "left",
    borderBottom: "1px solid #eee",
    color: "#666",
    fontSize: "14px",
  },
  listTd: {
    padding: "8px",
    borderBottom: "1px solid #eee",
    fontSize: "14px",
  },
  employeeId: {
    fontSize: "12px",
    color: "#666",
  },
  noData: {
    textAlign: "center",
    color: "#666",
    padding: "40px 0",
  },
};

export default AnalyticsDashboard;