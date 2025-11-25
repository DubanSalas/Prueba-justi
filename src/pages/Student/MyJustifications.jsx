import { useState, useEffect } from 'react'
import axios from 'axios'
import StudentLayout from '../../components/Student/StudentLayout'

export default function MyJustifications() {
  const [justifications, setJustifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const fetchJustifications = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/students/${user.id}/justifications`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setJustifications(response.data.data || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchJustifications()
  }, [user.id, token])

  const filteredJustifications = justifications.filter(j => {
    const matchesSearch = j.reason_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         j.course_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
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
      <StudentLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </StudentLayout>
    )
  }

  const pendingCount = justifications.filter(j => j.status === 'PENDIENTE').length
  const approvedCount = justifications.filter(j => j.status === 'APROBADA').length
  const rejectedCount = justifications.filter(j => j.status === 'RECHAZADA').length

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Solicitudes de Justificación</h1>
            <p className="text-gray-600">Revisa el estado de todas tus solicitudes</p>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-600">Total</p>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">{justifications.length}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow-sm p-4 border-2 border-yellow-200">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-yellow-600">Pendientes</p>
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
            </div>
            <div className="bg-green-50 rounded-lg shadow-sm p-4 border-2 border-green-200">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-green-600">Aprobadas</p>
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-green-700">{approvedCount}</p>
            </div>
            <div className="bg-red-50 rounded-lg shadow-sm p-4 border-2 border-red-200">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-red-600">Rechazadas</p>
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-red-700">{rejectedCount}</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar por motivo o curso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                {['ALL', 'PENDIENTE', 'APROBADA', 'RECHAZADA'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filterStatus === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'ALL' ? 'Todas' : status.charAt(0) + status.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
                    <p className="text-sm font-medium text-gray-700 mb-1">Tu Descripción:</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {justification.reason_description}
                    </p>
                  </div>

                  {/* Archivo Adjunto */}
                  {justification.attachment_filename && (
                    <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        Archivo Adjunto:
                      </p>
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            {justification.attachment_type?.startsWith('image/') ? (
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{justification.attachment_filename}</p>
                            <p className="text-xs text-gray-500">
                              {justification.attachment_type?.startsWith('image/') ? 'Imagen' : 'PDF'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={`http://localhost:5000${justification.attachment_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Ver
                          </a>
                          <a
                            href={`http://localhost:5000${justification.attachment_path}`}
                            download={justification.attachment_filename}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Descargar
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {justification.admin_response && (
                    <div className={`p-4 rounded-lg border-2 ${
                      justification.status === 'APROBADA' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <p className={`text-sm font-medium mb-1 ${
                        justification.status === 'APROBADA' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        Respuesta del Profesor:
                      </p>
                      <p className={`text-sm ${
                        justification.status === 'APROBADA' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {justification.admin_response}
                      </p>
                      {justification.review_date && (
                        <p className="text-xs text-gray-500 mt-2">
                          Revisado el {new Date(justification.review_date).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron solicitudes</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'ALL' 
                  ? 'Intenta con otros filtros de búsqueda' 
                  : 'Aún no has enviado ninguna solicitud de justificación'}
              </p>
            </div>
          )}
        </div>
    </StudentLayout>
  )
}
