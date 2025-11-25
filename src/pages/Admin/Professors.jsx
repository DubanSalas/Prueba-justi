import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const Professors = () => {
  const [professors, setProfessors] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    professor_code: '',
    email: '',
    phone: '',
    dni: '',
    specialization: '',
    department: '',
    role: 'PROFESOR'
  });

  useEffect(() => {
    fetchProfessors();
  }, [statusFilter, searchTerm]);

  const fetchProfessors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/professors`, {
        params: {
          status: statusFilter,
          search: searchTerm
        }
      });
      
      if (response.data.success) {
        setProfessors(response.data.data.professors);
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Error al cargar profesores:', error);
      alert('Error al cargar profesores');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingProfessor) {
        // Actualizar
        await axios.put(`${API_URL}/professors/${editingProfessor.id}/update`, formData);
        alert('Profesor actualizado exitosamente');
      } else {
        // Crear
        await axios.post(`${API_URL}/professors/create`, formData);
        alert('Profesor creado exitosamente');
      }
      
      setShowModal(false);
      resetForm();
      fetchProfessors();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Error al guardar profesor');
    }
  };

  const handleEdit = (professor) => {
    setEditingProfessor(professor);
    setFormData({
      first_name: professor.first_name,
      last_name: professor.last_name,
      professor_code: professor.professor_code,
      email: professor.email,
      phone: professor.phone || '',
      dni: professor.dni || '',
      specialization: professor.specialization || '',
      department: professor.department || '',
      role: professor.role
    });
    setShowModal(true);
  };

  const handleDelete = async (professorId) => {
    if (!window.confirm('¿Está seguro de desactivar este profesor?')) return;
    
    try {
      await axios.patch(`${API_URL}/professors/${professorId}/delete`);
      alert('Profesor desactivado exitosamente');
      fetchProfessors();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al desactivar profesor');
    }
  };

  const handleRestore = async (professorId) => {
    try {
      await axios.patch(`${API_URL}/professors/${professorId}/restore`);
      alert('Profesor restaurado exitosamente');
      fetchProfessors();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al restaurar profesor');
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      professor_code: '',
      email: '',
      phone: '',
      dni: '',
      specialization: '',
      department: '',
      role: 'PROFESOR'
    });
    setEditingProfessor(null);
  };

  const getRoleBadge = (role) => {
    const badges = {
      'PROFESOR': { class: 'bg-blue-100 text-blue-800', text: 'Profesor' },
      'COORDINADOR': { class: 'bg-orange-100 text-orange-800', text: 'Coordinador' },
      'ADMIN': { class: 'bg-purple-100 text-purple-800', text: 'Admin' }
    };
    const badge = badges[role] || badges['PROFESOR'];
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.class}`}>{badge.text}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Profesores</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo Profesor
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <h3 className="text-3xl font-bold text-blue-600 mb-2">{stats.total || 0}</h3>
          <p className="text-gray-600 font-medium">Total Profesores</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <h3 className="text-3xl font-bold text-green-600 mb-2">{stats.active || 0}</h3>
          <p className="text-gray-600 font-medium">Activos</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <h3 className="text-3xl font-bold text-orange-600 mb-2">{stats.by_role?.coordinators || 0}</h3>
          <p className="text-gray-600 font-medium">Coordinadores</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <h3 className="text-3xl font-bold text-purple-600 mb-2">{stats.by_role?.regular || 0}</h3>
          <p className="text-gray-600 font-medium">Profesores</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Estado:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar:</label>
            <input
              type="text"
              placeholder="Nombre, código, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Tabla de profesores */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Código</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Departamento</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Especialización</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {professors.map(professor => (
                  <tr key={professor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{professor.professor_code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{professor.first_name} {professor.last_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{professor.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{professor.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{professor.specialization}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(professor.role)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        professor.status === 'A' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {professor.status === 'A' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(professor)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Editar
                        </button>
                        {professor.status === 'A' ? (
                          <button 
                            onClick={() => handleDelete(professor.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Desactivar
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleRestore(professor.id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Restaurar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">{editingProfessor ? 'Editar Profesor' : 'Nuevo Profesor'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Apellido *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Código *</label>
                  <input
                    type="text"
                    name="professor_code"
                    value={formData.professor_code}
                    onChange={handleInputChange}
                    required
                    disabled={editingProfessor}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">DNI</label>
                  <input
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Departamento *</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Especialización</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rol *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="PROFESOR">Profesor</option>
                  <option value="COORDINADOR">Coordinador</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                >
                  {editingProfessor ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Professors;
