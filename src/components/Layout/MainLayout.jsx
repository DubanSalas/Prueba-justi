"use client"
import Navbar from "./Navbar/Navbar"
import Sidebar from "./Sidebar/Sidebar"

export default function MainLayout({ children, activeSection, onNavigate }) {
  const handleLogout = () => {
    console.log("[v0] Logout clicked")
    // Add logout logic here
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar onLogout={handleLogout} />
      <div className="flex relative lg:flex-row flex-col">
        <Sidebar activeSection={activeSection} onNavigate={onNavigate} />
        <main className="flex-1 min-h-[calc(100vh-64px)] lg:min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-120px)] sm:min-h-[calc(100vh-140px)] overflow-x-hidden p-0 w-full">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
