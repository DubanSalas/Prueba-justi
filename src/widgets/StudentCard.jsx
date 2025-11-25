import React, { useState } from 'react';
import { Eye, Edit, Trash2, User, RotateCcw, Download } from 'lucide-react';

const StudentCard = ({ student, onView, onEdit, onDelete, onRestore }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reports/students/${student.id}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al descargar el PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `estudiante_${student.student_code || student.codigo}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Error al descargar el reporte PDF');
    } finally {
      setIsDownloading(false);
    }
  };
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'activo':
      case 'active': 
        return 'bg-green-100 text-green-800';
      case 'inactivo':
      case 'inactive': 
        return 'bg-red-100 text-red-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Determinar el estado del estudiante
  const studentStatus = student.status || student.estado || 'active';
  const isInactive = studentStatus === 'inactive' || studentStatus === 'inactivo';

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRiskLevel = (percentage) => {
    if (percentage >= 90) return 'NORMAL';
    if (percentage >= 80) return 'ATENCIÓN';
    if (percentage >= 70) return 'EN RIESGO';
    return 'REPROBADO'; // Más del 30% de inasistencias
  };

  const getCardBorderColor = (percentage) => {
    if (percentage >= 90) return 'border-green-200';
    if (percentage >= 80) return 'border-yellow-300';
    if (percentage >= 70) return 'border-orange-400';
    return 'border-red-500';
  };

  const getCardBgColor = (percentage) => {
    if (percentage >= 90) return 'bg-white';
    if (percentage >= 80) return 'bg-yellow-50';
    if (percentage >= 70) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getCardShadow = (percentage) => {
    if (percentage >= 70) return 'shadow-lg';
    return 'shadow-2xl shadow-red-300/50';
  };

  const attendancePercentage = student.attendance_percentage || 100;
  const riskLevel = getRiskLevel(attendancePercentage);

  return (
    <div className={`relative rounded-lg border p-5 hover:shadow-lg transition-all duration-200 ${isInactive ? 'opacity-75 bg-gray-100 border-gray-300' : `${getCardBgColor(attendancePercentage)} ${getCardBorderColor(attendancePercentage)}`}`}>
      
      {/* Status Badge */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
        <span className={`px-3 py-1 rounded text-xs font-medium border ${
          isInactive 
            ? 'bg-red-100 text-red-700 border-red-200' 
            : 'bg-green-100 text-green-700 border-green-200'
        }`}>
          {isInactive ? 'Inactivo' : 'Activo'}
        </span>
        {!isInactive && attendancePercentage < 90 && (
          <span className={`px-3 py-1 rounded text-xs font-semibold border ${
            attendancePercentage >= 80 
              ? 'bg-yellow-100 text-yellow-700 border-yellow-200' 
              : attendancePercentage >= 70
                ? 'bg-orange-100 text-orange-700 border-orange-300 animate-pulse'
                : 'bg-red-100 text-red-700 border-red-300 animate-pulse'
          }`}>
            {riskLevel}
          </span>
        )}
      </div>

      {/* Header with student info */}
      <div className="flex items-start space-x-4 mb-6">
        <div className={`relative w-14 h-14 rounded-lg flex items-center justify-center ${
          isInactive 
            ? 'bg-gray-500' 
            : 'bg-slate-600'
        }`}>
          <User size={20} className="text-white" />
          {!isInactive && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-semibold truncate ${isInactive ? 'text-gray-500' : 'text-gray-900'}`}>
            {student.nombre || `${student.first_name} ${student.last_name}`}
          </h3>
          <p className="text-sm text-gray-600 font-medium">{student.codigo || student.student_code}</p>
          <p className="text-xs text-gray-500 mt-1">{student.email}</p>
        </div>
      </div>

      {/* Academic Information */}
      <div className="space-y-3 mb-6">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="grid grid-cols-1 gap-2">
            <div>
              <span className="text-xs font-medium text-gray-600">Carrera</span>
              <p className={`text-sm font-medium ${isInactive ? 'text-gray-500' : 'text-gray-900'}`}>
                {student.carrera || student.career}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-600">Semestre</span>
              <p className={`text-sm font-medium ${isInactive ? 'text-gray-500' : 'text-gray-900'}`}>
                {student.semestre || student.semester}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className={`rounded-lg p-4 mb-6 border ${
        attendancePercentage < 70 
          ? 'bg-red-50 border-red-300' 
          : attendancePercentage < 80
            ? 'bg-orange-50 border-orange-200'
            : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center bg-white rounded-lg p-2 border border-gray-200">
            <div className="text-lg font-bold text-blue-600">
              {student.attendance_stats?.total_classes || 0}
            </div>
            <div className="text-xs text-gray-600 font-medium">Total</div>
          </div>
          <div className="text-center bg-white rounded-lg p-2 border border-gray-200">
            <div className="text-lg font-bold text-green-600">
              {student.attendance_stats?.present || 0}
            </div>
            <div className="text-xs text-gray-600 font-medium">Presentes</div>
          </div>
          <div className="text-center bg-white rounded-lg p-2 border border-gray-200">
            <div className="text-lg font-bold text-red-600">
              {student.attendance_stats?.absent || 0}
            </div>
            <div className="text-xs text-gray-600 font-medium">Ausentes</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs font-medium mb-2">
            <span className="text-gray-700">Asistencia</span>
            <span className={getAttendanceColor(attendancePercentage)}>{attendancePercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full transition-all duration-500 ${
                attendancePercentage >= 90 
                  ? 'bg-green-600' 
                  : attendancePercentage >= 80 
                    ? 'bg-yellow-600' 
                    : attendancePercentage >= 70
                      ? 'bg-orange-600'
                      : 'bg-red-600'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, attendancePercentage))}%` }}
            ></div>
          </div>
          {/* Indicador de estado */}
          {attendancePercentage < 70 && (
            <div className="mt-3 px-3 py-2 rounded-lg text-xs font-semibold text-center bg-red-600 text-white border border-red-700 animate-pulse">
              CRÍTICO - Más del 30% de faltas
            </div>
          )}
          {attendancePercentage >= 70 && attendancePercentage < 80 && (
            <div className="mt-3 px-3 py-2 rounded-lg text-xs font-medium text-center bg-orange-500 text-white border border-orange-600">
              EN RIESGO - Cerca del límite
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {/* Primera fila de botones */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => onView(student)}
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <Eye size={14} />
            <span>Ver</span>
          </button>
          
          {!isInactive && (
            <button
              onClick={() => onEdit(student)}
              className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <Edit size={14} />
              <span>Editar</span>
            </button>
          )}
          
          {isInactive ? (
            <button
              onClick={() => onRestore ? onRestore(student) : onDelete(student)}
              className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              title="Restaurar estudiante"
            >
              <RotateCcw size={14} />
              <span>Restaurar</span>
            </button>
          ) : (
            <button
              onClick={() => onDelete(student)}
              className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              title="Eliminar estudiante"
            >
              <Trash2 size={14} />
              <span>Eliminar</span>
            </button>
          )}
        </div>

        {/* Segunda fila - Botón de descarga PDF */}
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="w-full px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Descargar reporte PDF"
        >
          {isDownloading ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              <span>Descargando...</span>
            </>
          ) : (
            <>
              <Download size={14} />
              <span>Descargar Reporte PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StudentCard;