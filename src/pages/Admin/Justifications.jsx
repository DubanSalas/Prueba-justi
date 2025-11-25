import { useState, useEffect } from 'react'
import axios from 'axios'

export default function AdminJustifications() {
  const [justifications, setJustifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedJustification, setSelectedJustification] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const token = localStorage.getItem('token')

  const fetchJustifications = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/justifications/all', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setJustifications(response.data.data || [])
    } catch (error) {
      console.error('Error al cargar justificaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJustifications()
  }, [token])

  const handleApprove = async (justificationId, response) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      await axios.post(
        `http://localhost:5000/api/justifications/${justificationId}/approve`,
        {
          professor_id: user.id,
          admin_response: response
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('Justificación aprobada exitosamente')
      fetchJustifications()
      setShowModal(false)
    } catch (error) {
      alert('Error al aprobar la justificación')
    }
  }

  const handleReject = async (justificationId, response) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      await axios.post(
        `http://localhost:5000/api/justifications/${justificationId}/reject`,
        {
          professor_id: user.id,
          admin_response: response
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('Justificación rechazada')
      fetchJustifications()
      setShowModal(false)
    } catch (error) {
      alert('Error al rechazar la justificación')
    }
  }

  const filteredJustifications = justifications.filter(j => {
    const matchesSearch = j.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         j.student_code?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterStatus === 'ALL') return matchesSearch
    return matchesSearch && j.status === filterStatus
  })

  const getStatusBadge = (status) => {
    const badges = {
      'PENDIENTE': { class: 'bg-yellow-100 text-yellow-800 border-yellow-300', text: 'Pendiente' },
      'APROBADA': { class: 'bg-green-100 text-green-800 border-green-300', text: 'Aprobada' },
      'RECHAZADA': { class: 'bg-red-100 text-red-800 border-red-300', text: 'Rechazada' }
    }
    return badges[status] || badges.PENDIENTE
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Justificaciones</h1>
        <p className="text-gray-600">Todas las solicitudes de justificación de estudiantes</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por estudiante o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['Todas', 'Pendiente', 'Aprobada', 'Rechazada'].map((status, idx) => {
              const statusValue = idx === 0 ? 'ALL' : status.toUpperCase()
              return (
                <button
                  key={statusValue}
                  onClick={() => setFilterStatus(statusValue)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === statusValue
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{justifications.length}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-sm p-4 border-2 border-yellow-200">
          <p className="text-sm text-yellow-600 mb-1">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-700">
            {justifications.filter(j => j.status === 'PENDIENTE').length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm p-4 border-2 border-green-200">
          <p className="text-sm text-green-600 mb-1">Aprobadas</p>
          <p className="text-2xl font-bold text-green-700">
            {justifications.filter(j => j.status === 'APROBADA').length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg shadow-sm p-4 border-2 border-red-200">
          <p className="text-sm text-red-600 mb-1">Rechazadas</p>
          <p className="text-2xl font-bold text-red-700">
            {justifications.filter(j => j.status === 'RECHAZADA').length}
          </p>
        </div>
      </div>

      {/* Lista de Justificaciones */}
      <div className="space-y-4">
        {filteredJustifications.map(justification => {
          const badge = getStatusBadge(justification.status)
          return (
            <div key={justification.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{justification.reason_type}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${badge.class}`}>
                      {badge.text}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Estudiante</p>
                      <p className="font-medium text-gray-900">{justification.student_name}</p>
                      <p className="text-gray-600">{justification.student_code}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Curso</p>
                      <p className="font-medium text-gray-900">{justification.course_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fecha de Ausencia</p>
                      <p className="font-medium text-gray-900">
                        {new Date(justification.absence_date).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Enviado</p>
                      <p className="font-medium text-gray-900">
                        {new Date(justification.submission_date).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Descripción:</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {justification.reason_description}
                </p>
              </div>

              {justification.admin_response && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Respuesta del Profesor:</p>
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    {justification.admin_response}
                  </p>
                </div>
              )}

              {justification.status === 'PENDIENTE' && (
                <button
                  onClick={() => {
                    setSelectedJustification(justification)
                    setShowModal(true)
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Revisar y Responder
                </button>
              )}
            </div>
          )
        })}
      </div>

      {filteredJustifications.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron justificaciones</h3>
          <p className="text-gray-500">Intenta con otros filtros de búsqueda</p>
        </div>
      )}

      {/* Modal de Revisión */}
      {showModal && selectedJustification && (
        <ReviewModal
          justification={selectedJustification}
          onClose={() => setShowModal(false)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
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
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Revisar Justificación</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Información del Estudiante</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-blue-600">Nombre:</p>
                <p className="font-medium text-blue-900">{justification.student_name}</p>
              </div>
              <div>
                <p className="text-blue-600">Código:</p>
                <p className="font-medium text-blue-900">{justification.student_code}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Motivo</p>
            <p className="font-medium text-gray-900">{justification.reason_type}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Descripción</p>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{justification.reason_description}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tu Respuesta <span className="text-red-500">*</span>
            </label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Escribe tu respuesta al estudiante..."
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>
        </div>

        <div className="border-t px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              setAction('reject')
              handleSubmit()
            }}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Rechazar
          </button>
          <button
            onClick={() => {
              setAction('approve')
              handleSubmit()
            }}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Aprobar
          </button>
        </div>
      </div>
    </div>
  )
}
