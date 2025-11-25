// Utilidades para formateo de datos

// Formatear fecha
export const formatDate = (dateString) => {
    if (!dateString) return 'No registrada';

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (error) {
        return 'Fecha inválida';
    }
};

// Formatear fecha y hora
export const formatDateTime = (dateString) => {
    if (!dateString) return 'No registrada';

    try {
        const date = new Date(dateString);
        return date.toLocaleString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Fecha inválida';
    }
};

// Formatear porcentaje
export const formatPercentage = (value, decimals = 1) => {
    if (value === null || value === undefined) return '0%';
    return `${parseFloat(value).toFixed(decimals)}%`;
};

// Formatear nombre completo
export const formatFullName = (firstName, lastName) => {
    if (!firstName && !lastName) return 'Sin nombre';
    return `${firstName || ''} ${lastName || ''}`.trim();
};

// Formatear estado de justificación
export const formatJustificationStatus = (status) => {
    const statusMap = {
        'Pendiente': { text: 'Pendiente', class: 'status-pending' },
        'Aprobada': { text: 'Aprobada', class: 'status-approved' },
        'Rechazada': { text: 'Rechazada', class: 'status-rejected' }
    };

    return statusMap[status] || { text: status, class: 'status-unknown' };
};

// Formatear estado de estudiante
export const formatStudentStatus = (status) => {
    const statusMap = {
        'Activo': { text: 'Activo', class: 'status-active' },
        'Inactivo': { text: 'Inactivo', class: 'status-inactive' }
    };

    return statusMap[status] || { text: status, class: 'status-unknown' };
};

// Calcular porcentaje de asistencia
export const calculateAttendancePercentage = (totalClasses, absences) => {
    if (!totalClasses || totalClasses === 0) return 100;
    const attendance = ((totalClasses - (absences || 0)) / totalClasses) * 100;
    return Math.max(0, Math.min(100, attendance));
};

// Determinar nivel de riesgo por inasistencias
export const getAttendanceRiskLevel = (attendancePercentage) => {
    if (attendancePercentage >= 85) return { level: 'low', text: 'Bajo riesgo', class: 'risk-low' };
    if (attendancePercentage >= 75) return { level: 'medium', text: 'Riesgo medio', class: 'risk-medium' };
    if (attendancePercentage >= 60) return { level: 'high', text: 'Alto riesgo', class: 'risk-high' };
    return { level: 'critical', text: 'Riesgo crítico', class: 'risk-critical' };
};

// Formatear tamaño de archivo
export const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';

    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

// Truncar texto
export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};