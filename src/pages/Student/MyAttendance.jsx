import { useState, useEffect } from 'react'
import axios from 'axios'
import StudentLayout from '../../components/Student/StudentLayout'

export default function MyAttendance() {
  const [attendanceData, setAttendanceData] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/students/${user.id}/attendance`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setAttendanceData(response.data.data || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAttendance()
  }, [user.id, token])

  const totalPresent = attendanceData.reduce((sum, c) => sum + c.present, 0)
  const totalAbsent = attendanceData.reduce((sum, c) => sum + c.absent, 0)
  const totalClasses = attendanceData.reduce((sum, c) => sum + c.total, 0)
  const overallPercentage = totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0

  const getStatusColor = (percentage) => {
    if (percentage >= 90) return 'text-green-700 bg-green-50 border-green-200'
    if (percentage >= 75) return 'text-yellow-700 bg-yellow-50 border-yellow-200'
    return 'text-red-700 bg-red-50 border-red-200'
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

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Mi Asistencia</h1>
          <p className="text-sm text-gray-600 mt-1">Consulta tu registro de asistencia por curso</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Asistencia General</p>
              <p className="text-4xl font-bold text-gray-900">{overallPercentage.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Clases Asistidas</p>
              <p className="text-4xl font-bold text-green-600">{totalPresent}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Inasistencias</p>
              <p className="text-4xl font-bold text-red-600">{totalAbsent}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Clases</p>
              <p className="text-4xl font-bold text-gray-900">{totalClasses}</p>
            </div>
          </div>
        </div>

        {attendanceData.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros de asistencia</h3>
            <p className="text-gray-500">Aún no se han registrado asistencias para tus cursos</p>
          </div>
        ) : (
          <div className="space-y-4">
            {attendanceData.map((item, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{item.course}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(item.percentage)}`}>
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
              
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      item.percentage >= 90 ? 'bg-green-600' :
                      item.percentage >= 75 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Asistencias</p>
                  <p className="text-2xl font-bold text-green-600">{item.present}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Inasistencias</p>
                  <p className="text-2xl font-bold text-red-600">{item.absent}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{item.total}</p>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </StudentLayout>
  )
}
