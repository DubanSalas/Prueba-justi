import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Escuchar eventos de notificación
    const handleNotification = (event) => {
      const notification = {
        id: Date.now(),
        ...event.detail,
        timestamp: new Date()
      };
      
      setNotifications(prev => [...prev, notification]);
      
      // Auto-remove después de 5 segundos
      setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
    };

    window.addEventListener('showNotification', handleNotification);
    
    return () => {
      window.removeEventListener('showNotification', handleNotification);
    };
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} className="text-white" />;
      case 'error': return <XCircle size={20} className="text-white" />;
      case 'warning': return <AlertCircle size={20} className="text-white" />;
      case 'info': return <Info size={20} className="text-white" />;
      default: return <Info size={20} className="text-white" />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-2xl';
      case 'error': return 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-2xl';
      case 'warning': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-2xl';
      case 'info': return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-2xl';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`group max-w-sm w-full rounded-2xl p-6 backdrop-blur-sm transform transition-all duration-500 animate-in slide-in-from-right hover:scale-105 ${getStyles(notification.type)}`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold mb-2">
                {notification.title}
              </h4>
              <p className="text-sm opacity-90 leading-relaxed">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
            >
              <X size={16} className="text-white" />
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 w-full bg-white/20 rounded-full h-1">
            <div className="bg-white/40 h-1 rounded-full animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Función helper para mostrar notificaciones
export const showNotification = (type, title, message) => {
  const event = new CustomEvent('showNotification', {
    detail: { type, title, message }
  });
  window.dispatchEvent(event);
};

export default NotificationSystem;