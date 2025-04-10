import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../auth/AuthContext";
import api, { configureApi } from "../interceptor/api";

interface EmployeeResult {
  employee_number: string;
  status: "success" | "error";
  message: string;
}

const ExcelEmployeeUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<EmployeeResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useContext(AuthContext)!;

  useEffect(() => {
      configureApi(logout);
    }, [logout]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setResults([]);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const response = await api.post("/employees/upload-excel", formData, config);
      setResults(response.data.results);
      
    } catch (error) {
      
        setError("An unexpected error occurred");
      
    } finally {
      setIsUploading(false);
    }
  };

  const successCount = results.filter(r => r.status === "success").length;
  const errorCount = results.filter(r => r.status === "error").length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Employee Excel Upload</h2>
      </div>

      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="excel-file">
            Excel File
          </label>
          <input
            id="excel-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            style={styles.input}
            disabled={isUploading}
          />
        </div>
        
        <button
          type="submit"
          style={{
            ...styles.uploadButton,
            ...(isUploading || !file ? styles.disabledButton : {})
          }}
          disabled={!file || isUploading}
        >
          {isUploading ? "Uploading..." : "Upload and Process"}
        </button>
      </form>

      {results.length > 0 && (
        <div style={styles.resultsContainer}>
          <div style={styles.resultsHeader}>
            <h3 style={styles.resultsTitle}>Processing Results</h3>
            <div style={styles.resultsSummary}>
              <span style={styles.successCount}>Success: {successCount}</span>
              <span style={styles.errorCount}>Errors: {errorCount}</span>
              <span style={styles.totalCount}>Total: {results.length}</span>
            </div>
          </div>

          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Employee Number</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Message</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index} style={styles.tableRow}>
                  <td style={styles.td}>{result.employee_number}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      ...(result.status === "success" 
                        ? styles.successBadge 
                        : styles.errorBadge)
                    }}>
                      {result.status}
                    </span>
                  </td>
                  <td style={styles.td}>{result.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "1200px",
    margin: "80px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
  },
  errorMessage: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "20px",
    border: "1px solid #f5c6cb",
  },
  form: {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "30px",
  },
  formGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "8px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    boxSizing: "border-box",
  },
  uploadButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    cursor: "not-allowed",
  },
  resultsContainer: {
    marginTop: "20px",
  },
  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  resultsTitle: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  resultsSummary: {
    display: "flex",
    gap: "20px",
  },
  successCount: {
    color: "#28a745",
    fontWeight: "bold",
  },
  errorCount: {
    color: "#dc3545",
    fontWeight: "bold",
  },
  totalCount: {
    fontWeight: "bold",
  },
  table: {
    border: '1px solid #eee',
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  },
  tableHeader: {
    border: '1px solid #eee',
    backgroundColor: "#343a40",
    color: "white",
  },
  th: {
    border: '1px solid #eee',
    padding: "12px",
    textAlign: "left",
    borderBottom: "2px solid #dee2e6",
  },
  td: {
    border: '1px solid #eee',
    padding: "12px",
    borderBottom: "1px solid #dee2e6",
  },
  tableRow: {
    border: '1px solid #eee',
    backgroundColor: "#fff",
  },
  statusBadge: {
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
    display: "inline-block",
  },
  successBadge: {
    backgroundColor: "#d4edda",
    color: "#155724",
  },
  errorBadge: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
  },
};

export default ExcelEmployeeUpload;