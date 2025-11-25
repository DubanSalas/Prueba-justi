import StudentLayout from '../../components/Student/StudentLayout'

export default function MyGrades() {
  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Mis Notas</h1>
          <p className="text-sm text-gray-600 mt-1">Consulta tus calificaciones y promedio académico</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo de Calificaciones</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            El módulo de calificaciones estará disponible próximamente. Por ahora, el sistema se enfoca en la gestión de asistencias y justificaciones.
          </p>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-700">
              <strong>Nota:</strong> Para consultar tus calificaciones, por favor contacta con tu coordinador académico o revisa el sistema académico principal de la institución.
            </p>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
