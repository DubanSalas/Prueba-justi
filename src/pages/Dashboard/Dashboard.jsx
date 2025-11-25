import { useState, useEffect } from "react"
import DashboardModal from "../../widgets/DashboardModal"
import { useDataCache } from "../../shared/context/DataCacheContext"

function Dashboard({ onNavigate }) {
  const [selectedJustification, setSelectedJustification] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalStudents: 0,
    activeStudents: 0
  })
  const [recentRequests, setRecentRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const { getCacheData, setCacheData, isCacheValid } = useDataCache()

  const handleViewDetails = (request) => {
    setSelectedJustification(request)
    setIsModalOpen(true)
  }

  const handleViewAll = () => {
    if (onNavigate) {
      onNavigate("justifications")
    }
  }

  const handleApproveRequest = (request) => {
    alert(`Justificación de ${request.student} aprobada`)
  }

  const handleRejectRequest = (request) => {
    alert(`Justificación de ${request.student} rechazada`)
  }

  // Cargar datos del backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Verificar si hay datos en caché válidos
        const cachedData = getCacheData('dashboard')
        if (cachedData && isCacheValid('dashboard')) {
          setStats(cachedData.stats)
          setRecentRequests(cachedData.recentRequests)
          setLoading(false)
          return
        }

        const token = localStorage.getItem('token')

        // Obtener estadísticas de justificaciones
        const statsResponse = await fetch('http://localhost:5000/api/justifications/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const statsData = await statsResponse.json()

        // Obtener justificaciones recientes (últimas 5)
        const justificationsResponse = await fetch('http://localhost:5000/api/justifications/all', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const justificationsData = await justificationsResponse.json()

        // Obtener estadísticas de estudiantes
        const studentsResponse = await fetch('http://localhost:5000/api/students/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const studentsData = await studentsResponse.json()

        if (statsData.success) {
          setStats({
            total: statsData.data.total || 0,
            pending: statsData.data.pending || 0,
            approved: statsData.data.approved || 0,
            rejected: statsData.data.rejected || 0,
            totalStudents: studentsData.data?.total || 0,
            activeStudents: studentsData.data?.active || 0
          })
        }

        if (justificationsData.success) {
          // Tomar solo las últimas 5 justificaciones con TODOS los datos
          const recent = justificationsData.data.slice(0, 5).map(j => {
            console.log('📎 Justificación del backend:', j)
            console.log('📎 Tiene archivo?', j.attachment_filename ? 'SÍ' : 'NO')
            return {
              id: j.id,
              student: j.student_name,
              code: j.student_code,
              email: j.student_email || 'No disponible',
              phone: j.student_phone || 'No disponible',
              career: j.student_career || 'No disponible',
              semester: j.student_semester || 'No disponible',
              date: new Date(j.absence_date).toLocaleDateString('es-ES'),
              course: j.course_name,
              reason: j.reason_type,
              description: j.reason_description || 'Sin descripción',
              attachment: j.attachment_path,
              attachment_filename: j.attachment_filename,
              attachment_path: j.attachment_path,
              attachment_type: j.attachment_type,
              sent: new Date(j.submission_date).toLocaleDateString('es-ES'),
              status: j.status === 'PENDIENTE' ? 'Pendiente' : j.status === 'APROBADA' ? 'Aprobada' : 'Rechazada'
            }
          })
          setRecentRequests(recent)
          
          // Guardar en caché
          setCacheData('dashboard', {
            stats: {
              total: statsData.data.total || 0,
              pending: statsData.data.pending || 0,
              approved: statsData.data.approved || 0,
              rejected: statsData.data.rejected || 0,
              totalStudents: studentsData.data?.total || 0,
              activeStudents: studentsData.data?.active || 0
            },
            recentRequests: recent
          })
        }
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [getCacheData, isCacheValid, setCacheData])

  const getStatusClass = (status) => {
    switch (status) {
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold"
      case "Aprobada":
        return "bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold"
      case "Rechazada":
        return "bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold"
      default:
        return "bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">Panel de Administración</h1>
                  <p className="text-gray-600">Gestiona las justificaciones y supervisa el sistema académico</p>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium shadow-sm flex items-center gap-2"
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
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 transition-colors flex items-center gap-3"
                      onClick={() => {
                        onNavigate("justifications")
                        setShowDropdown(false)
                      }}
                    >
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Justificaciones
                    </button>
                    <button
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 transition-colors flex items-center gap-3"
                      onClick={() => {
                        onNavigate("students")
                        setShowDropdown(false)
                      }}
                    >
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Estudiantes
                    </button>
                    <button
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 transition-colors flex items-center gap-3"
                      onClick={() => {
                        onNavigate("reports")
                        setShowDropdown(false)
                      }}
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Solicitudes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Aprobadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">Rechazadas</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Estudiantes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Estudiantes Activos</p>
                <p className="text-2xl font-bold text-purple-600">{stats.activeStudents}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Solicitudes Recientes</h2>
              <p className="text-gray-600 text-sm">Últimas justificaciones enviadas por los estudiantes</p>
            </div>
            <button
              onClick={handleViewAll}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              Ver Todas
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {recentRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay solicitudes recientes</h3>
                <p className="text-gray-600">Las nuevas justificaciones aparecerán aquí</p>
              </div>
            ) : (
              recentRequests.map((request) => (
                <div key={request.id} className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {request.student.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{request.student}</h3>
                          <p className="text-sm text-gray-600">{request.code}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Fecha:</span>
                          <p className="font-medium">{request.date}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Curso:</span>
                          <p className="font-medium">{request.course}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Motivo:</span>
                          <p className="font-medium">{request.reason}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Enviado:</span>
                          <p className="font-medium">{request.sent}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={getStatusClass(request.status)}>
                        {request.status}
                      </span>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
                          title="Ver detalles"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {request.status === "Pendiente" && (
                          <>
                            <button
                              onClick={() => handleApproveRequest(request)}
                              className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors"
                              title="Aprobar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request)}
                              className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                              title="Rechazar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal */}
        <DashboardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          justification={selectedJustification}
        />
      </div>
    </div>
  )
}

export default Dashboard