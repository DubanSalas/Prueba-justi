import { useState, useEffect } from 'react'
import { studentsService } from '../api/studentsService.js'
import { useCache } from '../context/CacheContext'

const CACHE_KEY = 'students_list'

export function useStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { getCachedData, setCachedData, invalidateCache } = useCache()

  // Cargar estudiantes
  const fetchStudents = async (params = {}, forceRefresh = false) => {
    // Si hay caché válido y no es refresh forzado, usar caché
    if (!forceRefresh) {
      const cachedData = getCachedData(CACHE_KEY)
      if (cachedData) {
        setStudents(cachedData)
        return
      }
    }
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔄 Cargando estudiantes del backend...')
      const response = await studentsService.getAllStudents(params)
      
      if (response.success) {
        const studentsData = response.data.students || []
        setStudents(studentsData)
        setCachedData(CACHE_KEY, studentsData)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('Error al cargar estudiantes')
      console.error('Error fetching students:', err)
    } finally {
      setLoading(false)
    }
  }

  // Crear estudiante
  const createStudent = async (studentData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await studentsService.createStudent(studentData)
      
      if (response.success) {
        invalidateCache(CACHE_KEY)
        await fetchStudents({}, true)
        return response
      } else {
        setError(response.message)
        return response
      }
    } catch (err) {
      const errorMsg = 'Error al crear estudiante'
      setError(errorMsg)
      console.error('Error creating student:', err)
      return { success: false, message: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Actualizar estudiante
  const updateStudent = async (id, studentData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await studentsService.updateStudent(id, studentData)
      
      if (response.success) {
        invalidateCache(CACHE_KEY)
        await fetchStudents({}, true)
        return response
      } else {
        setError(response.message)
        return response
      }
    } catch (err) {
      const errorMsg = 'Error al actualizar estudiante'
      setError(errorMsg)
      console.error('Error updating student:', err)
      return { success: false, message: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Eliminar estudiante (cambiar a inactivo)
  const deleteStudent = async (id) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await studentsService.deleteStudent(id)
      
      if (response.success) {
        invalidateCache(CACHE_KEY)
        await fetchStudents({}, true)
        return response
      } else {
        setError(response.message)
        return response
      }
    } catch (err) {
      const errorMsg = 'Error al eliminar estudiante'
      setError(errorMsg)
      console.error('Error deleting student:', err)
      return { success: false, message: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Restaurar estudiante (cambiar a activo)
  const restoreStudent = async (id) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await studentsService.restoreStudent(id)
      
      if (response.success) {
        invalidateCache(CACHE_KEY)
        await fetchStudents({ includeInactive: true }, true)
        return response
      } else {
        setError(response.message)
        return response
      }
    } catch (err) {
      const errorMsg = 'Error al restaurar estudiante'
      setError(errorMsg)
      console.error('Error restoring student:', err)
      return { success: false, message: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Generar código de estudiante
  const generateNewStudentCode = () => {
    const year = new Date().getFullYear()
    const randomNum = Math.floor(Math.random() * 9000) + 1000
    return `${year}${randomNum}`
  }

  // Cargar estudiantes al montar el componente (usa caché si está disponible)
  useEffect(() => {
    const cachedData = getCachedData(CACHE_KEY)
    if (!cachedData) {
      fetchStudents()
    } else {
      setStudents(cachedData)
    }
  }, [])

  return {
    students,
    loading,
    error,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    restoreStudent,
    generateNewStudentCode
  }
}
