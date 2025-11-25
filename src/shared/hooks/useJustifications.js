import { useState, useEffect } from 'react';
import { justificationsService } from '../api/justificationsService.js';

export const useJustifications = () => {
  const [justifications, setJustifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJustifications = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await justificationsService.getAllJustifications(params);
      if (response.success && response.data) {
        setJustifications(response.data.justifications || response.data);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      console.error('Error al obtener justificaciones:', err.message);
      setError(err.message || 'Error al conectar con el servidor');
      setJustifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchJustificationsByStudent = async (studentId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await justificationsService.getJustificationsByStudent(studentId);
      setJustifications(data);
    } catch (err) {
      setError(err.message || 'Error al cargar justificaciones del estudiante');
    } finally {
      setLoading(false);
    }
  };

  const fetchJustificationsByStatus = async (status) => {
    setLoading(true);
    setError(null);
    try {
      const data = await justificationsService.getJustificationsByStatus(status);
      setJustifications(data);
    } catch (err) {
      setError(err.message || 'Error al cargar justificaciones por estado');
    } finally {
      setLoading(false);
    }
  };

  const createJustification = async (justificationData) => {
    setLoading(true);
    setError(null);
    try {
      const newJustification = await justificationsService.createJustification(justificationData);
      setJustifications(prev => [...prev, newJustification]);
      return newJustification;
    } catch (err) {
      setError(err.message || 'Error al crear justificación');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateJustificationStatus = async (id, status, processedBy) => {
    setLoading(true);
    setError(null);
    try {
      const updatedJustification = await justificationsService.updateJustificationStatus(id, status, processedBy);
      setJustifications(prev => 
        prev.map(justification => 
          justification.id === id ? updatedJustification : justification
        )
      );
      return updatedJustification;
    } catch (err) {
      setError(err.message || 'Error al actualizar estado de justificación');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadAttachment = async (justificationId, file) => {
    setLoading(true);
    setError(null);
    try {
      const attachment = await justificationsService.uploadAttachment(justificationId, file);
      return attachment;
    } catch (err) {
      setError(err.message || 'Error al subir archivo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJustifications();
  }, []);

  return {
    justifications,
    loading,
    error,
    fetchJustifications,
    fetchJustificationsByStudent,
    fetchJustificationsByStatus,
    createJustification,
    updateJustificationStatus,
    uploadAttachment
  };
};