import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import StudentLayout from '../../components/Student/StudentLayout'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')
  const [stats, setStats] = useState(null)
  const [recentJustifications, setRecentJustifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/students/${user.id}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setStats(response.data.data?.stats)
        setRecentJustifications(response.data.data?.recent_justifications || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [user.id, token])

  const getStatusBadge = (status) => {
    const badges = {
      'PENDIENTE': { class: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
      'APROBADA': { class: 'bg-green-100 text-green-800', text: 'Aprobada' },
      'RECHAZADA': { class: 'bg-red-100 text-red-800', text: 'Rechazada' }
    }
    return badges[status] || badges.PENDIENTE
  }

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </StudentLayout>
    )
  }

  const getRiskColor = () => {
    const percentage = stats?.attendance_percentage || 100
    if (percentage < 70) return 'text-red-600'
    if (percentage < 75) return 'text-orange-600'
    if (percentage < 80) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getRiskMessage = () => {
    const percentage = stats?.attendance_percentage || 100
    if (percentage < 70) return '🔴 ¡ALERTA! Estás en riesgo de reprobar por inasistencias'
    if (percentage < 75) return '🟠 Atención: Tu asistencia está por debajo del mínimo'
    if (percentage < 80) return '🟡 Cuidado: Mantén tu asistencia arriba del 75%'
    return '🟢 ¡Excelente! Tu asistencia está en buen nivel'
  }

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bienvenido, {user.first_name}!
            </h1>
            <p className="text-gray-600">
              {user.career} - Semestre {user.semester}
            </p>
          </div>

          {/* Alerta de Inasistencia */}
          {stats && stats.attendance_percentage < 80 && (
            <div className={`mb-6 p-4 rounded-lg border-2 ${
              stats.attendance_percentage < 70 ? 'bg-red-50 border-red-300' :
              stats.attendance_percentage < 75 ? 'bg-orange-50 border-orange-300' :
              'bg-yellow-50 border-yellow-300'
            }`}>
              <p className={`font-bold ${getRiskColor()}`}>
                {getRiskMessage()}
              </p>
            </div>
          )}

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Solicitudes</p>
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats?.total_justifications || 0}</p>
            </div>

            <div className="bg-yellow-50 rounded-lg shadow-sm p-6 border-2 border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-yellow-600">Pendientes</p>
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-yellow-700">{stats?.pending || 0}</p>
            </div>

            <div className="bg-green-50 rounded-lg shadow-sm p-6 border-2 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-green-600">Aprobadas</p>
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-green-700">{stats?.approved || 0}</p>
            </div>

            <div className={`rounded-lg shadow-sm p-6 border-2 ${
              (stats?.attendance_percentage || 100) >= 80 ? 'bg-green-50 border-green-200' :
              (stats?.attendance_percentage || 100) >= 75 ? 'bg-yellow-50 border-yellow-200' :
              (stats?.attendance_percentage || 100) >= 70 ? 'bg-orange-50 border-orange-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`text-sm ${getRiskColor()}`}>Asistencia</p>
                <svg className={`w-8 h-8 ${getRiskColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className={`text-3xl font-bold ${getRiskColor()}`}>
                {stats?.attendance_percentage || 0}%
              </p>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => navigate('/student/new-justification')}
              className="bg-blue-600 text-white rounded-lg p-5 hover:bg-blue-700 transition-colors text-left shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-0.5">Nueva Justificación</h3>
                  <p className="text-xs text-blue-100">Envía una nueva solicitud</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/student/my-justifications')}
              className="bg-purple-600 text-white rounded-lg p-5 hover:bg-purple-700 transition-colors text-left shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-0.5">Mis Solicitudes</h3>
                  <p className="text-xs text-purple-100">Ver tus justificaciones</p>
                </div>
              </div>
            </button>
          </div>

          {/* Solicitudes Recientes */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Solicitudes Recientes
              </h2>
              <button
                onClick={() => navigate('/student/my-justifications')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
              >
                Ver todas
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {recentJustifications.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">No hay solicitudes registradas</p>
                <p className="text-gray-500 text-sm mt-1">Este estudiante aún no ha enviado justificaciones</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentJustifications.map((justification) => {
                  const badge = getStatusBadge(justification.status)
                  return (
                    <div key={justification.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-900">{justification.reason_type}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${badge.class}`}>
                              {badge.text}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{justification.reason_description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(justification.absence_date).toLocaleDateString('es-ES')}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                              {new Date(justification.submission_date).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                          {justification.admin_response && (
                            <div className={`mt-3 p-3 rounded-lg text-sm ${
                              justification.status === 'APROBADA' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                              <p className="font-medium mb-1">Respuesta del profesor:</p>
                              <p>{justification.admin_response}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Información de Asistencia Detallada */}
          {stats && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Detalle de Asistencia</h2>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Porcentaje de Asistencia</span>
                  <span className={`text-lg font-bold ${getRiskColor()}`}>
                    {stats.attendance_percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      stats.attendance_percentage >= 80 ? 'bg-green-600' :
                      stats.attendance_percentage >= 75 ? 'bg-yellow-600' :
                      stats.attendance_percentage >= 70 ? 'bg-orange-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${stats.attendance_percentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Clases</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_classes || 0}</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 mb-1">Presentes</p>
                  <p className="text-2xl font-bold text-green-700">{stats.present || 0}</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600 mb-1">Ausentes</p>
                  <p className="text-2xl font-bold text-red-700">{stats.absent || 0}</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Justificadas</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.justified || 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>
    </StudentLayout>
  )
}
