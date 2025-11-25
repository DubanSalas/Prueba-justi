import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentLayout from '../../components/Student/StudentLayout'

export default function MyProfile() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [profile] = useState({
    code: user.student_code || 'EST-2024-001',
    firstName: user.first_name || 'Juan',
    lastName: user.last_name || 'Pérez',
    email: user.email || 'juan.perez@vallegrande.edu.pe',
    phone: '987654321',
    career: 'Ingeniería de Sistemas',
    semester: '6to Semestre',
    enrollmentDate: '2022-03-15',
    status: 'Activo'
  })

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Mi Perfil</h1>
          <p className="text-sm text-gray-600 mt-1">Información personal y académica</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-slate-700">
                  {profile.firstName[0]}{profile.lastName[0]}
                </span>
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h2>
                <p className="text-slate-300">{profile.code}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600">Nombres</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{profile.firstName}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Apellidos</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{profile.lastName}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Correo Electrónico</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{profile.email}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Teléfono</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{profile.phone}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Información Académica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600">Código de Estudiante</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{profile.code}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Carrera</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{profile.career}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Semestre Actual</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{profile.semester}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Fecha de Matrícula</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {new Date(profile.enrollmentDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Estado</label>
                  <span className="inline-block mt-1 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                    {profile.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Seguridad</h3>
              <button 
                onClick={() => navigate('/student/change-password')}
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 transition-all shadow-sm font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Cambiar Contraseña
              </button>
              <p className="text-xs text-gray-500 mt-2">Actualiza tu contraseña para mantener tu cuenta segura</p>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
