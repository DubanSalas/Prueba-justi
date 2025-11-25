import React, { useState } from 'react';
import { X, Mail, Send } from 'lucide-react';

const SendMessageModal = ({ isOpen, onClose, student, onSend }) => {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('Alerta de Inasistencia');
  const [sending, setSending] = useState(false);

  if (!isOpen || !student) return null;

  const handleSend = async () => {
    if (!message.trim()) {
      alert('Por favor, escribe un mensaje');
      return;
    }

    setSending(true);
    try {
      await onSend(student, subject, message);
      setMessage('');
      setSubject('Alerta de Inasistencia');
      onClose();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-slate-700 px-6 py-5 border-b border-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                <Mail className="text-slate-200" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Enviar Mensaje</h3>
                <p className="text-slate-300 text-sm">Contactar al estudiante por correo</p>
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

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Student Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center text-white font-semibold text-base">
                {student.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{student.name}</h4>
                <p className="text-sm text-gray-600">{student.email}</p>
                <p className="text-xs text-gray-500">{student.code} • {student.career}</p>
              </div>
            </div>
          </div>

          {/* Alert Stats */}
          <div className="bg-red-50 rounded-lg p-4 mb-4 border border-red-200">
            <div className="flex items-center gap-2 mb-3">
              <h5 className="font-semibold text-red-800 text-sm">Estadísticas de Asistencia</h5>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xl font-bold text-blue-600">{student.totalClasses}</p>
                <p className="text-xs text-gray-600">Total clases</p>
              </div>
              <div className="text-center bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xl font-bold text-red-600">{student.absences}</p>
                <p className="text-xs text-gray-600">Inasistencias</p>
              </div>
              <div className="text-center bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xl font-bold text-red-700">{student.percentage}%</p>
                <p className="text-xs text-gray-600">Porcentaje</p>
              </div>
            </div>
          </div>

          {/* Subject Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asunto del correo
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Asunto del mensaje..."
            />
          </div>

          {/* Message Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje personalizado
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder={`Estimado/a ${student.name},\n\nHemos notado que tienes un ${student.percentage}% de inasistencias en tus clases...\n\nTe recomendamos...`}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length} caracteres
            </p>
          </div>

          {/* Preview */}
          {message && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-2">Vista previa:</p>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {message}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={sending}
            className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Enviar Mensaje</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendMessageModal;
