import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const Attendance = () => {
  const [attendances, setAttendances] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAttendance, setBulkAttendance] = useState([]);

  useEffect(() => {
    fetchCourses();
    fetchAttendances();
  }, [selectedCourse, selectedDate, statusFilter]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/courses`);
      if (response.data.success) {
        setCourses(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    }
  };

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCourse) params.course_id = selectedCourse;
      if (selectedDate) params.date_from = selectedDate;
      if (selectedDate) params.date_to = selectedDate;
      if (statusFilter) params.status = statusFilter;

      console.log('Cargando asistencias con parámetros:', params);
      const response = await axios.get(`${API_URL}/attendance`, { params });
      console.log('Respuesta del backend:', response.data);
      
      if (response.data.success) {
        console.log('Asistencias:', response.data.data.attendance);
        console.log('Estadísticas:', response.data.data.stats);
        setAttendances(response.data.data.attendance || []);
        setStats(response.data.data.stats || {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          justified: 0,
          attendance_rate: 0
        });
      }
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
      console.error('Detalles:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsByCourse = async (courseId) => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/courses/${courseId}/students`);
      if (response.data.success) {
        setStudents(response.data.data);
        // Inicializar asistencia masiva
        const initialAttendance = response.data.data.map(student => ({
          student_id: student.id,
          student_name: `${student.first_name} ${student.last_name}`,
          student_code: student.student_code,
          status: 'PRESENTE'
        }));
        setBulkAttendance(initialAttendance);
      }
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
    }
  };

  const handleBulkAttendanceChange = (studentId, status) => {
    setBulkAttendance(prev => 
      prev.map(att => 
        att.student_id === studentId ? { ...att, status } : att
      )
    );
  };

  const handleSubmitBulkAttendance = async () => {
    if (!selectedCourse || !selectedDate) {
      alert('Seleccione un curso y una fecha');
      return;
    }

    try {
      const attendanceData = bulkAttendance.map(att => ({
        student_id: att.student_id,
        course_id: parseInt(selectedCourse),
        attendance_date: selectedDate,
        status: att.status,
        recorded_by: 1 // ID del profesor actual
      }));

      await axios.post(`${API_URL}/attendance/create-bulk`, attendanceData);
      alert('Asistencia registrada exitosamente');
      setShowBulkModal(false);
      fetchAttendances();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrar asistencia');
    }
  };

  const handleOpenBulkModal = () => {
    if (!selectedCourse) {
      alert('Seleccione un curso primero');
      return;
    }
    fetchStudentsByCourse(selectedCourse);
    setShowBulkModal(true);
  };

  const handleUpdateStatus = async (attendanceId, newStatus) => {
    try {
      await axios.put(`${API_URL}/attendance/${attendanceId}/update`, {
        status: newStatus
      });
      alert('Estado actualizado');
      fetchAttendances();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar estado');
    }
  };

  const handleDelete = async (attendanceId) => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    
    try {
      await axios.delete(`${API_URL}/attendance/${attendanceId}/delete`);
      alert('Registro eliminado');
      fetchAttendances();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar registro');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PRESENTE': { class: 'bg-green-100 text-green-800', text: 'Presente' },
      'AUSENTE': { class: 'bg-red-100 text-red-800', text: 'Ausente' },
      'TARDANZA': { class: 'bg-yellow-100 text-yellow-800', text: 'Tardanza' },
      'JUSTIFICADO': { class: 'bg-blue-100 text-blue-800', text: 'Justificado' }
    };
    const badge = badges[status] || badges['AUSENTE'];
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.class}`}>{badge.text}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Registro de Asistencias</h1>
        <button 
          onClick={handleOpenBulkModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Registrar Asistencia
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <h3 className="text-3xl font-bold text-blue-600 mb-2">{stats.total || 0}</h3>
          <p className="text-gray-600 font-medium">Total Registros</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <h3 className="text-3xl font-bold text-green-600 mb-2">{stats.present || 0}</h3>
          <p className="text-gray-600 font-medium">Presentes</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <h3 className="text-3xl font-bold text-red-600 mb-2">{stats.absent || 0}</h3>
          <p className="text-gray-600 font-medium">Ausentes</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <h3 className="text-3xl font-bold text-purple-600 mb-2">{stats.attendance_rate || 0}%</h3>
          <p className="text-gray-600 font-medium">Tasa de Asistencia</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Curso:</label>
            <select 
              value={selectedCourse} 
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los cursos</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.course_code} - {course.course_name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Estado:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="PRESENTE">Presente</option>
              <option value="AUSENTE">Ausente</option>
              <option value="TARDANZA">Tardanza</option>
              <option value="JUSTIFICADO">Justificado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de asistencias */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      ) : attendances.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay registros de asistencia</h3>
          <p className="text-gray-600 mb-6">No se encontraron registros con los filtros seleccionados</p>
          <button 
            onClick={handleOpenBulkModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-colors duration-200 inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Registrar Primera Asistencia
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estudiante</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Código</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Curso</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Registrado por</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendances.map(attendance => (
                  <tr key={attendance.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(attendance.attendance_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{attendance.student_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{attendance.student_code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{attendance.course_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(attendance.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{attendance.recorded_by_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2 items-center">
                        <select
                          value={attendance.status}
                          onChange={(e) => handleUpdateStatus(attendance.id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="PRESENTE">Presente</option>
                          <option value="AUSENTE">Ausente</option>
                          <option value="TARDANZA">Tardanza</option>
                          <option value="JUSTIFICADO">Justificado</option>
                        </select>
                        <button 
                          onClick={() => handleDelete(attendance.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg text-xs transition-colors flex items-center justify-center"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de registro masivo */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowBulkModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Registrar Asistencia - {selectedDate}</h2>
              <p className="text-gray-600 mt-2">
                Curso: {courses.find(c => c.id === parseInt(selectedCourse))?.course_name}
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Código</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estudiante</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bulkAttendance.map(att => (
                      <tr key={att.student_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{att.student_code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{att.student_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={att.status}
                            onChange={(e) => handleBulkAttendanceChange(att.student_id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="PRESENTE">✓ Presente</option>
                            <option value="AUSENTE">✗ Ausente</option>
                            <option value="TARDANZA">⏰ Tardanza</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={() => setShowBulkModal(false)}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSubmitBulkAttendance}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                Guardar Asistencia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
