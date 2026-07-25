import axios from 'axios'

// In production (Vercel), use the VITE_API_URL env variable pointing to Render backend.
// In development, use the Vite proxy (/api → localhost:8000).
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medipredict_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('medipredict_token')
      localStorage.removeItem('medipredict_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
}

export const predictAPI = {
  getSymptoms:     ()     => api.get('/predict/symptoms'),
  predictDisease:  (data) => api.post('/predict/disease', data),
  predictDiabetes: (data) => api.post('/predict/diabetes', data),
  predictHeart:    (data) => api.post('/predict/heart', data),
}

export const healthAPI = {
  getHistory: (params) => api.get('/health/history', { params }),
  getStats:   ()       => api.get('/health/stats'),
}

export const adminAPI = {
  getStats:          () => api.get('/admin/stats'),
  getUsers:          () => api.get('/admin/users'),
  toggleUser:        (id) => api.put(`/admin/users/${id}/toggle`),
  recentPredictions: () => api.get('/admin/recent-predictions'),
}

export default api
