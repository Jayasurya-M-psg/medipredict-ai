import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('medipredict_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await authAPI.login({ email, password })
      const { access_token, user: userData } = res.data
      localStorage.setItem('medipredict_token', access_token)
      localStorage.setItem('medipredict_user', JSON.stringify(userData))
      setUser(userData)
      return { success: true }
    } catch (err) {
      if (!err.response) {
        // Network error or timeout — Render cold start
        return { success: false, error: 'timeout' }
      }
      const detail = err.response?.data?.detail || ''
      return { success: false, error: detail || 'Invalid email or password' }
    } finally {
      setLoading(false)
    }
  }

  const register = async (full_name, email, password) => {
    setLoading(true)
    try {
      const res = await authAPI.register({ full_name, email, password })
      const { access_token, user: userData } = res.data
      localStorage.setItem('medipredict_token', access_token)
      localStorage.setItem('medipredict_user', JSON.stringify(userData))
      setUser(userData)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Registration failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = useCallback(() => {
    localStorage.removeItem('medipredict_token')
    localStorage.removeItem('medipredict_user')
    setUser(null)
  }, [])

  const updateUser = (userData) => {
    const updated = { ...user, ...userData }
    localStorage.setItem('medipredict_user', JSON.stringify(updated))
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
