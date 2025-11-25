import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Login/Login'
import StudentDashboard from '../pages/Student/StudentDashboard'
import NewJustification from '../pages/Student/NewJustification'
import MyJustifications from '../pages/Student/MyJustifications'
import ChangePassword from '../pages/Student/ChangePassword'
import MyProfile from '../pages/Student/MyProfile'
import MySchedule from '../pages/Student/MySchedule'
import MyGrades from '../pages/Student/MyGrades'
import MyAttendance from '../pages/Student/MyAttendance'
import ProfessorDashboard from '../pages/Professor/ProfessorDashboard'
import ProfessorJustifications from '../pages/Professor/Justifications'
import ProfessorAttendance from '../pages/Professor/Attendance'
import ProfessorReports from '../pages/Professor/Reports'
import StudentList from "../pages/Students/StudentList/StudentList"
import StudentForm from "../pages/Students/StudentForm/StudentForm"
import Dashboard from "../pages/Dashboard/Dashboard"
import Professors from "../pages/Admin/Professors"
import Attendance from "../pages/Admin/Attendance"
import AdminJustifications from "../pages/Admin/Justifications"
import AdminReports from "../pages/Admin/Reports"
import MainLayout from "../components/Layout/MainLayout"
import NotificationSystem from "../widgets/NotificationSystem"
import { CacheProvider } from "../shared/context/CacheContext"
import { DataCacheProvider } from "../shared/context/DataCacheContext"
import { useState } from "react"

function App() {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  return (
    <CacheProvider>
      <DataCacheProvider>
        <Router>
      <Routes>
        {/* Ruta de Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas de Estudiante - SIN VALIDACIÓN TEMPORAL */}
        <Route 
          path="/student/dashboard" 
          element={<StudentDashboard />} 
        />
        <Route 
          path="/student/profile" 
          element={<MyProfile />} 
        />
        <Route 
          path="/student/schedule" 
          element={<MySchedule />} 
        />
        <Route 
          path="/student/grades" 
          element={<MyGrades />} 
        />
        <Route 
          path="/student/attendance" 
          element={<MyAttendance />} 
        />
        <Route 
          path="/student/new-justification" 
          element={<NewJustification />} 
        />
        <Route 
          path="/student/my-justifications" 
          element={<MyJustifications />} 
        />
        <Route 
          path="/student/change-password" 
          element={<ChangePassword />} 
        />
        
        {/* Rutas de Profesor - SIN VALIDACIÓN TEMPORAL */}
        <Route 
          path="/professor/dashboard" 
          element={<ProfessorDashboard />} 
        />
        <Route 
          path="/professor/justifications" 
          element={<ProfessorJustifications />} 
        />
        <Route 
          path="/professor/attendance" 
          element={<ProfessorAttendance />} 
        />
        <Route 
          path="/professor/reports" 
          element={<ProfessorReports />} 
        />
        
        {/* Rutas de Admin - SIN VALIDACIÓN TEMPORAL */}
        <Route 
          path="/admin/*" 
          element={<AdminRoutes />} 
        />
        
        {/* Ruta por defecto */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      <NotificationSystem />
      </Router>
      </DataCacheProvider>
    </CacheProvider>
  )
}

// Componente para las rutas antiguas del admin
function AdminRoutes() {
  const [currentView, setCurrentView] = useState("dashboard")
  const [navigationParams, setNavigationParams] = useState(null)

  const handleNavigation = (view, params = null) => {
    setCurrentView(view)
    setNavigationParams(params)
  }

  return (
    <MainLayout activeSection={currentView} onNavigate={handleNavigation}>
      {currentView === "dashboard" && <Dashboard onNavigate={handleNavigation} />}
      {currentView === "students" && <StudentList onNavigate={handleNavigation} />}
      {currentView === "student-form" && (
        <StudentForm 
          onNavigate={handleNavigation} 
          student={navigationParams?.student}
          isEdit={navigationParams?.isEdit || false}
        />
      )}
      {currentView === "professors" && <Professors onNavigate={handleNavigation} />}
      {currentView === "attendance" && <Attendance onNavigate={handleNavigation} />}
      {currentView === "reports" && <AdminReports onNavigate={handleNavigation} />}
      {currentView === "justifications" && <AdminJustifications onNavigate={handleNavigation} />}
    </MainLayout>
  )
}

export default App
