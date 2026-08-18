import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 3000
})

// Attach Bearer token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mealmate_session_token') || localStorage.getItem('mealmate_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Global Response Interceptor for Error Handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const isApiValidation = Boolean(error.response?.data?.message && error.response?.status !== 404)
    const message = error.response?.data?.message || error.message || 'API Request Failed'
    const errObj = new Error(message)
    errObj.isBackendValidationError = isApiValidation
    return Promise.reject(errObj)
  }
)

export default api
