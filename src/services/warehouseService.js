import apiClient from '@/lib/apiClient'
import { API_CONFIG } from '@/config/api'

class WarehouseService {
  // Create a new standalone warehouse (creates vendor user automatically)
  async createWarehouse(warehouseData) {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.WAREHOUSE.CREATE, warehouseData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Trigger inventory sync after warehouse updates (admin only). POST /api/warehouse/sync-inventory.
  async syncInventory() {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.WAREHOUSE.SYNC_INVENTORY)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Cleanup orphaned warehouse references. POST /api/warehouse/cleanup-orphaned. Auth: Admin/Manager.
  async cleanupOrphaned() {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.WAREHOUSE.CLEANUP_ORPHANED)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Delete a warehouse (soft delete by deactivating vendor)
  async deleteWarehouse(vendorId) {
    try {
      const response = await apiClient.delete(API_CONFIG.ENDPOINTS.WAREHOUSE.DELETE.replace(':vendorId', vendorId))
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Search warehouses by various filters
  async searchWarehouses(searchParams = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      // Add search parameters
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value)
        }
      })
      
      const url = `${API_CONFIG.ENDPOINTS.WAREHOUSE.SEARCH}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await apiClient.get(url)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get all warehouses with pagination and filtering
  async listWarehouses(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      // Add pagination and filter parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value)
        }
      })
      
      const url = `${API_CONFIG.ENDPOINTS.WAREHOUSE.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await apiClient.get(url)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get all available warehouses for inventory creation dropdown
  async getAvailableWarehouses() {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.WAREHOUSE.AVAILABLE)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get warehouse details by vendor ID
  async getWarehouseByVendor(vendorId) {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.WAREHOUSE.GET_BY_VENDOR.replace(':vendorId', vendorId))
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Update warehouse information
  async updateWarehouse(vendorId, warehouseData) {
    try {
      const response = await apiClient.put(API_CONFIG.ENDPOINTS.WAREHOUSE.UPDATE_VENDOR.replace(':vendorId', vendorId), warehouseData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Helper method to get warehouses for the warehouses page
  async getWarehousesForPage(params = {}) {
    try {
      // Use the list API with pagination
      const response = await this.listWarehouses({
        page: params.page || 1,
        limit: params.limit || 20,
        ...params
      })
      return response
    } catch (error) {
      throw error
    }
  }

  // Helper method to search warehouses with filters
  async searchWarehousesWithFilters(filters = {}) {
    try {
      const searchParams = {}
      
      // Map common filter names to API parameter names
      if (filters.searchTerm) searchParams.q = filters.searchTerm
      if (filters.category) searchParams.category = filters.category
      if (filters.city) searchParams.city = filters.city
      if (filters.state) searchParams.state = filters.state
      if (filters.pincode) searchParams.pincode = filters.pincode
      if (filters.isVerified !== undefined) searchParams.isVerified = filters.isVerified
      
      return await this.searchWarehouses(searchParams)
    } catch (error) {
      throw error
    }
  }
}

export default new WarehouseService()
