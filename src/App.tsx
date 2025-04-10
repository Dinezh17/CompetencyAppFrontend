import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./auth/Login";
import UserRegistration from "./auth/Register";
import ProtectedRoute from "./auth/ProtectedRoute";
import Navbar from "./Navbar";
import Home from "./Home";
import { AuthContext} from "./auth/AuthContext";
import DepartmentManagement from "./Department/DepartmentCrud";
import RoleManagement from "./Role/RoleCrud";
import CompetencyManagement from "./Competency/CompetencyCrud";
import EmployeeManagement from "./Employee/EmployeeCrud";
import ExcelEmployeeUpload from "./Employee/EmoloyeeWithexcel";
import EmployeeEvaluation from "./Employee/EmployeeStatus";
import DepartmentManagerEvaluation from "./Employee/EmployeeEvalHod";
import Statistics from "./stats/stats";
import CompetencyGapTable from "./stats/CompetencyGap";
import EmployeeCompetencyTable from "./stats/FullCompetency";
import MyScores from "./Myscores/MyScore";
import RoleCompetencyList from "./RoleAssign/RoleCompetency";
import RoleCompetencyAssignment from "./RoleAssign/RoleAssignForm";
import EmployeeDetails from "./Employee/EmployeeCompdetails";
import { configureApi } from "./interceptor/api";
import EmployeeEvaluationHod from "./Employee/SubmitEmployeeDetails";
import EmployeeCompetencyAssignment from "./AssignCompetency/AssignEmpPage";


const App: React.FC = () => {

  const {logout} = useContext(AuthContext)!
  
  useEffect(() => {
    configureApi(logout);
  }, [logout]);
  

  return (
    
      
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


          <Route path="/role-competencies" element={<RoleCompetencyList />} />
          <Route path="/role-competencies/:roleCode" element={<RoleCompetencyAssignment />} />
          
         
          <Route path="/employee-crud" element={<EmployeeManagement/>} />
          <Route path="/employee-excel" element={<ExcelEmployeeUpload/>} />

          <Route path="/employee-eval" element={<EmployeeEvaluation/>} />
          <Route path="/employee-details/:employeeNumber" element={<EmployeeDetails />} />
          
          <Route path="/employee-assign-comp/:employeeNumber" element={<EmployeeCompetencyAssignment />} />


          <Route path="/employee-eval-hod" element={<DepartmentManagerEvaluation/>} />
          <Route path="/employee-eval-hod/:employeeNumber" element={<EmployeeEvaluationHod />} />
          <Route path="/employee-stats" element={<Statistics/>} />
          <Route path="/competency-gap-table" element={<CompetencyGapTable/>} />
          <Route path="/employee-competencies-table" element={<EmployeeCompetencyTable/>} />
          <Route path="/my-competency stats" element={<MyScores/>} />

          


        </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
  );
};



export default App;