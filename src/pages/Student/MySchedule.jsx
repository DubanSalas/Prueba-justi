import { useState, useEffect } from 'react'
import StudentLayout from '../../components/Student/StudentLayout'

export default function MySchedule() {
  const [schedule, setSchedule] = useState([
    { day: 'Lunes', courses: [
      { name: 'Matemáticas', time: '08:00 - 10:00', room: 'A-101', professor: 'Dr. García' },
      { name: 'Física', time: '10:15 - 12:15', room: 'B-203', professor: 'Dra. Martínez' }
    ]},
    { day: 'Martes', courses: [
      { name: 'Programación', time: '08:00 - 10:00', room: 'C-301', professor: 'Ing. López' },
      { name: 'Base de Datos', time: '14:00 - 16:00', room: 'C-302', professor: 'Ing. Rodríguez' }
    ]},
    { day: 'Miércoles', courses: [
      { name: 'Matemáticas', time: '08:00 - 10:00', room: 'A-101', professor: 'Dr. García' }
    ]},
    { day: 'Jueves', courses: [
      { name: 'Programación', time: '08:00 - 10:00', room: 'C-301', professor: 'Ing. López' }
    ]},
    { day: 'Viernes', courses: [
      { name: 'Física', time: '10:15 - 12:15', room: 'B-203', professor: 'Dra. Martínez' }
    ]}
  ])

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Mi Horario</h1>
          <p className="text-sm text-gray-600 mt-1">Consulta tu horario de clases semanal</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {schedule.map((day) => (
              <div key={day.day} className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-center">{day.day}</h3>
                <div className="space-y-3">
                  {day.courses.map((course, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="font-medium text-sm text-gray-900">{course.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{course.time}</p>
                      <p className="text-xs text-gray-500 mt-1">{course.room}</p>
                      <p className="text-xs text-gray-500">{course.professor}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
