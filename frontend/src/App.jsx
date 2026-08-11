import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar/Navbar'
import Chatbot from './components/Chatbot/Chatbot'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Predict from './pages/Predict'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import BMI from './pages/BMI'
import Hospitals from './pages/Hospitals'
import Appointments from './pages/Appointments'
import Medicine from './pages/Medicine'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function AppContent() {
  const { user } = useAuth()
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/login"     element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register"  element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/predict"   element={<PrivateRoute><Predict /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/bmi"          element={<PrivateRoute><BMI /></PrivateRoute>} />
        <Route path="/hospitals"    element={<PrivateRoute><Hospitals /></PrivateRoute>} />
        <Route path="/appointments" element={<PrivateRoute><Appointments /></PrivateRoute>} />
        <Route path="/medicine"     element={<PrivateRoute><Medicine /></PrivateRoute>} />
        <Route path="/admin"     element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
      {user && <Chatbot />}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  )
}
