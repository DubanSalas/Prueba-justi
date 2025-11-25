// Configuración de la API
export const API_CONFIG = {
  // URL base de la API - cambiar según el entorno
  // PRODUCCIÓN: Usar URL de Render
  BASE_URL: import.meta.env.VITE_API_URL || 'https://justificacion-backend.onrender.com/api',

  // Endpoints principales
  ENDPOINTS: {
    // Estudiantes
    STUDENTS: '/students',
    STUDENTS_SEARCH: '/students/search',

    // Justificaciones
    JUSTIFICATIONS: '/justifications',
    JUSTIFICATIONS_BY_STUDENT: '/justifications/student',
    JUSTIFICATIONS_BY_STATUS: '/justifications/status',
    JUSTIFICATIONS_ATTACHMENTS: '/justifications/attachments',

    // Administradores
    ADMINS: '/admins',
    AUTH_LOGIN: '/auth/login',

    // Archivos
    UPLOADS: '/uploads'
  },

  // Configuración de timeouts
  TIMEOUT: 10000, // 10 segundos

  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Estados de justificaciones
export const JUSTIFICATION_STATUS = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada'
};

// Estados de estudiantes
export const STUDENT_STATUS = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo'
};

// Configuración de paginación
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
};