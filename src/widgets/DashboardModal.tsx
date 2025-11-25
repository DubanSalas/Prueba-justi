"use client"
import React from 'react'

interface DashboardModalProps {
  isOpen: boolean
  onClose: () => void
  justification: {
    id: number
    student: string
    code: string
    email?: string
    phone?: string
    career?: string
    semester?: string
    date: string
    course: string
    reason: string
    description?: string
    attachment?: string
    attachment_filename?: string
    attachment_path?: string
    attachment_type?: string
    status: string
    sent: string
  }
}

export default function DashboardModal({ isOpen, onClose, justification }: DashboardModalProps) {
  const [showResponseModal, setShowResponseModal] = React.useState(false)
  const [action, setAction] = React.useState<'approve' | 'reject' | null>(null)
  const [response, setResponse] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  if (!isOpen) return null

  const handleApprove = () => {
    setAction('approve')
    setShowResponseModal(true)
  }

  const handleReject = () => {
    setAction('reject')
    setShowResponseModal(true)
  }

  const handleSubmitResponse = async () => {
    if (!response.trim()) {
      alert('Por favor, escribe una respuesta para el estudiante')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      
      const endpoint = action === 'approve' 
        ? `http://localhost:5000/api/justifications/${justification.id}/approve`
        : `http://localhost:5000/api/justifications/${justification.id}/reject`

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          professor_id: user.id,
          admin_response: response
        })
      })

      const data = await res.json()

      if (data.success) {
        alert(`✅ Justificación ${action === 'approve' ? 'aprobada' : 'rechazada'} exitosamente`)
        window.location.reload() // Recargar para actualizar la lista
      } else {
        alert(`❌ Error: ${data.message}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al procesar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  // Usar datos REALES del estudiante y la justificación
  console.log('🔍 DEBUG - Justification recibida:', justification)
  console.log('🔍 DEBUG - attachment_filename:', justification.attachment_filename)
  console.log('🔍 DEBUG - attachment:', justification.attachment)
  console.log('🔍 DEBUG - attachment_type:', justification.attachment_type)
  
  const extendedData = {
    email: justification.email || "No disponible",
    phone: justification.phone || "No disponible",
    career: justification.career || "No disponible",
    semester: justification.semester || "No disponible",
    detailedDescription: justification.description || "Sin descripción detallada",
    // Manejar archivos adjuntos - puede venir como attachment o attachment_filename
    attachments: justification.attachment_filename 
      ? [{
          filename: justification.attachment_filename,
          path: justification.attachment || justification.attachment_path || `/uploads/justifications/${justification.attachment_filename}`,
          type: justification.attachment_type || 'application/pdf'
        }] 
      : []
  }
  
  console.log('📎 Archivos adjuntos procesados:', extendedData.attachments)
  console.log('📎 Cantidad de archivos:', extendedData.attachments.length)

  const handleDownload = (filePath: string, filename: string) => {
    const url = `http://localhost:5000${filePath}`
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleView = (filePath: string) => {
    const url = `http://localhost:5000${filePath}`
    window.open(url, '_blank')
  }

  const isImage = (type: string) => {
    return type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(type)
  }

  const isPDF = (type: string) => {
    return type === 'application/pdf' || type?.endsWith('.pdf')
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl overflow-y-auto w-full max-w-5xl max-h-[95vh] min-h-[600px] border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con carrera y semestre */}
        <div className="bg-slate-700 px-6 py-5 border-b border-slate-600">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Detalles de Justificación</h1>
                <p className="text-slate-300 text-sm">Información completa de la solicitud</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="bg-slate-600 px-3 py-2 rounded-lg">
                <span className="text-slate-300 text-xs block mb-0.5">Carrera:</span>
                <p className="font-medium text-white text-sm">{extendedData.career}</p>
              </div>
              <div className="bg-slate-600 px-3 py-2 rounded-lg">
                <span className="text-slate-300 text-xs block mb-0.5">Semestre:</span>
                <p className="font-medium text-white text-sm">{extendedData.semester}</p>
              </div>
              <button
                className="w-9 h-9 bg-slate-600 hover:bg-slate-500 rounded-lg text-slate-200 transition-colors flex items-center justify-center"
                onClick={onClose}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="px-8 py-8">
          {/* Información del Estudiante */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span>Información del Estudiante</span>
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-600 text-xs block mb-1 font-medium">
                  Nombre completo:
                </span>
                <p className="font-medium text-gray-900">{justification.student}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-600 text-xs block mb-1 font-medium">
                  Código estudiantil:
                </span>
                <p className="font-medium text-gray-900 font-mono">{justification.code}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-600 text-xs block mb-1 font-medium">
                  Correo electrónico:
                </span>
                <p className="font-medium text-gray-900 text-sm break-all">{extendedData.email}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-600 text-xs block mb-1 font-medium">
                  Teléfono:
                </span>
                <p className="font-medium text-gray-900">{extendedData.phone}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-600 text-xs block mb-1 font-medium">
                  Carrera:
                </span>
                <p className="font-medium text-gray-900">{extendedData.career}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-600 text-xs block mb-1 font-medium">
                  Semestre:
                </span>
                <p className="font-medium text-gray-900">{extendedData.semester}</p>
              </div>
            </div>
          </div>

          {/* Detalles de la Justificación */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span>Detalles de la Justificación</span>
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-600 text-xs block mb-1 font-medium">
                  Fecha de inasistencia:
                </span>
                <p className="font-medium text-gray-900">{justification.date}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-600 text-xs block mb-1 font-medium">
                  Curso/Materia:
                </span>
                <p className="font-medium text-gray-900">{justification.course}</p>
              </div>

              <div className="lg:col-span-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-600 text-xs block mb-2 font-medium">
                  Descripción detallada:
                </span>
                <div className="bg-white p-4 rounded-lg border-l-2 border-slate-600">
                  <p className="text-gray-900 leading-relaxed text-sm">{extendedData.detailedDescription}</p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-600 text-xs block mb-2 font-medium">
                  Estado actual:
                </span>
                <span className={`inline-block px-3 py-1 rounded text-sm font-medium border ${
                  justification.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                  justification.status === 'Aprobada' ? 'bg-green-100 text-green-700 border-green-200' :
                  'bg-red-100 text-red-700 border-red-200'
                }`}>
                  {justification.status === 'Pendiente' ? 'Pendiente' :
                   justification.status === 'Aprobada' ? 'Aprobada' : 'Rechazada'}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-600 text-xs block mb-1 font-medium">
                  Fecha de envío:
                </span>
                <p className="font-medium text-gray-900">{justification.sent}</p>
              </div>
            </div>
          </div>

          {/* Archivos Adjuntos */}
          {extendedData.attachments && extendedData.attachments.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </div>
                <span>Archivos Adjuntos</span>
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {extendedData.attachments.map((file: any, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    {/* Header del archivo */}
                    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                          {isImage(file.type) ? (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-900 font-medium text-sm block">{file.filename}</span>
                          <span className="text-gray-600 text-xs">
                            {isImage(file.type) ? 'Imagen' : isPDF(file.type) ? 'PDF' : 'Documento'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleView(file.path)}
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Ver
                        </button>
                        <button 
                          onClick={() => handleDownload(file.path, file.filename)}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Descargar
                        </button>
                      </div>
                    </div>
                    
                    {/* Vista previa */}
                    <div className="p-4">
                      {isImage(file.type) ? (
                        <div className="bg-white rounded-lg p-3">
                          <img 
                            src={`http://localhost:5000${file.path}`} 
                            alt={file.filename}
                            className="w-full h-auto max-h-96 object-contain rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle"%3EImagen no disponible%3C/text%3E%3C/svg%3E'
                            }}
                          />
                        </div>
                      ) : isPDF(file.type) ? (
                        <div className="bg-white rounded-lg p-4">
                          <iframe 
                            src={`http://localhost:5000${file.path}`}
                            className="w-full h-96 rounded-lg border border-gray-200"
                            title={file.filename}
                          />
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg p-6 text-center">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-gray-600 font-medium text-sm">Vista previa no disponible</p>
                          <p className="text-gray-500 text-xs mt-1">Haz clic en "Ver" o "Descargar"</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer con botones */}
        {justification.status === "Pendiente" && (
          <div className="flex flex-col sm:flex-row justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2"
              onClick={handleReject}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Rechazar
            </button>
            <button
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2"
              onClick={handleApprove}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Aprobar
            </button>
          </div>
        )}
      </div>

      {/* Modal de Respuesta */}
      {showResponseModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={(e) => {
            // Solo cerrar si se hace clic en el overlay, no en el contenido
            if (e.target === e.currentTarget) {
              setShowResponseModal(false)
              setResponse('')
              setAction(null)
            }
          }}
        >
          <div 
            className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {action === 'approve' ? 'Aprobar Justificación' : 'Rechazar Justificación'}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Escribe un mensaje para el estudiante explicando tu decisión:
            </p>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Ejemplo: Tu justificación ha sido aprobada. Recuerda presentar el certificado médico original..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none mb-4 text-sm"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowResponseModal(false)
                  setResponse('')
                  setAction(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium text-sm"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitResponse}
                disabled={loading || !response.trim()}
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } disabled:bg-gray-400 disabled:cursor-not-allowed`}
              >
                {loading ? 'Procesando...' : action === 'approve' ? 'Aprobar' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}