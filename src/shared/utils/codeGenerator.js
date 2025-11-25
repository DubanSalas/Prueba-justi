/**
 * Generador automático de códigos de estudiante
 */

/**
 * Genera un código de estudiante único
 * Formato: YYYY + 6 dígitos secuenciales (ej: 2025001001)
 * @param {Array} existingStudents - Lista de estudiantes existentes
 * @returns {string} - Código único generado
 */
export const generateStudentCode = (existingStudents = []) => {
  const currentYear = new Date().getFullYear();
  const yearPrefix = currentYear.toString();
  
  // Obtener todos los códigos existentes que empiecen con el año actual
  const existingCodes = existingStudents
    .map(student => student.student_code)
    .filter(code => code && code.startsWith(yearPrefix))
    .map(code => parseInt(code.substring(4))) // Extraer la parte numérica
    .filter(num => !isNaN(num))
    .sort((a, b) => a - b);
  
  // Encontrar el siguiente número disponible
  let nextNumber = 1;
  for (const num of existingCodes) {
    if (num === nextNumber) {
      nextNumber++;
    } else {
      break;
    }
  }
  
  // Formatear con 6 dígitos (001001, 001002, etc.)
  const formattedNumber = nextNumber.toString().padStart(6, '0');
  
  return `${yearPrefix}${formattedNumber}`;
};

/**
 * Valida si un código de estudiante tiene el formato correcto
 * @param {string} code - Código a validar
 * @returns {boolean} - true si es válido
 */
export const validateStudentCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  
  // Formato: 4 dígitos del año + 6 dígitos secuenciales
  const codeRegex = /^\d{10}$/;
  if (!codeRegex.test(code)) return false;
  
  // Verificar que el año sea razonable (entre 2020 y 2030)
  const year = parseInt(code.substring(0, 4));
  return year >= 2020 && year <= 2030;
};

/**
 * Genera múltiples códigos únicos (útil para importaciones masivas)
 * @param {number} count - Cantidad de códigos a generar
 * @param {Array} existingStudents - Lista de estudiantes existentes
 * @returns {Array} - Array de códigos únicos
 */
export const generateMultipleStudentCodes = (count, existingStudents = []) => {
  const codes = [];
  let currentStudents = [...existingStudents];
  
  for (let i = 0; i < count; i++) {
    const newCode = generateStudentCode(currentStudents);
    codes.push(newCode);
    
    // Agregar el código generado a la lista temporal para evitar duplicados
    currentStudents.push({ student_code: newCode });
  }
  
  return codes;
};