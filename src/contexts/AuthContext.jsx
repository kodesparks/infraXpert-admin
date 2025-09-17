import { createContext, useContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import authService from '@/services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accessToken, setAccessToken] = useState(null)

  // Initialize auth state from stored tokens
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedAccessToken = Cookies.get('accessToken')
        const storedRefreshToken = Cookies.get('refreshToken')
        const storedUser = localStorage.getItem('user')

        if (storedAccessToken && storedUser) {
          setAccessToken(storedAccessToken)
          setUser(JSON.parse(storedUser))
        } else if (storedRefreshToken) {
          // Try to refresh the token
          await refreshAccessToken()
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        clearAuthData()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // Login function
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)
      const { user: userData, accessToken: newAccessToken, refreshToken } = response

      // Store tokens and user data
      setUser(userData)
      setAccessToken(newAccessToken)
      
      // Store in cookies
      Cookies.set('accessToken', newAccessToken, { expires: 1 }) // 1 day
      Cookies.set('refreshToken', refreshToken, { expires: 7 }) // 7 days
      localStorage.setItem('user', JSON.stringify(userData))

      return { success: true, user: userData }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  // Refresh access token
  const refreshAccessToken = async () => {
    try {
      const refreshToken = Cookies.get('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await authService.refreshToken(refreshToken)
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response

      // Update tokens
      setAccessToken(newAccessToken)
      Cookies.set('accessToken', newAccessToken, { expires: 1 })
      Cookies.set('refreshToken', newRefreshToken, { expires: 7 })

      return newAccessToken
    } catch (error) {
      console.error('Token refresh error:', error)
      clearAuthData()
      throw error
    }
  }

  // Logout function
  const logout = async () => {
    try {
      const refreshToken = Cookies.get('refreshToken')
      if (refreshToken) {
        await authService.logout(refreshToken)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuthData()
    }
  }

  // Clear all auth data
  const clearAuthData = () => {
    setUser(null)
    setAccessToken(null)
    Cookies.remove('accessToken')
    Cookies.remove('refreshToken')
    localStorage.removeItem('user')
  }

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!accessToken
  }

  // Check if user has specific permission
  const hasPermission = (permission) => {
    // Admin has all permissions
    if (user?.role === 'admin') {
      return true
    }
    return user?.permissions?.includes(permission) || false
  }

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role
  }

  // Get user's access level
  const getAccessLevel = () => {
    return user?.accessLevel || 'none'
  }

  const value = {
    user,
    accessToken,
    loading,
    login,
    logout,
    refreshAccessToken,
    isAuthenticated,
    hasPermission,
    hasRole,
    getAccessLevel
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
