import apiClient from '@/lib/apiClient'

class UserService {
  // Get all users with pagination and filters
  async getUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      // Add pagination
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      
      // Add filters
      if (params.role) queryParams.append('role', params.role)
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive)
      if (params.search) queryParams.append('search', params.search)
      
      const response = await apiClient.get(`/api/users?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await apiClient.get(`/api/users/${userId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Create new user
  async createUser(userData) {
    try {
      const response = await apiClient.post('/api/users', userData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Update user
  async updateUser(userId, userData) {
    try {
      const response = await apiClient.put(`/api/users/${userId}`, userData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Change user role (Admin only)
  async changeUserRole(userId, role) {
    try {
      const response = await apiClient.put(`/api/admin/users/${userId}/role`, { role })
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Activate/Deactivate user (Admin only)
  async changeUserStatus(userId, isActive) {
    try {
      const response = await apiClient.put(`/api/admin/users/${userId}/status`, { isActive })
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Delete user (Admin only)
  async deleteUser(userId) {
    try {
      const response = await apiClient.delete(`/api/users/${userId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get role configuration
  async getRoleConfig(role) {
    try {
      const response = await apiClient.get(`/api/users/roles/${role}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get all roles
  async getAllRoles() {
    try {
      const response = await apiClient.get('/api/users/roles')
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get system stats (Admin only)
  async getSystemStats() {
    try {
      const response = await apiClient.get('/api/admin/stats')
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default new UserService()
