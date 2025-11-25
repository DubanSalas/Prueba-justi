"use client"

interface JustificationModalProps {
  isOpen: boolean
  onClose: () => void
  justification: {
    id: number
    student_name: string
    student_email: string
    status: string
    absence_date: string
    course_subject: string
    reason: string
    career: string
    description: string
    attachments: string[]
    submission_date: string
    student_code?: string
    student_phone?: string
    semester?: string
  } | null
  onApprove?: (id: number) => void
  onReject?: (id: number) => void
}

export default function JustificationModal({
  isOpen,
  onClose,
  justification,
  onApprove,
  onReject,
}: JustificationModalProps) {
  if (!isOpen || !justification) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6" 
      onClick={onClose}
    >
      <div 
        className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden w-full max-w-5xl max-h-[95vh] animate-in zoom-in-95 duration-300 border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con carrera y semestre */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600"></div>
          <div className="relative px-6 sm:px-8 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Detalles de Justificación</h1>
                  <p className="text-purple-100 text-sm">Información completa de la solicitud académica</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-lg">
                  <span className="text-purple-100 text-sm block mb-1 font-medium">🎓 Carrera:</span>
                  <p className="font-bold text-white text-lg">{justification.career}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-lg">
                  <span className="text-purple-100 text-sm block mb-1 font-medium">📚 Semestre:</span>
                  <p className="font-bold text-white text-lg">{justification.semester || "4to Semestre"}</p>
                </div>
              </div>
              <button
                className="self-end sm:self-auto w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl text-white hover:bg-white/30 transition-all duration-300 flex items-center justify-center transform hover:scale-105"
                onClick={onClose}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 py-8 overflow-y-auto max-h-[calc(95vh-200px)]">
          {/* Información del Estudiante */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Información del Estudiante</div>
                <div className="text-sm text-gray-500">Datos personales y académicos</div>
              </div>
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="group p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300">
                <span className="text-blue-700 text-sm block mb-2 font-semibold flex items-center gap-2">
                  👤 Nombre completo:
                </span>
                <p className="font-bold text-gray-900 text-lg">{justification.student_name}</p>
              </div>
              <div className="group p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-300">
                <span className="text-purple-700 text-sm block mb-2 font-semibold flex items-center gap-2">
                  🆔 Código estudiantil:
                </span>
                <p className="font-bold text-gray-900 text-lg font-mono">{justification.student_code || "2024001234"}</p>
              </div>
              <div className="group p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-300">
                <span className="text-green-700 text-sm block mb-2 font-semibold flex items-center gap-2">
                  📧 Correo electrónico:
                </span>
                <p className="font-bold text-gray-900 text-base break-all">{justification.student_email}</p>
              </div>
              <div className="group p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-100 hover:shadow-lg transition-all duration-300">
                <span className="text-orange-700 text-sm block mb-2 font-semibold flex items-center gap-2">
                  📱 Teléfono:
                </span>
                <p className="font-bold text-gray-900 text-base">{justification.student_phone || "+51 987 654 321"}</p>
              </div>
              <div className="group p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl border border-teal-100 hover:shadow-lg transition-all duration-300">
                <span className="text-teal-700 text-sm block mb-2 font-semibold flex items-center gap-2">
                  🎓 Carrera:
                </span>
                <p className="font-bold text-gray-900 text-base">{justification.career}</p>
              </div>
              <div className="group p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border border-rose-100 hover:shadow-lg transition-all duration-300">
                <span className="text-rose-700 text-sm block mb-2 font-semibold flex items-center gap-2">
                  📚 Semestre:
                </span>
                <p className="font-bold text-gray-900 text-base">{justification.semester || "4to Semestre"}</p>
              </div>
            </div>
          </div>

          {/* Detalles de la Justificación */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Detalles de la Justificación</div>
                <div className="text-sm text-gray-500">Información específica de la solicitud</div>
              </div>
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="group p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300">
                <span className="text-blue-700 text-sm block mb-3 font-semibold flex items-center gap-2">
                  📅 Fecha de inasistencia:
                </span>
                <p className="font-bold text-gray-900 text-xl">{formatDate(justification.absence_date)}</p>
              </div>

              <div className="group p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-300">
                <span className="text-green-700 text-sm block mb-3 font-semibold flex items-center gap-2">
                  📚 Curso/Materia:
                </span>
                <p className="font-bold text-gray-900 text-xl">{justification.course_subject}</p>
              </div>

              <div className="lg:col-span-2 group p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-300">
                <span className="text-purple-700 text-sm block mb-4 font-semibold flex items-center gap-2">
                  📝 Descripción detallada:
                </span>
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border-l-4 border-purple-500 shadow-lg">
                  <p className="text-gray-900 leading-relaxed text-lg">{justification.description}</p>
                </div>
              </div>

              <div className="group p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-100 hover:shadow-lg transition-all duration-300">
                <span className="text-orange-700 text-sm block mb-3 font-semibold flex items-center gap-2">
                  ⚡ Estado actual:
                </span>
                <span className={`inline-block px-6 py-3 rounded-2xl text-lg font-bold shadow-lg ${
                  justification.status === 'Pendiente' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                  justification.status === 'Aprobada' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                  'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                }`}>
                  {justification.status === 'Pendiente' ? '⏳ Pendiente' :
                   justification.status === 'Aprobada' ? '✅ Aprobada' : '❌ Rechazada'}
                </span>
              </div>

              <div className="group p-6 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl border border-teal-100 hover:shadow-lg transition-all duration-300">
                <span className="text-teal-700 text-sm block mb-3 font-semibold flex items-center gap-2">
                  🕒 Fecha de envío:
                </span>
                <p className="font-bold text-gray-900 text-lg">{formatDateTime(justification.submission_date)}</p>
              </div>
            </div>
          </div>

          {/* Archivos Adjuntos */}
          {justification.attachments && justification.attachments.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Archivos Adjuntos</div>
                  <div className="text-sm text-gray-500">Documentos de respaldo de la justificación</div>
                </div>
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {justification.attachments.map((file: string, index: number) => (
                  <div key={index} className="group flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-102">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-gray-900 font-bold text-lg block">{file}</span>
                        <span className="text-blue-600 text-sm font-semibold">📎 Documento adjunto</span>
                      </div>
                    </div>
                    <button className="group px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2">
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Descargar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer con botones */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 px-8 py-8 border-t border-gray-200">
          {justification.status === "Pendiente" && onApprove && onReject && (
            <>
              <button
                className="group px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-2xl transform hover:scale-105"
                onClick={() => onReject(justification.id)}
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Rechazar Solicitud
              </button>
              <button
                className="group px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-2xl transform hover:scale-105"
                onClick={() => onApprove(justification.id)}
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Aprobar Solicitud
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}