import axios from 'axios'

// Create Axios Instance
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor: Attach JWT Bearer Token & Refresh Token
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('mealmate_access_token') || localStorage.getItem('mealmate_session_token')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Catch 401 Unauthorized and auto-refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('mealmate_refresh_token') || 'mock_refresh_token_7_days'
        
        // Mock Refresh Token Call
        const refreshResponse = await api.post('/auth/refresh-token', { refreshToken })
        const newAccessToken = refreshResponse.data.accessToken || `mock_jwt_access_${Date.now()}`

        localStorage.setItem('mealmate_access_token', newAccessToken)
        localStorage.setItem('mealmate_token', newAccessToken)

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (refreshErr) {
        localStorage.removeItem('mealmate_access_token')
        localStorage.removeItem('mealmate_refresh_token')
        window.location.href = '/auth'
        return Promise.reject(refreshErr)
      }
    }
    return Promise.reject(error)
  }
)

export default api
