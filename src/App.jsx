import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Navbar } from './components/Navbar'
import { Toasts } from './components/Toasts'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Subjects from './pages/Subjects'
import Attendance from './pages/Attendance'
import Funds from './pages/Funds'
import Grades from './pages/Grades'

function Shell() {
  const { user, loading, logout, toasts } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (loading) {
    return <div className="relative z-10 min-h-screen grid place-items-center text-white/50 text-sm">Memuat…</div>
  }
  if (!user) return <Login />

  return (
    <>
      <Navbar user={user} onLogout={logout} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Routes>
          <Route path="/" element={<ProtectedRoute user={user}><Dashboard /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute user={user}><Students /></ProtectedRoute>} />
          <Route path="/subjects" element={<ProtectedRoute user={user} allowedRoles={['developer']}><Subjects /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute user={user} allowedRoles={['developer', 'walikelas', 'sekretaris']}><Attendance /></ProtectedRoute>} />
          <Route path="/funds" element={<ProtectedRoute user={user} allowedRoles={['developer', 'walikelas', 'bendahara']}><Funds /></ProtectedRoute>} />
          <Route path="/grades" element={<ProtectedRoute user={user} allowedRoles={['developer', 'walikelas']}><Grades /></ProtectedRoute>} />
        </Routes>
      </main>
      <Toasts toasts={toasts} />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="aurora-bg">
        <div className="aurora-blob b1"></div>
        <div className="aurora-blob b2"></div>
        <div className="aurora-blob b3"></div>
        <div className="aurora-blob b4"></div>
      </div>
      <div className="noise-overlay"></div>
      <AppProvider>
        <Shell />
      </AppProvider>
    </BrowserRouter>
  )
}
