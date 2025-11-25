import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StudentLayout from '../../components/Student/StudentLayout';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

export default function ChangePassword() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage({ type: '', text: '' });
  };

  const toggleShowPassword = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setMessage({ type: 'error', text: 'Ingresa tu contraseña actual' });
      return false;
    }
    
    if (!formData.newPassword) {
      setMessage({ type: 'error', text: 'Ingresa tu nueva contraseña' });
      return false;
    }
    
    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' });
      return false;
    }
    
    if (formData.newPassword === formData.currentPassword) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe ser diferente a la actual' });
      return false;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/change-password',
        {
          current_password: formData.currentPassword,
          new_password: formData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: '✅ Contraseña cambiada exitosamente. Redirigiendo...' 
        });
        
        // Limpiar formulario
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Redirigir al dashboard después de 2 segundos
        setTimeout(() => {
          navigate('/student/dashboard');
        }, 2000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error al cambiar la contraseña';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { strength, text: 'Débil', color: 'text-red-600' };
    if (strength <= 3) return { strength, text: 'Media', color: 'text-yellow-600' };
    return { strength, text: 'Fuerte', color: 'text-green-600' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <StudentLayout>
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
            >
              ← Volver al Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cambiar Contraseña</h1>
            <p className="text-gray-600">
              Actualiza tu contraseña para mantener tu cuenta segura
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lock className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-blue-900 mb-2">🔒 Seguridad de tu Cuenta</h3>
                <p className="text-sm text-blue-800 mb-2">
                  Por tu seguridad, te recomendamos cambiar la contraseña inicial que te proporcionó el profesor.
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✓ Usa al menos 6 caracteres</li>
                  <li>✓ Combina letras, números y símbolos</li>
                  <li>✓ No compartas tu contraseña con nadie</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Contraseña Actual <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none pr-12"
                    placeholder="Ingresa tu contraseña actual"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowPassword('current')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nueva Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    minLength="6"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none pr-12"
                    placeholder="Ingresa tu nueva contraseña (mínimo 6 caracteres)"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowPassword('new')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                {/* Password Strength */}
                {formData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            passwordStrength.strength <= 2 ? 'bg-red-500' :
                            passwordStrength.strength <= 3 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${passwordStrength.color}`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Confirmar Nueva Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength="6"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none pr-12"
                    placeholder="Confirma tu nueva contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowPassword('confirm')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                {/* Match Indicator */}
                {formData.confirmPassword && (
                  <div className="mt-2">
                    {formData.newPassword === formData.confirmPassword ? (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle size={16} />
                        <span>Las contraseñas coinciden</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle size={16} />
                        <span>Las contraseñas no coinciden</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Message */}
              {message.text && (
                <div className={`p-4 rounded-xl ${
                  message.type === 'success' 
                    ? 'bg-green-50 border-2 border-green-200 text-green-800' 
                    : 'bg-red-50 border-2 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center gap-2">
                    {message.type === 'success' ? (
                      <CheckCircle size={20} />
                    ) : (
                      <AlertCircle size={20} />
                    )}
                    <span className="font-medium">{message.text}</span>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/student/dashboard')}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Cambiando...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      <span>Cambiar Contraseña</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
