import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ProfessorLayout from '../../components/Professor/ProfessorLayout'

export default function ProfessorDashboard() {
  const [stats, setStats] = useState(null)
  const [pendingJustifications, setPendingJustifications] = useState([])
  const [criticalStudents, setCriticalStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJustification, setSelectedJustification] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, pendingRes, studentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/justifications/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/justifications/pending', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/students/?include_stats=true', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])
      
      setStats(statsRes.data.data)
      setPendingJustifications(pendingRes.data.data || [])
      
      // Filtrar estudiantes reprobados Y en riesgo (< 80% asistencia)
      if (studentsRes.data.success) {
        const students = studentsRes.data.data.students || []
        const atRisk = students.filter(student => 
          (student.attendance_percentage || 100) < 80
        ).map(student => {
          const percentage = student.attendance_percentage || 100
          return {
            ...student,
            full_name: student.full_name || `${student.first_name} ${student.last_name}`,
            student_code: student.student_code || student.codigo,
            risk_level: percentage < 70 ? 'REPROBADO' : 'EN_RIESGO'
          }
        })
        setCriticalStudents(atRisk)
        const failedCount = atRisk.filter(s => s.risk_level === 'REPROBADO').length
        const riskCount = atRisk.filter(s => s.risk_level === 'EN_RIESGO').length
        console.log(`❌ Estudiantes reprobados: ${failedCount}`)
        console.log(`🟠 Estudiantes en riesgo: ${riskCount}`)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const handleApprove = async (justificationId, response) => {
    try {
      await axios.post(
        `http://localhost:5000/api/justifications/${justificationId}/approve`,
        {
          professor_id: user.id,
          admin_response: response
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      alert('Justificación aprobada exitosamente')
      fetchData()
      setShowModal(false)
    } catch (error) {
      alert('Error al aprobar la justificación')
    }
  }

  const handleReject = async (justificationId, response) => {
    try {
      await axios.post(
        `http://localhost:5000/api/justifications/${justificationId}/reject`,
        {
          professor_id: user.id,
          admin_response: response
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      alert('Justificación rechazada')
      fetchData()
      setShowModal(false)
    } catch (error) {
      alert('Error al rechazar la justificación')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <ProfessorLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerta de Inasistencia Crítica y En Riesgo */}
        {criticalStudents.length > 0 && (
          <div className="space-y-4 mb-8">
            {/* Estudiantes REPROBADOS */}
            {criticalStudents.filter(s => s.risk_level === 'REPROBADO').length > 0 && (
              <div className="bg-gradient-to-r from-red-700 to-red-900 rounded-2xl shadow-2xl p-8 border-4 border-red-950 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="bg-white/20 p-5 rounded-2xl backdrop-blur-sm">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="text-white">
                      <h3 className="text-3xl font-bold mb-2">❌ ESTUDIANTES REPROBADOS</h3>
                      <p className="text-red-100 text-xl">
                        {criticalStudents.filter(s => s.risk_level === 'REPROBADO').length} estudiante{criticalStudents.filter(s => s.risk_level === 'REPROBADO').length > 1 ? 's' : ''} con más del 30% de inasistencias
                      </p>
                      <p className="text-red-200 text-sm mt-1">❌ Han reprobado el curso por faltas</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/professor/students')}
                    className="bg-white text-red-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-50 transition-all shadow-2xl hover:scale-105"
                  >
                    Ver Detalles →
                  </button>
                </div>
                
                {/* Lista de estudiantes reprobados */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {criticalStudents.filter(s => s.risk_level === 'REPROBADO').slice(0, 6).map((student) => (
                    <div key={student.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 border-white/20">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg">{student.full_name}</h4>
                          <p className="text-red-100 text-sm">{student.student_code}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 bg-white/20 rounded-full h-2">
                              <div 
                                className="bg-white h-2 rounded-full" 
                                style={{ width: `${student.attendance_percentage || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold">{(student.attendance_percentage || 0).toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="text-3xl ml-4">❌</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Estudiantes EN RIESGO */}
            {criticalStudents.filter(s => s.risk_level === 'EN_RIESGO').length > 0 && (
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-2xl p-8 border-4 border-orange-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="bg-white/20 p-5 rounded-2xl backdrop-blur-sm">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div className="text-white">
                      <h3 className="text-3xl font-bold mb-2">🟠 ESTUDIANTES EN RIESGO</h3>
                      <p className="text-orange-100 text-xl">
                        {criticalStudents.filter(s => s.risk_level === 'EN_RIESGO').length} estudiante{criticalStudents.filter(s => s.risk_level === 'EN_RIESGO').length > 1 ? 's' : ''} con 70-79% de asistencia
                      </p>
                      <p className="text-orange-200 text-sm mt-1">⚠️ Requieren monitoreo constante</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/professor/students')}
                    className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-all shadow-2xl hover:scale-105"
                  >
                    Ver Detalles →
                  </button>
                </div>
                
                {/* Lista de estudiantes en riesgo */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {criticalStudents.filter(s => s.risk_level === 'EN_RIESGO').slice(0, 6).map((student) => (
                    <div key={student.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 border-white/20">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg">{student.full_name}</h4>
                          <p className="text-orange-100 text-sm">{student.student_code}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 bg-white/20 rounded-full h-2">
                              <div 
                                className="bg-white h-2 rounded-full" 
                                style={{ width: `${student.attendance_percentage || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold">{(student.attendance_percentage || 0).toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="text-3xl ml-4">🟠</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Solicitudes"
            value={stats?.total || 0}
            icon="📋"
            color="blue"
          />
          <StatCard
            title="Pendientes"
            value={stats?.pending || 0}
            icon="⏳"
            color="yellow"
          />
          <StatCard
            title="Aprobadas"
            value={stats?.approved || 0}
            icon="✅"
            color="green"
          />
          <StatCard
            title="Rechazadas"
            value={stats?.rejected || 0}
            icon="❌"
            color="red"
          />
        </div>

        {/* Justificaciones Pendientes */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Justificaciones Pendientes de Revisión
          </h2>

          {pendingJustifications.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay justificaciones pendientes
              </h3>
              <p className="text-gray-500">
                Todas las solicitudes han sido procesadas
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingJustifications.map((justification) => (
                <PendingJustificationCard
                  key={justification.id}
                  justification={justification}
                  onReview={() => {
                    setSelectedJustification(justification)
                    setShowModal(true)
                  }}
                />
              ))}
            </div>
          )}
        </div>

        </div>

      {/* Modal de Revisión */}
      {showModal && selectedJustification && (
        <ReviewModal
          justification={selectedJustification}
          onClose={() => setShowModal(false)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </ProfessorLayout>
  )
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    yellow: 'from-yellow-500 to-yellow-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600'
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-14 h-14 bg-gradient-to-r ${colors[color]} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function PendingJustificationCard({ justification, onReview }) {
  return (
    <div className="border-2 border-yellow-200 bg-yellow-50 rounded-xl p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900">{justification.reason_type}</h3>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold border border-yellow-200">
              ⏳ PENDIENTE
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Estudiante:</p>
              <p className="font-medium text-gray-900">{justification.student_name}</p>
              <p className="text-gray-600">{justification.student_code}</p>
            </div>
            <div>
              <p className="text-gray-500">Curso:</p>
              <p className="font-medium text-gray-900">{justification.course_name}</p>
            </div>
            <div>
              <p className="text-gray-500">Fecha de inasistencia:</p>
              <p className="font-medium text-gray-900">
                {new Date(justification.absence_date).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Enviado:</p>
              <p className="font-medium text-gray-900">
                {new Date(justification.submission_date).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-1">Descripción:</p>
        <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
          {justification.reason_description}
        </p>
      </div>

      <button
        onClick={onReview}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        Revisar Solicitud
      </button>
    </div>
  )
}

function ReviewModal({ justification, onClose, onApprove, onReject }) {
  const [response, setResponse] = useState('')
  const [action, setAction] = useState(null)

  const handleSubmit = () => {
    if (!response.trim()) {
      alert('Por favor, escribe una respuesta')
      return
    }

    if (action === 'approve') {
      onApprove(justification.id, response)
    } else if (action === 'reject') {
      onReject(justification.id, response)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Revisar Justificación</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información del Estudiante */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Información del Estudiante</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-600">Nombre:</p>
                <p className="font-medium text-blue-900">{justification.student_name}</p>
              </div>
              <div>
                <p className="text-blue-600">Código:</p>
                <p className="font-medium text-blue-900">{justification.student_code}</p>
              </div>
              <div>
                <p className="text-blue-600">Email:</p>
                <p className="font-medium text-blue-900">{justification.student_email}</p>
              </div>
              <div>
                <p className="text-blue-600">Carrera:</p>
                <p className="font-medium text-blue-900">{justification.student_career}</p>
              </div>
            </div>
          </div>

          {/* Detalles de la Justificación */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles de la Justificación</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Motivo</p>
                <p className="font-medium text-gray-900">{justification.reason_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Curso</p>
                <p className="font-medium text-gray-900">{justification.course_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha de inasistencia</p>
                <p className="font-medium text-gray-900">
                  {new Date(justification.absence_date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha de envío</p>
                <p className="font-medium text-gray-900">
                  {new Date(justification.submission_date).toLocaleString('es-ES')}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Descripción detallada</p>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                {justification.reason_description}
              </p>
            </div>
          </div>

          {/* Archivos Adjuntos */}
          {justification.attachments && justification.attachments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Archivos Adjuntos</h3>
              <div className="space-y-2">
                {justification.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{attachment.original_name}</p>
                      <p className="text-xs text-gray-500">{(attachment.file_size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Respuesta del Profesor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tu Respuesta <span className="text-red-500">*</span>
            </label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Escribe tu respuesta al estudiante..."
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Esta respuesta será visible para el estudiante
            </p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="border-t px-6 py-4 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              setAction('reject')
              handleSubmit()
            }}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Rechazar
          </button>
          <button
            onClick={() => {
              setAction('approve')
              handleSubmit()
            }}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Aprobar
          </button>
        </div>
      </div>
    </div>
  )
}
