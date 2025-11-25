import { useState, useEffect } from 'react'
import axios from 'axios'
import ProfessorLayout from '../../components/Professor/ProfessorLayout'

export default function Attendance() {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(false)
  const [criticalStudents, setCriticalStudents] = useState([])
  const [atRiskStudents, setAtRiskStudents] = useState([])
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    fetchCourses()
    fetchStudentsWithStats()
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentsAndAttendance()
    }
  }, [selectedCourse, selectedDate])

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/professors/${user.id}/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCourses(response.data.data || [])
      if (response.data.data?.length > 0) {
        setSelectedCourse(response.data.data[0].id)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const fetchStudentsWithStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/students/?include_stats=true', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        const studentsData = response.data.data.students || []
        
        // Filtrar estudiantes reprobados (<70%)
        const critical = studentsData.filter(student => 
          (student.attendance_percentage || 100) < 70
        ).map(student => ({
          ...student,
          full_name: student.full_name || `${student.first_name} ${student.last_name}`
        }))
        
        // Filtrar estudiantes en riesgo (70-79%)
        const atRisk = studentsData.filter(student => {
          const percentage = student.attendance_percentage || 100
          return percentage >= 70 && percentage < 80
        }).map(student => ({
          ...student,
          full_name: student.full_name || `${student.first_name} ${student.last_name}`
        }))
        
        setCriticalStudents(critical)
        setAtRiskStudents(atRisk)
        console.log(`❌ Reprobados: ${critical.length}, 🟠 En riesgo: ${atRisk.length}`)
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    }
  }

  const fetchStudentsAndAttendance = async () => {
    if (!selectedCourse) return
    
    setLoading(true)
    try {
      const [studentsRes, attendanceRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/courses/${selectedCourse}/students`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:5000/api/attendance/course/${selectedCourse}/date/${selectedDate}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      setStudents(studentsRes.data.data || [])
      
      const attendanceMap = {}
      if (attendanceRes.data.data) {
        attendanceRes.data.data.forEach(record => {
          attendanceMap[record.student_id] = record.status
        })
      }
      setAttendance(attendanceMap)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }))
  }

  const saveAttendance = async () => {
    if (!selectedCourse) {
      alert('Selecciona un curso')
      return
    }

    try {
      const records = students.map(student => ({
        student_id: student.id,
        course_id: selectedCourse,
        attendance_date: selectedDate,
        status: attendance[student.id] || 'AUSENTE',
        recorded_by: user.id
      }))

      await axios.post(
        'http://localhost:5000/api/attendance/bulk',
        { records },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      alert('Asistencia guardada exitosamente')
      fetchStudentsAndAttendance()
    } catch (error) {
      alert('Error al guardar la asistencia')
      console.error('Error:', error)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'PRESENTE': 'bg-green-100 text-green-800 border-green-300',
      'AUSENTE': 'bg-red-100 text-red-800 border-red-300',
      'TARDANZA': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'JUSTIFICADO': 'bg-blue-100 text-blue-800 border-blue-300'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  return (
    <ProfessorLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Registro de Asistencias</h1>
            <p className="text-gray-600">Registra la asistencia de tus estudiantes</p>
          </div>

          {/* Alertas de Inasistencia Crítica */}
          {(criticalStudents.length > 0 || atRiskStudents.length > 0) && (
            <div className="space-y-4 mb-6">
              {/* Estudiantes REPROBADOS */}
              {criticalStudents.length > 0 && (
                <div className="bg-gradient-to-r from-red-700 to-red-900 rounded-2xl shadow-2xl p-6 border-4 border-red-950 animate-pulse">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-4 rounded-full">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">❌ ESTUDIANTES REPROBADOS</h3>
                        <p className="text-red-100 text-lg">
                          {criticalStudents.length} estudiante(s) con más del 30% de inasistencias
                        </p>
                        <p className="text-red-200 text-sm">⚠️ Han reprobado el curso por faltas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-bold">{criticalStudents.length}</div>
                      <div className="text-sm text-red-200">Reprobados</div>
                    </div>
                  </div>
                  
                  {/* Mini lista de reprobados */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {criticalStudents.slice(0, 6).map((student) => (
                      <div key={student.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <div className="flex items-center justify-between text-white">
                          <div className="flex-1">
                            <p className="font-bold text-sm">{student.full_name}</p>
                            <p className="text-xs text-red-100">{student.student_code}</p>
                            <p className="text-xs font-bold mt-1">{(student.attendance_percentage || 0).toFixed(1)}% asistencia</p>
                          </div>
                          <div className="text-2xl">❌</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Estudiantes EN RIESGO */}
              {atRiskStudents.length > 0 && (
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-xl p-6 border-4 border-orange-600">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-4 rounded-full">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">🟠 ESTUDIANTES EN RIESGO</h3>
                        <p className="text-orange-100 text-lg">
                          {atRiskStudents.length} estudiante(s) con 70-79% de asistencia
                        </p>
                        <p className="text-orange-200 text-sm">⚠️ Cerca del límite de reprobación</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-bold">{atRiskStudents.length}</div>
                      <div className="text-sm text-orange-200">En Riesgo</div>
                    </div>
                  </div>
                  
                  {/* Mini lista de en riesgo */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {atRiskStudents.slice(0, 6).map((student) => (
                      <div key={student.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <div className="flex items-center justify-between text-white">
                          <div className="flex-1">
                            <p className="font-bold text-sm">{student.full_name}</p>
                            <p className="text-xs text-orange-100">{student.student_code}</p>
                            <p className="text-xs font-bold mt-1">{(student.attendance_percentage || 0).toFixed(1)}% asistencia</p>
                          </div>
                          <div className="text-2xl">🟠</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Curso</label>
                <select
                  value={selectedCourse || ''}
                  onChange={(e) => setSelectedCourse(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecciona un curso</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.course_code} - {course.course_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Lista de Estudiantes */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : students.length > 0 ? (
            <>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estudiante
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map(student => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.student_code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.first_name} {student.last_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center gap-2">
                            {['PRESENTE', 'AUSENTE', 'TARDANZA', 'JUSTIFICADO'].map(status => (
                              <button
                                key={status}
                                onClick={() => handleAttendanceChange(student.id, status)}
                                className={`px-3 py-1 rounded-lg text-xs font-medium border-2 transition-all ${
                                  attendance[student.id] === status
                                    ? getStatusColor(status)
                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {status === 'PRESENTE' && '✓ Presente'}
                                {status === 'AUSENTE' && '✗ Ausente'}
                                {status === 'TARDANZA' && '⏰ Tardanza'}
                                {status === 'JUSTIFICADO' && '📝 Justificado'}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Resumen */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                  <p className="text-sm text-green-600 mb-1">Presentes</p>
                  <p className="text-2xl font-bold text-green-700">
                    {Object.values(attendance).filter(s => s === 'PRESENTE').length}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                  <p className="text-sm text-red-600 mb-1">Ausentes</p>
                  <p className="text-2xl font-bold text-red-700">
                    {Object.values(attendance).filter(s => s === 'AUSENTE').length}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
                  <p className="text-sm text-yellow-600 mb-1">Tardanzas</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {Object.values(attendance).filter(s => s === 'TARDANZA').length}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                  <p className="text-sm text-blue-600 mb-1">Justificados</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {Object.values(attendance).filter(s => s === 'JUSTIFICADO').length}
                  </p>
                </div>
              </div>

              {/* Botón Guardar */}
              <button
                onClick={saveAttendance}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
              >
                💾 Guardar Asistencia
              </button>
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un curso</h3>
              <p className="text-gray-500">Elige un curso para registrar la asistencia</p>
            </div>
          )}
        </div>
    </ProfessorLayout>
  )
}
