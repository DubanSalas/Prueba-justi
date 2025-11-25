"use client"
import { useState, useEffect } from "react"
import { useStudents } from "../../../shared/hooks/useStudents.js"
import StudentProfileModal from "../../../widgets/StudentProfileModal"
import StudentCard from "../../../widgets/StudentCard"
import AttendanceReportModal from "../../../widgets/AttendanceReportModal"

export default function StudentList({ onNavigate }) {
  const {
    students: hookStudents,
    loading,
    error,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    restoreStudent
  } = useStudents()

  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("todos")
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showAttendanceReport, setShowAttendanceReport] = useState(false)
  const [viewMode, setViewMode] = useState("cards") // "cards" or "table"
  const [includeInactive, setIncludeInactive] = useState(false)

  // Usar datos reales del hook
  const students = hookStudents || []

  // Cargar estudiantes según el filtro seleccionado (con debounce para search)
  useEffect(() => {
    // Debounce para el search term
    const timeoutId = setTimeout(() => {
      const shouldIncludeInactive = filterStatus === "todos" || filterStatus === "inactivo" || includeInactive

      const params = {
        includeInactive: shouldIncludeInactive,
        status: filterStatus,
        search: searchTerm
      }

      console.log('Cargando estudiantes con parámetros:', params)
      fetchStudents(params)
    }, searchTerm ? 500 : 0) // 500ms de delay solo si hay búsqueda

    return () => clearTimeout(timeoutId)
  }, [filterStatus, includeInactive, searchTerm])

  // Filtrar estudiantes
  const filteredStudents = students.filter((student) => {
    const studentName = student.nombre || `${student.first_name} ${student.last_name}`
    const studentStatus = student.estado || student.status

    // Filtro de búsqueda por texto
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.student_code && student.student_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filtro por estado
    let matchesFilter = true
    if (filterStatus === "todos") {
      // Mostrar todos (activos e inactivos)
      matchesFilter = true
    } else if (filterStatus === "activo") {
      // Solo activos
      matchesFilter = studentStatus === "active"
    } else if (filterStatus === "inactivo") {
      // Solo inactivos
      matchesFilter = studentStatus === "inactive"
    } else if (filterStatus === "suspendido") {
      // Solo suspendidos
      matchesFilter = studentStatus === "suspended"
    }

    return matchesSearch && matchesFilter
  })

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'activo':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactivo':
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDropdownClick = (section) => {
    console.log("Navegando a:", section)
    if (onNavigate) {
      onNavigate(section)
    }
    setShowDropdown(false)
  }

  const handleViewStudent = (student) => {
    setSelectedStudent(student)
    setShowProfileModal(true)
  }

  const handleNewStudent = () => {
    if (onNavigate) {
      onNavigate('student-form')
    }
  }

  const handleEditStudent = (student) => {
    console.log('Editando estudiante:', student)
    // Navegar al formulario de edición con los datos del estudiante
    if (onNavigate) {
      onNavigate('student-form', { student, isEdit: true })
    }
  }

  const handleDeleteStudent = async (student) => {
    const studentName = student.nombre || `${student.first_name} ${student.last_name}`

    // Si está activo, confirmar eliminación (cambiar a inactivo)
    if (window.confirm(`¿Estás seguro de que deseas eliminar al estudiante ${studentName}? El estudiante será marcado como inactivo.`)) {
      try {
        console.log('Eliminando estudiante:', student.id)
        const response = await deleteStudent(student.id)
        console.log('Respuesta de eliminación:', response)
        if (response.success) {
          console.log('Recargando lista con includeInactive:', includeInactive)
          // Recargar la lista
          await fetchStudents({ includeInactive })
        } else {
          console.error('Error en la respuesta:', response.message)
        }
      } catch (error) {
        console.error('Error al eliminar estudiante:', error)
      }
    }
  }

  const handleRestoreStudent = async (student) => {
    const studentName = student.nombre || `${student.first_name} ${student.last_name}`

    // Confirmar restauración
    if (window.confirm(`¿Deseas restaurar al estudiante ${studentName}?`)) {
      try {
        const response = await restoreStudent(student.id)
        if (response.success) {
          // Recargar la lista
          fetchStudents({ includeInactive })
        }
      } catch (error) {
        console.error('Error al restaurar estudiante:', error)
      }
    }
  }

  const handleDownloadStudentPDF = async (student) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reports/students/${student.id}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al descargar el PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const studentCode = student.student_code || student.codigo || student.id;
      a.download = `estudiante_${studentCode}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Error al descargar el reporte PDF');
    }
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Gestión de Estudiantes
                  </h1>
                  <p className="text-gray-600 text-sm">Administra y supervisa el registro académico</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={handleNewStudent}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Nuevo Estudiante</span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    Menú
                    <svg className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showDropdown && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px] z-dropdown">
                      <button
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                        onClick={() => handleDropdownClick("dashboard")}
                      >
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        </svg>
                        Dashboard
                      </button>
                      <button
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                        onClick={() => handleDropdownClick("justifications")}
                      >
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Justificaciones
                      </button>
                      <button
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                        onClick={() => handleDropdownClick("reports")}
                      >
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Reportes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Estudiantes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {students.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Estudiantes Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {students.filter(s => (s.status || s.estado) === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Estudiantes Inactivos</p>
                <p className="text-2xl font-bold text-orange-600">
                  {students.filter(s => (s.status || s.estado) === 'inactive').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Carreras Activas</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(students.map(s => s.career || s.carrera)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Alert */}
        {!loading && (() => {
          // Si no hay estudiantes, no mostrar nada
          if (!students || students.length === 0) {
            return null;
          }
          
          console.log(`📊 Total estudiantes: ${students.length}`);
          console.log('🔍 Primer estudiante:', students[0]);
          
          // Calcular estudiantes en riesgo y críticos
          const studentsWithAlerts = students.filter(student => {
            // Intentar obtener el porcentaje de asistencia de diferentes campos posibles
            let attendancePercentage = 100;
            
            if (student.attendance_percentage !== undefined) {
              attendancePercentage = student.attendance_percentage;
            } else if (student.porcentajeAsistencia !== undefined) {
              attendancePercentage = student.porcentajeAsistencia;
            } else if (student.attendance_stats?.present && student.attendance_stats?.total_classes) {
              // Calcular desde las estadísticas
              attendancePercentage = (student.attendance_stats.present / student.attendance_stats.total_classes) * 100;
            }
            
            const absencePercentage = 100 - attendancePercentage;
            const hasAlert = absencePercentage >= 25;
            
            if (hasAlert) {
              console.log(`🚨 ALERTA: ${student.nombre || student.full_name} - ${absencePercentage.toFixed(1)}% inasistencias`);
            }
            
            return hasAlert;
          });

          console.log(`✅ Total con alertas: ${studentsWithAlerts.length}`);
          
          if (studentsWithAlerts.length === 0) {
            console.log('ℹ️ No hay estudiantes con alertas (≥25% inasistencias)');
            return null;
          }

          // Mostrar solo los primeros 2 estudiantes como preview
          const previewStudents = studentsWithAlerts.slice(0, 2);
          const remainingCount = studentsWithAlerts.length - previewStudents.length;

          return (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-orange-900">Alertas de Inasistencia</h3>
                    <p className="text-sm text-orange-700">Estudiantes que requieren atención inmediata</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAttendanceReport(true)}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver Detalles
                </button>
              </div>

              {/* Preview de estudiantes */}
              <div className="space-y-3">
                {previewStudents.map(student => {
                  // Obtener porcentaje de asistencia de forma flexible
                  let attendancePercentage = 100;
                  if (student.attendance_percentage !== undefined) {
                    attendancePercentage = student.attendance_percentage;
                  } else if (student.porcentajeAsistencia !== undefined) {
                    attendancePercentage = student.porcentajeAsistencia;
                  } else if (student.attendance_stats?.present && student.attendance_stats?.total_classes) {
                    attendancePercentage = (student.attendance_stats.present / student.attendance_stats.total_classes) * 100;
                  }
                  
                  const absencePercentage = 100 - attendancePercentage;
                  const isCritical = absencePercentage >= 30;
                  
                  // Obtener datos del estudiante de forma flexible
                  const studentName = student.nombre || student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Sin nombre';
                  const studentCode = student.codigo || student.student_code || 'N/A';
                  const studentCareer = student.carrera || student.career || 'N/A';
                  const totalClasses = student.attendance_stats?.total_classes || student.totalClases || 0;
                  const absences = student.attendance_stats?.absent || student.inasistencias || Math.round((absencePercentage / 100) * totalClasses);

                  return (
                    <div 
                      key={student.id} 
                      className={`${isCritical ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'} border rounded-lg p-4 hover:shadow-md transition-all`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{studentName}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 ${isCritical ? 'bg-red-100 text-red-700 border-red-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              {isCritical ? 'CRÍTICO' : 'RIESGO'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{studentCode} • {studentCareer}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Total clases: </span>
                              <span className="font-bold text-gray-900">{totalClasses}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Inasistencias: </span>
                              <span className={`font-bold ${isCritical ? 'text-red-700' : 'text-orange-700'}`}>{absences}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Porcentaje: </span>
                              <span className={`font-bold ${isCritical ? 'text-red-700' : 'text-orange-700'}`}>{absencePercentage.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowAttendanceReport(true)}
                          className={`px-4 py-2 ${isCritical ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'} text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Contactar
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Mostrar contador de estudiantes restantes */}
                {remainingCount > 0 && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setShowAttendanceReport(true)}
                      className="text-orange-700 hover:text-orange-900 font-semibold text-sm flex items-center gap-2 mx-auto"
                    >
                      <span>Y {remainingCount} estudiante{remainingCount > 1 ? 's' : ''} más...</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  filterStatus === "todos"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setFilterStatus("todos")}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Todos</span>
              </button>
              
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  filterStatus === "activo"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setFilterStatus("activo")}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Activos</span>
              </button>
              
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  filterStatus === "inactivo"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setFilterStatus("inactivo")}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Inactivos</span>
              </button>
              
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  filterStatus === "suspendido"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setFilterStatus("suspendido")}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Suspendidos</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-3 py-1 rounded text-sm transition-colors ${viewMode === "cards"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1 rounded text-sm transition-colors ${viewMode === "table"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Toggle para incluir inactivos */}
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={includeInactive}
                  onChange={(e) => setIncludeInactive(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">Incluir inactivos</span>
              </label>

              <div className="relative">
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar estudiantes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Students Content */}
        {viewMode === "cards" ? (
          /* Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onView={handleViewStudent}
                onEdit={handleEditStudent}
                onDelete={handleDeleteStudent}
                onRestore={handleRestoreStudent}
              />
            ))}
            {filteredStudents.length === 0 && (
              <div className="col-span-full text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron estudiantes</h3>
                <p className="text-gray-500">No hay estudiantes que coincidan con los filtros seleccionados</p>
              </div>
            )}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Lista de Estudiantes</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrera</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semestre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asistencia</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => {
                    const studentName = student.nombre || `${student.first_name} ${student.last_name}`
                    const studentCode = student.codigo || student.student_code
                    const studentCareer = student.carrera || student.career
                    const studentSemester = student.semestre || student.semester
                    const studentStatus = student.estado || student.status
                    const attendancePercentage = student.attendance_percentage || 100
                    const isInactive = studentStatus === 'inactive' || studentStatus === 'inactivo'
                    
                    return (
                      <tr key={student.id} className={`hover:bg-gray-50 ${isInactive ? 'bg-gray-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isInactive ? 'bg-gray-500' : 'bg-slate-600'}`}>
                              <span className="text-white font-semibold text-sm">
                                {studentName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{studentName}</div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded border border-gray-200">
                            {studentCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {studentCareer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {studentSemester}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className={`font-semibold ${getAttendanceColor(attendancePercentage)}`}>
                              {attendancePercentage.toFixed(1)}%
                            </div>
                            <div className="text-gray-500 text-xs">
                              {student.attendance_stats?.absent || 0} faltas
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(studentStatus)}`}>
                            {isInactive ? 'Inactivo' : 'Activo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded transition-colors"
                              onClick={() => handleViewStudent(student)}
                              title="Ver detalles"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              className="text-slate-600 hover:text-slate-900 p-1.5 hover:bg-slate-50 rounded transition-colors"
                              onClick={() => handleDownloadStudentPDF(student)}
                              title="Descargar PDF"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                            {!isInactive && (
                              <button
                                className="text-purple-600 hover:text-purple-900 p-1.5 hover:bg-purple-50 rounded transition-colors"
                                onClick={() => handleEditStudent(student)}
                                title="Editar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}
                            {isInactive ? (
                              <button
                                className="text-green-600 hover:text-green-900 p-1.5 hover:bg-green-50 rounded transition-colors"
                                onClick={() => handleRestoreStudent(student)}
                                title="Restaurar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </button>
                            ) : (
                              <button
                                className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded transition-colors"
                                onClick={() => handleDeleteStudent(student)}
                                title="Eliminar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron estudiantes</h3>
                <p className="text-gray-500">No hay estudiantes que coincidan con los filtros seleccionados</p>
              </div>
            )}
          </div>
        )}

        {/* Student Profile Modal */}
        <StudentProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          student={selectedStudent}
          onNavigate={onNavigate}
        />

        {/* Attendance Report Modal */}
        <AttendanceReportModal
          isOpen={showAttendanceReport}
          onClose={() => setShowAttendanceReport(false)}
        />
      </div>
    </div>
  )
}