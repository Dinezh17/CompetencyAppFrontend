import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./auth/Login";
import UserRegistration from "./auth/Register";
import ProtectedRoute from "./auth/ProtectedRoute";
import Navbar from "./Navbar";
import Home from "./Home";
import { AuthProvider } from "./auth/AuthContext";
import DepartmentManagement from "./Department/DepartmentCrud";
import RoleManagement from "./Role/RoleCrud";
import CompetencyManagement from "./Competency/CompetencyCrud";
import RoleCompetencyAssignment from "./RoleAssign/RoleCompetency";
import EmployeeManagement from "./Employee/EmployeeCrud";
import ExcelEmployeeUpload from "./Employee/EmoloyeeWithexcel";
import EmployeeEvaluation from "./Employee/EmployeeStatus";
import DepartmentManagerEvaluation from "./Employee/EmployeeEvalHod";
import AnalyticsDashboard from "./stats";
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<UserRegistration />} />

          
          <Route element={<ProtectedRoute />}>
          <Route path="/department-crud" element={<DepartmentManagement/>} />
          <Route path="/role-crud" element={<RoleManagement/>} />
          <Route path="/competency-crud" element={<CompetencyManagement/>} />
          <Route path="/role-assign-crud" element={<RoleCompetencyAssignment/>} />
          <Route path="/employee-crud" element={<EmployeeManagement/>} />
          <Route path="/employee-excel" element={<ExcelEmployeeUpload/>} />
          <Route path="/employee-eval" element={<EmployeeEvaluation/>} />
          <Route path="/employee-eval-hod" element={<DepartmentManagerEvaluation/>} />
          <Route path="/employee-stats" element={<AnalyticsDashboard/>} />


        </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};



export default App;