import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SendMessageModal from './SendMessageModal';

const AttendanceReportModal = ({ isOpen, onClose }) => {
  const [criticalStudents, setCriticalStudents] = useState([]);
  const [riskStudents, setRiskStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (isOpen) {
      fetchAttendanceAlerts();
    }
  }, [isOpen]);

  const fetchAttendanceAlerts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/students/?include_stats=true', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const studentsData = response.data.data.students || [];
        const critical = [];
        const risk = [];
        
        studentsData.forEach(student => {
          const attendancePercentage = student.attendance_percentage || 100;
          const absencePercentage = 100 - attendancePercentage;
          
          const studentData = {
            id: student.id,
            name: student.full_name || `${student.first_name} ${student.last_name}`,
            code: student.student_code || student.codigo,
            career: student.career || student.carrera || 'N/A',
            totalClasses: student.attendance_stats?.total_classes || 0,
            absences: student.attendance_stats?.absent || 0,
            percentage: absencePercentage.toFixed(1),
            email: student.email
          };
          
          if (absencePercentage >= 30) {
            critical.push(studentData);
          } else if (absencePercentage >= 25) {
            risk.push(studentData);
          }
        });
        
        setCriticalStudents(critical);
        setRiskStudents(risk);
      }
    } catch (error) {
      console.error('Error al cargar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleContactStudent = (student) => {
    setSelectedStudent(student);
    setShowMessageModal(true);
  };

  const handleSendMessage = async (student, subject, message) => {
    try {
      await axios.post(
        `http://localhost:5000/api/professor/dashboard/send-custom-alert/${student.id}`,
        { subject, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Mensaje enviado exitosamente');
    } catch (error) {
      alert('Error al enviar el mensaje');
      console.error(error);
      throw error;
    }
  };

  return (
    <>
      <SendMessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        student={selectedStudent}
        onSend={handleSendMessage}
      />
      
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-slate-700 px-6 py-5 border-b border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Reporte de Asistencia</h2>
                  <p className="text-slate-300 text-sm">Estudiantes que requieren atención</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-slate-600 rounded-lg text-white hover:bg-slate-500 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
              </div>
            ) : (
              <>
                {/* Estudiantes Críticos */}
                {criticalStudents.length > 0 && (
                  <div className="mb-8">
                    <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-5 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div>
                            <h3 className="text-lg font-bold text-red-900">Estudiantes Críticos</h3>
                            <p className="text-sm text-red-700">30% o más de inasistencias</p>
                          </div>
                        </div>
                        <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                          {criticalStudents.length}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {criticalStudents.map((student) => (
                        <div key={student.id} className="bg-white border-2 border-red-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-lg font-bold text-gray-900">{student.name}</h4>
                                <span className="bg-red-100 text-red-800 px-3 py-1 rounded text-xs font-medium border border-red-200 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  CRÍTICO
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{student.code} • {student.career}</p>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <p className="text-xs text-gray-600 mb-1">Total Clases</p>
                                  <p className="text-xl font-bold text-gray-900">{student.totalClasses}</p>
                                </div>
                                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                                  <p className="text-xs text-red-600 mb-1">Inasistencias</p>
                                  <p className="text-xl font-bold text-red-700">{student.absences}</p>
                                </div>
                                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                                  <p className="text-xs text-red-600 mb-1">Porcentaje</p>
                                  <p className="text-xl font-bold text-red-700">{student.percentage}%</p>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleContactStudent(student)}
                              className="ml-4 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Contactar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estudiantes en Riesgo */}
                {riskStudents.length > 0 && (
                  <div className="mb-8">
                    <div className="bg-orange-50 border-l-4 border-orange-600 rounded-lg p-5 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div>
                            <h3 className="text-lg font-bold text-orange-900">Estudiantes en Riesgo</h3>
                            <p className="text-sm text-orange-700">25-29% de inasistencias</p>
                          </div>
                        </div>
                        <span className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold">
                          {riskStudents.length}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {riskStudents.map((student) => (
                        <div key={student.id} className="bg-white border-2 border-orange-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-lg font-bold text-gray-900">{student.name}</h4>
                                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded text-xs font-medium border border-orange-200 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                  EN RIESGO
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{student.code} • {student.career}</p>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <p className="text-xs text-gray-600 mb-1">Total Clases</p>
                                  <p className="text-xl font-bold text-gray-900">{student.totalClasses}</p>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                                  <p className="text-xs text-orange-600 mb-1">Inasistencias</p>
                                  <p className="text-xl font-bold text-orange-700">{student.absences}</p>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                                  <p className="text-xs text-orange-600 mb-1">Porcentaje</p>
                                  <p className="text-xl font-bold text-orange-700">{student.percentage}%</p>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleContactStudent(student)}
                              className="ml-4 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Contactar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sin alertas */}
                {criticalStudents.length === 0 && riskStudents.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Excelente</h3>
                    <p className="text-gray-600">No hay estudiantes con alertas de inasistencia</p>
                  </div>
                )}

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-900">
                      <p className="font-bold mb-1">Reporte generado el {new Date().toLocaleDateString('es-ES')}</p>
                      <p>Datos actualizados en tiempo real</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AttendanceReportModal;
