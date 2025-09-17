import axios from 'axios'
import Cookies from 'js-cookie'

// API Configuration
const API_CONFIG = {
  BASE_URL: 'https://api.infraxpert.in',
  // BASE_URL: 'http://localhost:5000',
  TIMEOUT: 10000
}

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = Cookies.get('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }

    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`)
    }

    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Log errors
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`)
    }

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        const refreshToken = Cookies.get('refreshToken')
        if (refreshToken) {
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}/api/auth/refresh`,
            { refreshToken }
          )

          const { accessToken, refreshToken: newRefreshToken } = response.data

          // Update tokens
          Cookies.set('accessToken', accessToken, { expires: 1 })
          Cookies.set('refreshToken', newRefreshToken, { expires: 7 })

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        // Clear tokens and redirect to login
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient