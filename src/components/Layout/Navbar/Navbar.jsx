"use client"

export default function Navbar({ onLogout }) {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-navbar h-16 shadow-lg">
      {/* Left Section - Logo */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg">
            VG
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent m-0 leading-tight">
              Sistema Administrativo
            </h1>
            <p className="text-sm text-gray-600 m-0 leading-tight flex items-center gap-2">
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Instituto Valle Grande de Cañete
            </p>
          </div>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-lg mx-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center gap-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Buscar en el sistema..." 
              className="flex-1 border-none bg-transparent outline-none text-sm text-gray-900 placeholder-gray-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="group relative w-12 h-12 rounded-2xl border border-gray-200 bg-white/60 backdrop-blur-sm flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-white hover:shadow-lg hover:scale-105">
          <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5z" />
          </svg>
          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center shadow-lg">
            12
          </span>
        </button>

        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
          <img 
            src="/diverse-user-avatars.png" 
            alt="Usuario" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Logout Button */}
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-white border-none text-red-500 rounded-lg text-sm font-medium cursor-pointer transition-colors hover:bg-red-50"
          onClick={onLogout}
        >
          <i className="fas fa-sign-out-alt text-sm"></i>
          Cerrar Sesión
        </button>
      </div>
    </nav>
  )
}
