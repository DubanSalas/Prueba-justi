"use client"

export default function Sidebar({ activeSection, onNavigate }) {
  const handleQuickAccess = (actionId) => {
    switch (actionId) {
      case "generate-report":
        if (onNavigate) onNavigate("reports")
        break
      case "new-request":
        alert("Funcionalidad de nueva solicitud en desarrollo...")
        break
      case "calendar":
        alert("Funcionalidad de calendario en desarrollo...")
        break
      case "alerts":
        alert("Funcionalidad de alertas en desarrollo...")
        break
      default:
        console.log("Acción no reconocida:", actionId)
    }
  }

  const menuItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      id: "students", 
      label: "Gestión de Estudiantes", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      id: "professors", 
      label: "Gestión de Profesores", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      id: "attendance", 
      label: "Registro de Asistencias", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    { 
      id: "justifications", 
      label: "Justificaciones", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    { 
      id: "reports", 
      label: "Reportes y Analytics", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
  ]

  const quickAccess = [
    { 
      id: "generate-report", 
      label: "Generar Reporte", 
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ), 
      color: "bg-blue-500" 
    },
    { 
      id: "new-request", 
      label: "Nueva Solicitud", 
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ), 
      color: "bg-green-500" 
    },
    { 
      id: "calendar", 
      label: "Ver Calendario", 
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ), 
      color: "bg-purple-500" 
    },
    { 
      id: "alerts", 
      label: "Configurar Alertas", 
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM4.828 4.828A4 4 0 015.5 4H9v1H5.5a3 3 0 00-2.121.879l-.707.707A1 1 0 002 7.414V11H1V7.414a2 2 0 01.586-1.414l.707-.707A5 5 0 015.5 4H9V3a1 1 0 011-1h4a1 1 0 011 1v1h3.5a5 5 0 013.207 1.293l.707.707A2 2 0 0123 7.414V11h-1V7.414a1 1 0 00-.293-.707l-.707-.707A4 4 0 0018.5 5H15V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v1H5.5a4 4 0 00-2.828 1.172z" />
        </svg>
      ), 
      color: "bg-orange-500" 
    },
  ]

  return (
    <aside className="w-80 bg-slate-900 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto shadow-2xl z-sidebar">
      <div className="p-6 flex flex-col gap-8">
        
        {/* User Profile Card */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">Administrador</h3>
              <p className="text-slate-400 text-sm break-all">admin@vallegrandecañete.edu.pe</p>
            </div>
          </div>
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 shadow-lg">
            Cambiar Rol
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="space-y-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate && onNavigate(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left ${
                activeSection === item.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              <span className="font-medium text-base">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Quick Access */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">ACCESOS RÁPIDOS</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickAccess.map((item) => (
              <button
                key={item.id}
                onClick={() => handleQuickAccess(item.id)}
                className={`${item.color} hover:opacity-90 text-white p-6 rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-xs font-semibold text-center leading-tight">{item.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}