"use client"

import { useState, useEffect } from "react"
import { useStudents } from "../../../shared/hooks/useStudents.js"

const StudentForm = ({ onNavigate, student = null, isEdit = false }) => {
  const { generateNewStudentCode, createStudent, updateStudent } = useStudents();
  const [formData, setFormData] = useState(() => {
    if (student && isEdit) {
      return {
        first_name: student.first_name || "",
        last_name: student.last_name || "",
        student_code: student.student_code || "",
        career: student.career || "",
        semester: student.semester || "",
        email: student.email || "",
        phone: student.phone || "",
        address: student.address || "",
        dni: student.dni || "",
        birth_date: student.birth_date ? student.birth_date.split('T')[0] : "",
        emergency_contact: student.emergency_contact || "",
      }
    }
    return {
      first_name: "",
      last_name: "",
      student_code: "",
      career: "",
      semester: "",
      email: "",
      phone: "",
      address: "",
      dni: "",
      birth_date: "",
      emergency_contact: "",
      password: "",
    }
  })

  // Generar código automáticamente para nuevos estudiantes
  useEffect(() => {
    if (!isEdit && generateNewStudentCode && !formData.student_code) {
      const autoCode = generateNewStudentCode();
      setFormData(prev => ({
        ...prev,
        student_code: autoCode
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit]);

  // Actualizar formulario cuando cambie el estudiante
  useEffect(() => {
    if (student && isEdit) {
      setFormData({
        first_name: student.first_name || "",
        last_name: student.last_name || "",
        student_code: student.student_code || "",
        career: student.career || "",
        semester: student.semester || "",
        email: student.email || "",
        phone: student.phone || "",
        address: student.address || "",
        dni: student.dni || "",
        birth_date: student.birth_date ? student.birth_date.split('T')[0] : "",
        emergency_contact: student.emergency_contact || "",
      })
    }
  }, [student, isEdit])

  // Función para generar email automáticamente
  const generateEmail = (firstName, lastName) => {
    if (!firstName && !lastName) return '';
    
    // Limpiar y normalizar nombres
    const cleanName = (str) => {
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
        .replace(/[^a-z\s]/g, '') // Solo letras y espacios
        .trim();
    };
    
    const first = cleanName(firstName);
    const last = cleanName(lastName);
    
    if (!first && !last) return '';
    
    // Generar email: nombre.apellido1.apellido2@vallegrande.edu.pe
    const parts = [];
    if (first) parts.push(first);
    if (last) {
      // Dividir apellidos por espacios
      const lastNames = last.split(/\s+/);
      parts.push(...lastNames);
    }
    
    return parts.join('.') + '@vallegrande.edu.pe';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validaciones en tiempo real
    let processedValue = value;
    
    // NOMBRE Y APELLIDO: Solo letras y espacios (sin números ni caracteres especiales)
    if (name === 'first_name' || name === 'last_name') {
      processedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
      // Evitar múltiples espacios consecutivos
      processedValue = processedValue.replace(/\s{2,}/g, ' ');
    }
    
    // DNI: Solo números, máximo 8 dígitos
    if (name === 'dni') {
      processedValue = value.replace(/[^0-9]/g, '').substring(0, 8);
    }
    
    // TELÉFONO: Solo números, debe empezar con 9, máximo 9 dígitos
    if (name === 'phone') {
      processedValue = value.replace(/[^0-9]/g, '');
      if (processedValue.length > 0 && processedValue[0] !== '9') {
        processedValue = '9' + processedValue.replace(/^[^9]/, '');
      }
      processedValue = processedValue.substring(0, 9);
    }
    
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: processedValue,
      };
      
      // Si cambió el nombre o apellido, regenerar email automáticamente (solo para nuevos estudiantes)
      if ((name === 'first_name' || name === 'last_name') && !isEdit) {
        const firstName = name === 'first_name' ? processedValue : prev.first_name;
        const lastName = name === 'last_name' ? processedValue : prev.last_name;
        newData.email = generateEmail(firstName, lastName);
      }
      
      // Si cambió el DNI y tiene 8 dígitos, usarlo como contraseña automáticamente (solo para nuevos estudiantes)
      if (name === 'dni' && processedValue.length === 8 && !isEdit) {
        newData.password = processedValue;
      }
      
      return newData;
    });
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    // NOMBRE: Requerido, solo letras
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido'
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.first_name)) {
      newErrors.first_name = 'El nombre solo puede contener letras'
    }

    // APELLIDO: Requerido, solo letras
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido'
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.last_name)) {
      newErrors.last_name = 'El apellido solo puede contener letras'
    }

    // CÓDIGO: Requerido
    if (!formData.student_code.trim()) {
      newErrors.student_code = 'El código de estudiante es requerido'
    }

    // DNI: Requerido, solo números, 8 dígitos
    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es requerido'
    } else if (!/^\d{8}$/.test(formData.dni)) {
      newErrors.dni = 'El DNI debe tener exactamente 8 dígitos numéricos'
    }

    // EMAIL: Requerido, formato válido, dominio institucional
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    } else if (!formData.email.endsWith('@vallegrande.edu.pe')) {
      newErrors.email = 'El email debe ser del dominio @vallegrande.edu.pe'
    }

    // CONTRASEÑA: Requerida para nuevos estudiantes (se genera automáticamente del DNI)
    if (!isEdit && !formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida (se genera automáticamente del DNI)'
    }

    // TELÉFONO: Requerido, solo números, debe empezar con 9, 9 dígitos
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido'
    } else if (!/^9\d{8}$/.test(formData.phone)) {
      newErrors.phone = 'El teléfono debe empezar con 9 y tener 9 dígitos'
    }

    // FECHA DE NACIMIENTO: Requerida, mínimo 17 años
    if (!formData.birth_date) {
      newErrors.birth_date = 'La fecha de nacimiento es requerida'
    } else {
      const birthDate = new Date(formData.birth_date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
      
      if (actualAge < 17) {
        newErrors.birth_date = 'El estudiante debe tener al menos 17 años'
      }
    }

    // DIRECCIÓN: Requerida
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida'
    }

    // CARRERA: Requerida
    if (!formData.career) {
      newErrors.career = 'La carrera es requerida'
    }

    // SEMESTRE: Requerido
    if (!formData.semester) {
      newErrors.semester = 'El semestre es requerido'
    }

    // CONTACTO DE EMERGENCIA: Requerido
    if (!formData.emergency_contact.trim()) {
      newErrors.emergency_contact = 'El contacto de emergencia es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      let response

      if (isEdit && student) {
        // Actualizar estudiante existente
        response = await updateStudent(student.id, formData)
      } else {
        // Crear nuevo estudiante
        response = await createStudent(formData)
      }

      if (response.success) {
        // Regresar a la lista de estudiantes
        if (onNavigate) {
          onNavigate('students')
        }
      } else {
        setErrors({ submit: response.message || 'Error al guardar el estudiante' })
      }
    } catch (error) {
      console.error('Error al guardar estudiante:', error)
      setErrors({ submit: 'Error al guardar el estudiante. Inténtalo de nuevo.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (onNavigate) {
      onNavigate('students')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          
          {/* Header */}
          <div className="bg-slate-700 px-6 py-5 border-b border-slate-600">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="w-9 h-9 bg-slate-600 hover:bg-slate-500 rounded-lg text-slate-200 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">
                    {isEdit ? 'Editar Estudiante' : 'Nuevo Estudiante'}
                  </h1>
                  <p className="text-slate-300 text-sm">
                    {isEdit ? 'Actualiza la información del estudiante' : 'Registra un nuevo estudiante en el sistema'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="space-y-2">
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese el nombre del estudiante"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.first_name 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.first_name && (
                  <p className="text-sm text-red-600">{errors.first_name}</p>
                )}
              </div>

              {/* Apellido */}
              <div className="space-y-2">
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Apellidos *
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese los apellidos completos"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.last_name 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.last_name && (
                  <p className="text-sm text-red-600">{errors.last_name}</p>
                )}
              </div>

              {/* Código de Estudiante */}
              <div className="space-y-2">
                <label htmlFor="student_code" className="block text-sm font-medium text-gray-700">
                  Código de Estudiante *
                  {!isEdit && <span className="text-xs text-green-600 ml-2">(Auto-generado)</span>}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    id="student_code"
                    name="student_code"
                    value={formData.student_code}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Estudiante123"
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${errors.student_code ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      } ${!isEdit ? 'bg-gray-50' : ''}`}
                    disabled={isEdit}
                    readOnly={!isEdit}
                  />
                  {!isEdit && (
                    <button
                      type="button"
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-1"
                      onClick={() => {
                        const newCode = generateNewStudentCode();
                        setFormData(prev => ({ ...prev, student_code: newCode }));
                      }}
                      title="Generar nuevo código"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  )}
                </div>
                {errors.student_code && <p className="text-sm text-red-600">{errors.student_code}</p>}
              </div>

              {/* DNI */}
              <div className="space-y-2">
                <label htmlFor="dni" className="block text-sm font-medium text-gray-700">
                  DNI *
                  {!isEdit && <span className="text-xs text-green-600 ml-2">(Se usará como contraseña inicial)</span>}
                </label>
                <input
                  type="text"
                  id="dni"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  required
                  placeholder="Ej: 12345678"
                  maxLength="8"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono ${errors.dni ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                />
                {!isEdit && formData.dni.length === 8 && (
                  <p className="text-xs text-green-600">
                    ✓ Contraseña inicial configurada: {formData.dni}
                  </p>
                )}
                {errors.dni && <p className="text-sm text-red-600">{errors.dni}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Institucional *
                  {!isEdit && <span className="text-xs text-green-600 ml-2">(Auto-generado)</span>}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="nombre.apellido@vallegrande.edu.pe"
                  readOnly={!isEdit}
                  disabled={!isEdit}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.email 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  } ${!isEdit ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                />
                {!isEdit && (
                  <p className="text-xs text-gray-600">
                    ℹ️ El email se genera automáticamente y no se puede modificar
                  </p>
                )}
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Contraseña Inicial */}
              {!isEdit && (
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Contraseña Inicial *
                    <span className="text-xs text-green-600 ml-2">(Auto-generada del DNI)</span>
                  </label>
                  <input
                    type="text"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!isEdit}
                    placeholder="Se generará automáticamente del DNI"
                    readOnly
                    disabled
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 cursor-not-allowed font-mono ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                  />
                  <p className="text-xs text-gray-600">
                    ℹ️ La contraseña inicial será el DNI del estudiante. Podrá cambiarla después del primer login.
                  </p>
                  {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                </div>
              )}

              {/* Teléfono */}
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="Ej: 987654321"
                  maxLength="9"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono ${
                    errors.phone 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                <p className="text-xs text-gray-600">
                  Debe empezar con 9 y tener 9 dígitos
                </p>
                {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
              </div>

              {/* Fecha de Nacimiento */}
              <div className="space-y-2">
                <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  id="birth_date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.birth_date 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                <p className="text-xs text-gray-600">
                  El estudiante debe tener al menos 17 años
                </p>
                {errors.birth_date && <p className="text-sm text-red-600">{errors.birth_date}</p>}
              </div>

              {/* Dirección */}
              <div className="space-y-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Dirección *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese la dirección completa"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.address 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
              </div>

              {/* Carrera */}
              <div className="space-y-2">
                <label htmlFor="career" className="block text-sm font-medium text-gray-700">Carrera *</label>
                <select
                  id="career"
                  name="career"
                  value={formData.career}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${errors.career ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  <option value="">Seleccione una carrera</option>
                  <option value="Análisis de Sistemas">Análisis de Sistemas</option>
                  <option value="Desarrollo de Software">Desarrollo de Software</option>
                  <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                  <option value="Análisis de Sistemas Empresariales">Análisis de Sistemas Empresariales</option>
                  <option value="Administración de Empresas">Administración de Empresas</option>
                  <option value="Contabilidad">Contabilidad</option>
                  <option value="Marketing">Marketing</option>
                </select>
                {errors.career && <p className="text-sm text-red-600">{errors.career}</p>}
              </div>

              {/* Semestre */}
              <div className="space-y-2">
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Semestre *</label>
                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${errors.semester ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  <option value="">Seleccione un semestre</option>
                  <option value="1">1er Semestre</option>
                  <option value="2">2do Semestre</option>
                  <option value="3">3er Semestre</option>
                  <option value="4">4to Semestre</option>
                  <option value="5">5to Semestre</option>
                  <option value="6">6to Semestre</option>
                </select>
                {errors.semester && <p className="text-sm text-red-600">{errors.semester}</p>}
              </div>
            </div>

            {/* Contacto de Emergencia - Full Width */}
            <div className="mt-6 space-y-2">
              <label htmlFor="emergency_contact" className="block text-sm font-medium text-gray-700">
                Contacto de Emergencia *
              </label>
              <input
                type="text"
                id="emergency_contact"
                name="emergency_contact"
                value={formData.emergency_contact}
                onChange={handleChange}
                required
                placeholder="Nombre y teléfono del contacto de emergencia"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                  errors.emergency_contact 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.emergency_contact && <p className="text-sm text-red-600">{errors.emergency_contact}</p>}
            </div>

            {errors.submit && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {errors.submit}
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-2 text-gray-700 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                    {isEdit ? 'Actualizando...' : 'Guardando...'}
                  </>
                ) : (
                  isEdit ? 'Actualizar Estudiante' : 'Guardar Estudiante'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default StudentForm