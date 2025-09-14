import apiClient from '@/lib/apiClient'
import Cookies from 'js-cookie'

class AuthService {
  // Login user
  async login(email, password) {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Refresh access token
  async refreshToken(refreshToken) {
    try {
      const response = await apiClient.post('/api/auth/refresh', {
        refreshToken
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Logout user
  async logout() {
    try {
      const refreshToken = Cookies.get('refreshToken')
      if (refreshToken) {
        await apiClient.post('/api/auth/logout', {
          refreshToken
        })
      }
    } catch (error) {
      // Even if logout API fails, we should clear local data
      console.error('Logout API error:', error)
    }
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/api/auth/me')
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default new AuthService()
