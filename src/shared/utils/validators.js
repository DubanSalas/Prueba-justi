// Utilidades para validación de datos

// Validar email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar DNI peruano
export const validateDNI = (dni) => {
  const dniRegex = /^\d{8}$/;
  return dniRegex.test(dni);
};

// Validar teléfono peruano
export const validatePhone = (phone) => {
  const phoneRegex = /^(\+51|51)?[9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Validar código de estudiante
export const validateStudentCode = (code) => {
  const codeRegex = /^\d{10}$/; // Asumiendo formato de 10 dígitos
  return codeRegex.test(code);
};

// Validar fecha
export const validateDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Validar que la fecha no sea futura
export const validatePastDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Final del día actual
  return date <= today;
};

// Validar datos de estudiante
export const validateStudentData = (studentData) => {
  const errors = {};

  // Nombre
  if (!studentData.first_name || studentData.first_name.trim().length < 2) {
    errors.first_name = 'El nombre debe tener al menos 2 caracteres';
  }

  // Apellido
  if (!studentData.last_name || studentData.last_name.trim().length < 2) {
    errors.last_name = 'El apellido debe tener al menos 2 caracteres';
  }

  // Email
  if (!studentData.email) {
    errors.email = 'El email es requerido';
  } else if (!validateEmail(studentData.email)) {
    errors.email = 'El formato del email no es válido';
  }

  // Código de estudiante
  if (!studentData.student_code) {
    errors.student_code = 'El código de estudiante es requerido';
  } else if (!validateStudentCode(studentData.student_code)) {
    errors.student_code = 'El código debe tener 10 dígitos';
  }

  // DNI
  if (studentData.dni && !validateDNI(studentData.dni)) {
    errors.dni = 'El DNI debe tener 8 dígitos';
  }

  // Teléfono
  if (studentData.phone && !validatePhone(studentData.phone)) {
    errors.phone = 'El formato del teléfono no es válido';
  }

  // Carrera
  if (!studentData.career || studentData.career.trim().length < 3) {
    errors.career = 'La carrera debe tener al menos 3 caracteres';
  }

  // Semestre
  if (!studentData.semester) {
    errors.semester = 'El semestre es requerido';
  }

  // Fecha de nacimiento
  if (studentData.birth_date && !validateDate(studentData.birth_date)) {
    errors.birth_date = 'La fecha de nacimiento no es válida';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validar datos de justificación
export const validateJustificationData = (justificationData) => {
  const errors = {};

  // ID del estudiante
  if (!justificationData.student_id) {
    errors.student_id = 'El ID del estudiante es requerido';
  }

  // Fecha de ausencia
  if (!justificationData.absence_date) {
    errors.absence_date = 'La fecha de ausencia es requerida';
  } else if (!validateDate(justificationData.absence_date)) {
    errors.absence_date = 'La fecha de ausencia no es válida';
  } else if (!validatePastDate(justificationData.absence_date)) {
    errors.absence_date = 'La fecha de ausencia no puede ser futura';
  }

  // Curso/materia
  if (!justificationData.course_subject || justificationData.course_subject.trim().length < 3) {
    errors.course_subject = 'El curso/materia debe tener al menos 3 caracteres';
  }

  // Motivo
  if (!justificationData.reason || justificationData.reason.trim().length < 3) {
    errors.reason = 'El motivo debe tener al menos 3 caracteres';
  }

  // Descripción detallada
  if (!justificationData.detailed_description || justificationData.detailed_description.trim().length < 10) {
    errors.detailed_description = 'La descripción debe tener al menos 10 caracteres';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validar archivo adjunto
export const validateAttachment = (file) => {
  const errors = {};
  
  // Tamaño máximo: 5MB
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.size = 'El archivo no puede ser mayor a 5MB';
  }

  // Tipos de archivo permitidos
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    errors.type = 'Tipo de archivo no permitido. Solo se permiten PDF, imágenes y documentos de Word';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};