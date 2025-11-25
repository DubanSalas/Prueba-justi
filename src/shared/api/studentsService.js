/**
 * Servicio para gestión de estudiantes
 * Conecta con el backend real y maneja notificaciones
 */

import api from './api.js';

// Función helper para convertir respuestas de axios al formato esperado
const apiRequest = async (endpoint, options = {}) => {
  try {
    const { method = 'GET', body, headers, ...restOptions } = options;
    
    const config = {
      method,
      url: endpoint,
      headers,
      ...restOptions
    };

    if (body) {
      config.data = JSON.parse(body);
    }

    const response = await api(config);
    return response.data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Simular delay de red
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función para mostrar notificaciones
const showNotification = (type, title, message) => {
  const event = new CustomEvent('showNotification', {
    detail: { type, title, message }
  });
  window.dispatchEvent(event);
};

export const studentsService = {
  // Obtener todos los estudiantes
  async getAllStudents(params = {}) {
    await delay(300);

    try {
      let endpoint = '/students/'

      // Construir query parameters
      const queryParams = []

      // IMPORTANTE: Agregar include_stats=true para obtener porcentajes de asistencia
      queryParams.push('include_stats=true')

      if (params.includeInactive) {
        queryParams.push('include_inactive=true')
      }
      if (params.status && params.status !== 'todos') {
        queryParams.push(`status=${params.status}`)
      }
      if (params.search) {
        queryParams.push(`search=${encodeURIComponent(params.search)}`)
      }

      if (queryParams.length > 0) {
        endpoint += `?${queryParams.join('&')}`
      }

      console.log('🔍 Consultando backend con endpoint:', endpoint)
      const response = await apiRequest(endpoint)
      console.log('📊 Respuesta del backend:', response)

      // Verificar que los estudiantes tengan estadísticas
      if (response.data?.students?.length > 0) {
        console.log('📈 Ejemplo de estadísticas:', {
          estudiante: response.data.students[0].full_name,
          asistencia: response.data.students[0].attendance_percentage + '%',
          nivel_riesgo: response.data.students[0].risk_level
        })
      }

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      showNotification('error', 'Error', 'No se pudieron cargar los estudiantes');
      console.error('❌ Error al obtener estudiantes:', error)
      return {
        success: false,
        message: 'Error al obtener estudiantes',
        error: error.message
      };
    }
  },

  // Obtener estudiante por ID
  async getStudentById(id) {
    await delay(200);

    try {
      const response = await apiRequest(`/students/${id}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      showNotification('error', 'Error', 'No se pudo cargar el estudiante');
      console.error('Error al obtener estudiante:', error)
      return {
        success: false,
        message: 'Error al obtener estudiante',
        error: error.message
      };
    }
  },

  // Crear nuevo estudiante
  async createStudent(studentData) {
    await delay(400);

    try {
      // Validar datos requeridos
      const requiredFields = ['first_name', 'last_name', 'student_code', 'email', 'career', 'semester'];
      const missingFields = requiredFields.filter(field => !studentData[field]);

      if (missingFields.length > 0) {
        showNotification('error', 'Error de Validación', `Campos requeridos: ${missingFields.join(', ')}`);
        return {
          success: false,
          message: `Campos requeridos faltantes: ${missingFields.join(', ')}`
        };
      }

      const response = await apiRequest('/students/create', {
        method: 'POST',
        body: JSON.stringify({
          ...studentData,
          status: 'A'
        }),
      })

      showNotification('success', '¡Éxito!', `Estudiante ${studentData.first_name} ${studentData.last_name} creado correctamente`);
      return {
        success: true,
        data: response.data,
        message: 'Estudiante creado exitosamente'
      }
    } catch (error) {
      showNotification('error', 'Error', error.message || 'No se pudo crear el estudiante');
      console.error('Error al crear estudiante:', error)
      return {
        success: false,
        message: error.message || 'Error al crear estudiante',
        error: error.message
      };
    }
  },

  // Actualizar estudiante
  async updateStudent(id, studentData) {
    await delay(400);

    try {
      const response = await apiRequest(`/students/${id}/update`, {
        method: 'PUT',
        body: JSON.stringify(studentData),
      })

      showNotification('success', '¡Actualizado!', `Información de ${studentData.first_name || 'estudiante'} actualizada correctamente`);
      return {
        success: true,
        data: response.data,
        message: 'Estudiante actualizado exitosamente'
      }
    } catch (error) {
      showNotification('error', 'Error', error.message || 'No se pudo actualizar el estudiante');
      console.error('Error al actualizar estudiante:', error)
      return {
        success: false,
        message: error.message || 'Error al actualizar estudiante',
        error: error.message
      };
    }
  },

  // Eliminar estudiante (cambiar a inactivo)
  async deleteStudent(id) {
    await delay(300);

    try {
      console.log('Enviando petición de eliminación al backend para ID:', id)
      const response = await apiRequest(`/students/${id}/delete`, {
        method: 'PATCH',
      })
      console.log('Respuesta del backend:', response)

      showNotification('success', 'Estudiante Eliminado', 'El estudiante ha sido marcado como inactivo');
      return {
        success: true,
        message: 'Estudiante eliminado exitosamente'
      }
    } catch (error) {
      showNotification('error', 'Error', error.message || 'No se pudo eliminar el estudiante');
      console.error('Error al eliminar estudiante:', error)
      return {
        success: false,
        message: error.message || 'Error al eliminar estudiante',
        error: error.message
      };
    }
  },

  // Restaurar estudiante (cambiar a activo)
  async restoreStudent(id) {
    await delay(300);

    try {
      await apiRequest(`/students/${id}/restore`, {
        method: 'PATCH',
      })

      showNotification('success', 'Estudiante Restaurado', 'El estudiante ha sido reactivado correctamente');
      return {
        success: true,
        message: 'Estudiante restaurado exitosamente'
      }
    } catch (error) {
      showNotification('error', 'Error', error.message || 'No se pudo restaurar el estudiante');
      console.error('Error al restaurar estudiante:', error)
      return {
        success: false,
        message: error.message || 'Error al restaurar estudiante',
        error: error.message
      };
    }
  },

  // Buscar estudiantes
  async searchStudents(query, includeInactive = false) {
    await delay(250);

    try {
      if (!query || query.trim() === '') {
        return this.getAllStudents({ includeInactive });
      }

      const endpoint = includeInactive
        ? `/students/search?q=${encodeURIComponent(query)}&include_inactive=true`
        : `/students/search?q=${encodeURIComponent(query)}`
      const response = await apiRequest(endpoint)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      showNotification('error', 'Error', 'Error en la búsqueda de estudiantes');
      console.error('Error al buscar estudiantes:', error)
      return {
        success: false,
        message: 'Error al buscar estudiantes',
        error: error.message
      };
    }
  },

  // Obtener estadísticas
  async getStudentsStats() {
    await delay(200);

    try {
      const response = await apiRequest('/students/stats')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
      return {
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      };
    }
  }
};
