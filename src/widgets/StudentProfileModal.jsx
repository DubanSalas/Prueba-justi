import React, { useState, useEffect } from 'react';
import { X, User, Edit, MessageCircle, FileText } from 'lucide-react';
import axios from 'axios';

const StudentProfileModal = ({ isOpen, onClose, student, onNavigate }) => {
  const [recentJustifications, setRecentJustifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (isOpen && student?.id) {
      fetchJustifications();
    }
  }, [isOpen, student?.id]);

  const fetchJustifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/students/${student.id}/justifications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('📋 Justificaciones del estudiante:', response.data);
      const justifications = response.data.data || [];
      setRecentJustifications(justifications);
      
      // Calcular estadísticas reales de justificaciones
      const total = justifications.length;
      const aprobadas = justifications.filter(j => j.status === 'APROBADA').length;
      const pendientes = justifications.filter(j => j.status === 'PENDIENTE').length;
      const rechazadas = justifications.filter(j => j.status === 'RECHAZADA').length;
      
      console.log('📊 Estadísticas calculadas:', { total, aprobadas, pendientes, rechazadas });
      
      // Actualizar el objeto student con las estadísticas reales
      student.justification_stats = {
        total,
        aprobadas,
        pendientes,
        rechazadas
      };
    } catch (error) {
      console.error('Error al cargar justificaciones:', error);
      setRecentJustifications([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !student) return null;

  const handleEditStudent = () => {
    onClose()
    if (onNavigate) {
      onNavigate('student-form', { student, isEdit: true })
    }
  }

  const handleSendMessage = () => {
    alert(`Enviando mensaje a ${student.name}...`)
    // Aquí implementarías la lógica de envío de mensaje
  }

  // Calcular estadísticas de justificaciones desde las cargadas
  const justificationStats = {
    total: recentJustifications.length,
    aprobadas: recentJustifications.filter(j => j.status === 'APROBADA').length,
    pendientes: recentJustifications.filter(j => j.status === 'PENDIENTE').length,
    rechazadas: recentJustifications.filter(j => j.status === 'RECHAZADA').length
  };

  // Usar justificaciones cargadas del backend
  const recentRequests = recentJustifications.slice(0, 5);

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case 'APROBADA':
      case 'APROBADO':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'RECHAZADA':
      case 'RECHAZADO':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        {/* Header */}
        <div className="bg-slate-700 px-6 py-5 border-b border-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-slate-200" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Perfil del Estudiante</h2>
                <p className="text-slate-300 text-sm">Información detallada y estadísticas académicas</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 bg-slate-600 hover:bg-slate-500 rounded-lg text-slate-200 transition-colors flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
          {/* Student Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-slate-600 rounded-lg flex items-center justify-center">
                    <User size={32} className="text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">{student.name}</h3>
                  <p className="text-gray-600 font-mono bg-gray-100 px-3 py-1 rounded text-sm w-fit mx-auto sm:mx-0 mb-3 border border-gray-200">{student.code}</p>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <span className={`px-3 py-1 rounded text-xs font-medium ${
                      student.status === 'active' || student.status === 'A'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {student.status === 'active' || student.status === 'A' ? 'Activo' : 'Inactivo'}
                    </span>
                    <span className={`text-xs font-medium px-3 py-1 rounded border ${
                      (student.attendance_percentage || 0) >= 90 
                        ? 'text-green-700 bg-green-50 border-green-200'
                        : (student.attendance_percentage || 0) >= 80
                          ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
                          : (student.attendance_percentage || 0) >= 70
                            ? 'text-orange-700 bg-orange-50 border-orange-200'
                            : 'text-red-700 bg-red-50 border-red-200'
                    }`}>
                      {(student.attendance_percentage || 0).toFixed(1)}% Asistencia
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <button 
                  onClick={handleEditStudent}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                >
                  <Edit size={16} />
                  <span>Editar</span>
                </button>
                <button 
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                >
                  <MessageCircle size={16} />
                  <span>Mensaje</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column - Personal Info */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <span>Información Personal</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-600 text-sm font-medium">Email:</span>
                    <span className="text-gray-900 font-medium break-all">{student.email}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-600 text-sm font-medium">Teléfono:</span>
                    <span className="text-gray-900 font-medium">{student.phone || 'No registrado'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-600 text-sm font-medium">DNI:</span>
                    <span className="text-gray-900 font-medium font-mono">{student.dni || 'No registrado'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                    <FileText size={16} className="text-white" />
                  </div>
                  <span>Información Académica</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-600 text-sm font-medium">Carrera:</span>
                    <span className="text-gray-900 font-medium text-right">{student.career}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-600 text-sm font-medium">Semestre:</span>
                    <span className="text-gray-900 font-medium">{student.semester}</span>
                  </div>
                  {student.created_at && (
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-gray-600 text-sm font-medium">Fecha de Registro:</span>
                      <span className="text-gray-900 font-medium">{new Date(student.created_at).toLocaleDateString('es-ES')}</span>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-600 text-sm font-medium">Estado:</span>
                    <span className={`px-3 py-1 rounded text-xs font-medium ${
                      student.status === 'active' || student.status === 'A'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {student.status === 'active' || student.status === 'A' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Stats and Requests */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                    <FileText size={16} className="text-white" />
                  </div>
                  <span>Estadísticas de Justificaciones</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-700 mb-1">{justificationStats.total}</div>
                    <div className="text-blue-600 text-xs font-medium">Total</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-700 mb-1">{justificationStats.aprobadas}</div>
                    <div className="text-green-600 text-xs font-medium">Aprobadas</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-700 mb-1">{justificationStats.pendientes}</div>
                    <div className="text-yellow-600 text-xs font-medium">Pendientes</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-700 mb-1">{justificationStats.rechazadas}</div>
                    <div className="text-red-600 text-xs font-medium">Rechazadas</div>
                  </div>
                </div>

                {/* Attendance Rate - DATOS REALES */}
                <div className={`rounded-lg p-4 border ${
                  (student.attendance_percentage || 0) >= 90 
                    ? 'bg-green-50 border-green-200'
                    : (student.attendance_percentage || 0) >= 80
                      ? 'bg-yellow-50 border-yellow-200'
                      : (student.attendance_percentage || 0) >= 70
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-red-50 border-red-300'
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className={`font-medium text-sm ${
                      (student.attendance_percentage || 0) >= 90 ? 'text-green-700'
                        : (student.attendance_percentage || 0) >= 80 ? 'text-yellow-700'
                        : (student.attendance_percentage || 0) >= 70 ? 'text-orange-700'
                        : 'text-red-700'
                    }`}>
                      Tasa de Asistencia
                    </span>
                    <span className={`text-xl font-bold ${
                      (student.attendance_percentage || 0) >= 90 ? 'text-green-700'
                        : (student.attendance_percentage || 0) >= 80 ? 'text-yellow-700'
                        : (student.attendance_percentage || 0) >= 70 ? 'text-orange-700'
                        : 'text-red-700'
                    }`}>
                      {(student.attendance_percentage || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-3 ${
                    (student.attendance_percentage || 0) >= 90 ? 'bg-green-200'
                      : (student.attendance_percentage || 0) >= 80 ? 'bg-yellow-200'
                      : (student.attendance_percentage || 0) >= 70 ? 'bg-orange-200'
                      : 'bg-red-200'
                  }`}>
                    <div className={`h-3 rounded-full transition-all duration-1000 ${
                      (student.attendance_percentage || 0) >= 90 
                        ? 'bg-green-600'
                        : (student.attendance_percentage || 0) >= 80
                          ? 'bg-yellow-600'
                          : (student.attendance_percentage || 0) >= 70
                            ? 'bg-orange-600'
                            : 'bg-red-600'
                    }`} style={{ width: `${student.attendance_percentage || 0}%` }}></div>
                  </div>
                  <div className={`text-xs mt-2 font-medium ${
                    (student.attendance_percentage || 0) >= 90 ? 'text-green-600'
                      : (student.attendance_percentage || 0) >= 80 ? 'text-yellow-600'
                      : (student.attendance_percentage || 0) >= 70 ? 'text-orange-600'
                      : 'text-red-600'
                  }`}>
                    {(student.attendance_percentage || 0) >= 90 ? 'Excelente rendimiento'
                      : (student.attendance_percentage || 0) >= 80 ? 'Buen rendimiento'
                      : (student.attendance_percentage || 0) >= 70 ? 'EN RIESGO - Cerca del límite'
                      : 'CRÍTICO - Más del 30% de faltas'}
                  </div>
                  
                  {/* Estadísticas detalladas */}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                      <div className="text-base font-bold text-gray-900">{student.attendance_stats?.total_classes || 0}</div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                    <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                      <div className="text-base font-bold text-green-600">{student.attendance_stats?.present || 0}</div>
                      <div className="text-xs text-gray-600">Presentes</div>
                    </div>
                    <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                      <div className="text-base font-bold text-red-600">{student.attendance_stats?.absent || 0}</div>
                      <div className="text-xs text-gray-600">Ausentes</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-semibold text-gray-900">Solicitudes Recientes</h4>
                  <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
                    Ver todas
                  </button>
                </div>
                <div className="space-y-2">
                  {recentRequests.length > 0 ? (
                    recentRequests.map((request, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                          <div className="font-medium text-gray-900 text-sm mb-1">{request.reason_type || 'Justificación'}</div>
                          <div className="text-xs text-gray-600">
                            {request.absence_date ? new Date(request.absence_date).toLocaleDateString('es-ES') : 'N/A'}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status === 'PENDIENTE' ? 'Pendiente' : request.status === 'APROBADA' ? 'Aprobada' : 'Rechazada'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <div className="text-3xl mb-2">📭</div>
                      <p className="font-medium text-sm">No hay solicitudes registradas</p>
                      <p className="text-xs">Este estudiante aún no ha enviado justificaciones</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium text-sm"
            >
              Cerrar
            </button>
            <button 
              onClick={() => {
                onClose()
                if (onNavigate) {
                  onNavigate('justifications')
                }
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2"
            >
              <FileText size={16} />
              <span>Ver Todas las Solicitudes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileModal;