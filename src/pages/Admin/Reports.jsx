import { useState, useEffect } from 'react'
import axios from 'axios'

function AdminReports() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showAttendanceModal, setShowAttendanceModal] = useState(false)
    const [studentsAtRisk, setStudentsAtRisk] = useState([])
    const [criticalStudents, setCriticalStudents] = useState([])
    const token = localStorage.getItem('token')

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/professor/dashboard/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setStats(response.data.data)
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [token])

    const fetchAttendanceAlerts = async () => {
        try {
            const [riskRes, criticalRes] = await Promise.all([
                axios.get('http://localhost:5000/api/professor/dashboard/students-at-risk', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:5000/api/professor/dashboard/students-critical', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ])

            const atRisk = riskRes.data.data.filter(s =>
                s.attendance_stats.absence_percentage >= 25 &&
                s.attendance_stats.absence_percentage < 30
            )

            setStudentsAtRisk(atRisk)
            setCriticalStudents(criticalRes.data.data)
            setShowAttendanceModal(true)
        } catch (error) {
            console.error('Error:', error)
            alert('Error al cargar las alertas de inasistencia')
        }
    }

    const downloadReport = async (type, format) => {
        try {
            // Mostrar mensaje de carga
            const loadingMsg = document.createElement('div')
            loadingMsg.id = 'loading-download'
            loadingMsg.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2'
            loadingMsg.innerHTML = `
                <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generando reporte...</span>
            `
            document.body.appendChild(loadingMsg)

            let url = ''
            if (type === 'students' && format === 'pdf') {
                url = 'http://localhost:5000/api/reports/students/pdf'
            } else if (type === 'students' && format === 'excel') {
                url = 'http://localhost:5000/api/reports/students/excel'
            } else if (type === 'professors' && format === 'pdf') {
                url = 'http://localhost:5000/api/reports/professors/pdf'
            }

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            })

            const blob = new Blob([response.data], {
                type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            })
            const link = document.createElement('a')
            link.href = window.URL.createObjectURL(blob)
            link.download = `reporte_${type}_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
            link.click()

            // Remover mensaje de carga
            document.getElementById('loading-download')?.remove()

            // Mostrar mensaje de éxito
            const successMsg = document.createElement('div')
            successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2'
            successMsg.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>¡Reporte descargado exitosamente!</span>
            `
            document.body.appendChild(successMsg)
            setTimeout(() => successMsg.remove(), 3000)

        } catch (error) {
            // Remover mensaje de carga
            document.getElementById('loading-download')?.remove()

            // Mostrar mensaje de error
            const errorMsg = document.createElement('div')
            errorMsg.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2'
            errorMsg.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                <span>Error al descargar el reporte</span>
            `
            document.body.appendChild(errorMsg)
            setTimeout(() => errorMsg.remove(), 3000)

            console.error('Error:', error)
        }
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
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes y Estadísticas</h1>
                <p className="text-gray-600">Visualiza y descarga reportes del sistema</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Total Estudiantes</p>
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats?.total_students || 0}</p>
                </div>

                <div className="bg-red-50 rounded-lg shadow-sm p-6 border-2 border-red-200">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-red-600">En Riesgo</p>
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-red-700">{stats?.students_at_risk || 0}</p>
                </div>

                <div className="bg-yellow-50 rounded-lg shadow-sm p-6 border-2 border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-yellow-600">Pendientes</p>
                        <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-yellow-700">{stats?.pending_justifications || 0}</p>
                </div>

                <div className="bg-green-50 rounded-lg shadow-sm p-6 border-2 border-green-200">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-green-600">Asistencia Promedio</p>
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-green-700">{stats?.average_attendance || 0}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Reporte de Estudiantes</h3>
                            <p className="text-sm text-gray-600">Lista completa con estadísticas de asistencia</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => downloadReport('students', 'pdf')}
                            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Descargar PDF
                        </button>
                        <button
                            onClick={() => downloadReport('students', 'excel')}
                            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Descargar Excel
                        </button>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-700">
                            <strong>Incluye:</strong> Código, nombre, carrera, porcentaje de asistencia, nivel de riesgo
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Reporte de Profesores</h3>
                            <p className="text-sm text-gray-600">Lista completa del cuerpo docente</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => downloadReport('professors', 'pdf')}
                            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Descargar PDF
                        </button>
                    </div>

                    <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-xs text-purple-700">
                            <strong>Incluye:</strong> Código, nombre, especialización, departamento, rol
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Estadísticas de Asistencia</h3>
                            <p className="text-sm text-gray-600">Análisis detallado de asistencias</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Asistencia Promedio</span>
                                <span className="text-lg font-bold text-gray-900">{stats?.average_attendance || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${stats?.average_attendance || 0}%` }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-xs text-green-600 mb-1">Normal</p>
                                <p className="text-xl font-bold text-green-700">{stats?.students_normal || 0}</p>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                <p className="text-xs text-red-600 mb-1">En Riesgo</p>
                                <p className="text-xl font-bold text-red-700">{stats?.students_at_risk || 0}</p>
                            </div>
                        </div>

                        <button
                            onClick={fetchAttendanceAlerts}
                            className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            Ver Alertas de Inasistencia
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Justificaciones</h3>
                            <p className="text-sm text-gray-600">Estado de las solicitudes</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <span className="text-sm text-yellow-700">Pendientes</span>
                            <span className="text-xl font-bold text-yellow-700">{stats?.pending_justifications || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                            <span className="text-sm text-green-700">Aprobadas</span>
                            <span className="text-xl font-bold text-green-700">{stats?.approved_justifications || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                            <span className="text-sm text-red-700">Rechazadas</span>
                            <span className="text-xl font-bold text-red-700">{stats?.rejected_justifications || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {showAttendanceModal && (
                <AttendanceAlertModal
                    studentsAtRisk={studentsAtRisk}
                    criticalStudents={criticalStudents}
                    onClose={() => setShowAttendanceModal(false)}
                />
            )}
        </div>
    )
}

function AttendanceAlertModal({ studentsAtRisk, criticalStudents, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
                <div className="sticky top-0 bg-slate-700 px-6 py-5 border-b border-slate-600">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="text-white">
                                <h2 className="text-lg font-semibold">Reporte de Asistencia</h2>
                                <p className="text-slate-300 text-sm">Estudiantes que requieren atención</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 bg-slate-600 hover:bg-slate-500 rounded-lg text-slate-200 transition-colors flex items-center justify-center"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {criticalStudents.length > 0 && (
                        <div className="space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-red-900">Estudiantes Críticos</h3>
                                            <p className="text-red-700 text-sm">30% o más de inasistencias</p>
                                        </div>
                                    </div>
                                    <div className="bg-red-600 px-4 py-2 rounded-lg">
                                        <span className="text-2xl font-bold text-white">{criticalStudents.length}</span>
                                        <span className="text-sm ml-2">estudiante{criticalStudents.length !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {criticalStudents.map((student) => (
                                    <div key={student.id} className="bg-red-50 border-2 border-red-300 rounded-xl p-4 hover:shadow-lg transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-bold text-gray-900">{student.full_name}</h4>
                                                    <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold">
                                                        CRÍTICO
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{student.student_code} • {student.career}</p>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Inasistencias: </span>
                                                        <span className="font-bold text-red-700">
                                                            {student.attendance_stats.absence_percentage.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Ausentes: </span>
                                                        <span className="font-bold text-gray-900">
                                                            {student.attendance_stats.absent}/{student.attendance_stats.total_classes}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {studentsAtRisk.length > 0 && (
                        <div className="space-y-4">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-orange-900">Estudiantes en Riesgo</h3>
                                            <p className="text-orange-700 text-sm">25-29% de inasistencias</p>
                                        </div>
                                    </div>
                                    <div className="bg-orange-600 px-4 py-2 rounded-lg">
                                        <span className="text-2xl font-bold text-white">{studentsAtRisk.length}</span>
                                        <span className="text-xs ml-1 text-white">estudiante{studentsAtRisk.length !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {studentsAtRisk.map((student) => (
                                    <div key={student.id} className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4 hover:shadow-lg transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-bold text-gray-900">{student.full_name}</h4>
                                                    <span className="px-3 py-1 bg-orange-600 text-white rounded-full text-xs font-bold">
                                                        EN RIESGO
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{student.student_code} • {student.career}</p>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Inasistencias: </span>
                                                        <span className="font-bold text-orange-700">
                                                            {student.attendance_stats.absence_percentage.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Ausentes: </span>
                                                        <span className="font-bold text-gray-900">
                                                            {student.attendance_stats.absent}/{student.attendance_stats.total_classes}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {criticalStudents.length === 0 && studentsAtRisk.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">¡Excelente!</h3>
                            <p className="text-gray-600">No hay estudiantes con alertas de inasistencia</p>
                        </div>
                    )}

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-blue-900">
                                <p className="font-bold mb-1">Reporte generado el {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: 'numeric' })}</p>
                                <p>Datos actualizados en tiempo real</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-0 bg-gray-50 px-8 py-4 rounded-b-3xl border-t flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                    >
                        Cerrar
                    </button>
                    <button
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Enviar Alertas Masivas
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AdminReports
