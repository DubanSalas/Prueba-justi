import api from './api.js';

export const justificationsService = {
  // Obtener todas las justificaciones
  getAllJustifications: async (params = {}) => {
    try {
      const response = await api.get('/justifications', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching justifications:', error);
      throw error;
    }
  },

  // Obtener justificaciones por estudiante
  getJustificationsByStudent: async (studentId) => {
    try {
      const response = await api.get(`/justifications/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student justifications:', error);
      throw error;
    }
  },

  // Obtener justificación por ID
  getJustificationById: async (id) => {
    try {
      const response = await api.get(`/justifications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching justification:', error);
      throw error;
    }
  },

  // Crear nueva justificación
  createJustification: async (justificationData) => {
    try {
      const response = await api.post('/justifications/create', justificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating justification:', error);
      throw error;
    }
  },

  // Aprobar justificación
  approveJustification: async (id, adminId = 1) => {
    try {
      const response = await api.post(`/justifications/${id}/approve`, {
        admin_id: adminId
      });
      return response.data;
    } catch (error) {
      console.error('Error approving justification:', error);
      throw error;
    }
  },

  // Rechazar justificación
  rejectJustification: async (id, adminId = 1) => {
    try {
      const response = await api.post(`/justifications/${id}/reject`, {
        admin_id: adminId
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting justification:', error);
      throw error;
    }
  },

  // Actualizar estado de justificación (método genérico)
  updateJustificationStatus: async (id, status, processedBy) => {
    try {
      if (status === 'Aprobada') {
        return await justificationsService.approveJustification(id, processedBy);
      } else if (status === 'Rechazada') {
        return await justificationsService.rejectJustification(id, processedBy);
      }
      throw new Error('Estado no válido');
    } catch (error) {
      console.error('Error updating justification status:', error);
      throw error;
    }
  },

  // Obtener justificaciones por estado
  getJustificationsByStatus: async (status) => {
    try {
      const response = await api.get(`/justifications/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching justifications by status:', error);
      throw error;
    }
  },

  // Subir archivo adjunto
  uploadAttachment: async (justificationId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('justification_id', justificationId);
      
      const response = await api.post('/justifications/attachments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  },

  // Obtener archivos adjuntos de una justificación
  getAttachments: async (justificationId) => {
    try {
      const response = await api.get(`/justifications/${justificationId}/attachments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attachments:', error);
      throw error;
    }
  }
};