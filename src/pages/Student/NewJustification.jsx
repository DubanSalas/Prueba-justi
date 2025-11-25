import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import StudentLayout from '../../components/Student/StudentLayout'

export default function NewJustification() {
  const [formData, setFormData] = useState({
    absence_date: '',
    course_id: '',
    reason_type: '',
    reason_description: ''
  })
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')

  const reasonTypes = [
    'Enfermedad',
    'Cita Médica',
    'Emergencia Familiar',
    'Trámite Personal',
    'Problema de Transporte',
    'Otro'
  ]

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/students/${user.id}/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCourses(response.data.data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, file: 'Solo se permiten imágenes (JPG, PNG, GIF) o PDF' }))
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, file: 'El archivo no debe superar los 5MB' }))
        return
      }

      setSelectedFile(file)
      setErrors(prev => ({ ...prev, file: '' }))

      // Crear preview si es imagen
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreview(reader.result)
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null)
      }
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
    setErrors(prev => ({ ...prev, file: '' }))
  }

  const validate = () => {
    const newErrors = {}

    // CURSO: Obligatorio
    if (!formData.course_id) {
      newErrors.course_id = 'El curso es obligatorio'
    }

    // FECHA DE AUSENCIA: Obligatoria y no puede ser futura
    if (!formData.absence_date) {
      newErrors.absence_date = 'La fecha de ausencia es obligatoria'
    } else {
      const selectedDate = new Date(formData.absence_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate > today) {
        newErrors.absence_date = 'La fecha no puede ser futura'
      }

      // Validar que no sea más de 30 días atrás
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      thirtyDaysAgo.setHours(0, 0, 0, 0)
      
      if (selectedDate < thirtyDaysAgo) {
        newErrors.absence_date = 'La fecha no puede ser mayor a 30 días atrás'
      }
    }

    // MOTIVO: Obligatorio
    if (!formData.reason_type) {
      newErrors.reason_type = 'El motivo es obligatorio'
    }

    // DESCRIPCIÓN: Obligatoria, mínimo 20 caracteres, máximo 500
    if (!formData.reason_description || formData.reason_description.trim().length === 0) {
      newErrors.reason_description = 'La descripción es obligatoria'
    } else if (formData.reason_description.trim().length < 20) {
      newErrors.reason_description = 'La descripción debe tener al menos 20 caracteres'
    } else if (formData.reason_description.trim().length > 500) {
      newErrors.reason_description = 'La descripción no puede superar los 500 caracteres'
    }

    // ARCHIVO: Obligatorio
    if (!selectedFile) {
      newErrors.file = 'Debes adjuntar una evidencia (certificado médico, comprobante, etc.)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setLoading(true)

    try {
      // Crear FormData para enviar archivo
      const submitData = new FormData()
      submitData.append('student_id', user.id)
      submitData.append('course_id', formData.course_id)
      submitData.append('absence_date', formData.absence_date)
      submitData.append('reason_type', formData.reason_type)
      submitData.append('reason_description', formData.reason_description)
      
      if (selectedFile) {
        submitData.append('attachment', selectedFile)
      }

      await axios.post(
        'http://localhost:5000/api/justifications/create',
        submitData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      alert('Justificación enviada exitosamente. El profesor recibirá una notificación por email.')
      navigate('/student/my-justifications')
    } catch (error) {
      alert('Error al enviar la justificación. Intenta nuevamente.')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Nueva Justificación</h1>
            <p className="text-gray-600">Completa el formulario para enviar tu solicitud</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
            {/* Curso */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Curso <span className="text-red-500">*</span>
              </label>
              <select
                name="course_id"
                value={formData.course_id}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.course_id ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Selecciona un curso</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.course_code} - {course.course_name}
                  </option>
                ))}
              </select>
              {errors.course_id && (
                <p className="mt-1 text-sm text-red-500">{errors.course_id}</p>
              )}
            </div>

            {/* Fecha de Ausencia */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Ausencia <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="absence_date"
                value={formData.absence_date}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.absence_date ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.absence_date && (
                <p className="mt-1 text-sm text-red-500">{errors.absence_date}</p>
              )}
            </div>

            {/* Motivo */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo <span className="text-red-500">*</span>
              </label>
              <select
                name="reason_type"
                value={formData.reason_type}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.reason_type ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Selecciona un motivo</option>
                {reasonTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.reason_type && (
                <p className="mt-1 text-sm text-red-500">{errors.reason_type}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción Detallada <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason_description"
                value={formData.reason_description}
                onChange={handleChange}
                rows="6"
                maxLength="500"
                required
                placeholder="Explica detalladamente el motivo de tu ausencia..."
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.reason_description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.reason_description ? (
                  <p className="text-sm text-red-500">{errors.reason_description}</p>
                ) : (
                  <p className="text-sm text-gray-500">Mínimo 20 caracteres, máximo 500</p>
                )}
                <p className={`text-sm ${formData.reason_description.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
                  {formData.reason_description.length}/500
                </p>
              </div>
            </div>

            {/* Adjuntar Archivo */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adjuntar Evidencia <span className="text-red-500">*</span>
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-blue-400 transition-colors ${
                errors.file ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}>
                {!selectedFile ? (
                  <div>
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      required
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex flex-col items-center"
                    >
                      <svg className={`w-12 h-12 mb-3 ${errors.file ? 'text-red-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className={`text-sm mb-1 font-medium ${errors.file ? 'text-red-600' : 'text-gray-600'}`}>
                        Haz clic para subir o arrastra el archivo aquí
                      </span>
                      <span className="text-xs text-gray-500">
                        PNG, JPG, GIF o PDF (máx. 5MB)
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      {filePreview ? (
                        <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              {errors.file && (
                <p className="mt-1 text-sm text-red-500 font-medium">{errors.file}</p>
              )}
              <div className="mt-2 flex items-start gap-2 text-xs text-gray-600">
                <svg className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-medium">Es obligatorio adjuntar un certificado médico, comprobante u otra evidencia que respalde tu justificación</span>
              </div>
            </div>

            {/* Información Importante */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-sm font-medium text-blue-900">Información Importante</h3>
              </div>
              <ul className="text-sm text-blue-700 space-y-1 ml-7">
                <li>• <strong>Todos los campos son obligatorios</strong></li>
                <li>• Tu solicitud será enviada al profesor del curso</li>
                <li>• Recibirás una notificación por email cuando sea revisada</li>
                <li>• Debes adjuntar evidencia (certificado médico, comprobante, etc.)</li>
                <li>• La descripción debe tener entre 20 y 500 caracteres</li>
                <li>• Solo puedes justificar ausencias de los últimos 30 días</li>
                <li>• El profesor puede aprobar o rechazar tu solicitud</li>
              </ul>
            </div>

            {/* Botones */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/student/my-justifications')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Enviando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Enviar Justificación
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
    </StudentLayout>
  )
}
