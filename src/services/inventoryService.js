import apiClient from '@/lib/apiClient'

class InventoryService {
  // Dashboard Overview
  async getOverviewStats() {
    try {
      const response = await apiClient.get('/api/inventory/stats/overview')
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get all inventory items with filters and pagination
  async getInventoryItems(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      // Add pagination
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      
      // Add filters
      if (params.category) queryParams.append('category', params.category)
      if (params.subCategory) queryParams.append('subCategory', params.subCategory)
      if (params.vendorId) queryParams.append('vendorId', params.vendorId)
      if (params.search) queryParams.append('search', params.search)
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive)
      
      const response = await apiClient.get(`/api/inventory?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get single inventory item
  async getInventoryItem(itemId) {
    try {
      const response = await apiClient.get(`/api/inventory/${itemId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Create new inventory item
  async createInventoryItem(itemData) {
    try {
      const response = await apiClient.post('/api/inventory', itemData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Update inventory item
  async updateInventoryItem(itemId, itemData) {
    try {
      const response = await apiClient.put(`/api/inventory/${itemId}`, itemData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Delete/Deactivate inventory item
  async deleteInventoryItem(itemId) {
    try {
      const response = await apiClient.delete(`/api/inventory/${itemId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Reactivate inventory item
  async reactivateInventoryItem(itemId) {
    try {
      const response = await apiClient.put(`/api/inventory/${itemId}`, {
        isActive: true
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Image Management
  async uploadImages(itemId, images) {
    try {
      const formData = new FormData()
      images.forEach((image, index) => {
        formData.append('images', image)
      })
      
      const response = await apiClient.post(`/api/inventory/${itemId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getImages(itemId) {
    try {
      const response = await apiClient.get(`/api/inventory/${itemId}/images`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async setPrimaryImage(itemId, imageKey) {
    try {
      // URL encode the imageKey to handle forward slashes and special characters
      const encodedImageKey = encodeURIComponent(imageKey)
      const response = await apiClient.put(`/api/inventory/${itemId}/images/${encodedImageKey}/primary`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async removeImage(itemId, imageKey) {
    try {
      // URL encode the imageKey to handle forward slashes and special characters
      const encodedImageKey = encodeURIComponent(imageKey)
      const response = await apiClient.delete(`/api/inventory/${itemId}/images/${encodedImageKey}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Pricing Management
  async createOrUpdatePrice(priceData) {
    try {
      const response = await apiClient.post('/api/inventory/price', priceData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getPrices(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.vendorId) queryParams.append('vendorId', params.vendorId)
      if (params.minPrice) queryParams.append('minPrice', params.minPrice)
      if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice)
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive)
      
      const response = await apiClient.get(`/api/inventory/price/list?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get pricing data for a single inventory item
  async getItemPricing(itemId) {
    try {
      const response = await apiClient.get(`/api/inventory/${itemId}/price`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Shipping Management
  async createOrUpdateShipping(shippingData) {
    try {
      const response = await apiClient.post('/api/inventory/shipping', shippingData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async calculateShipping(itemCode, orderValue) {
    try {
      const response = await apiClient.get(`/api/inventory/shipping/calculate?itemCode=${itemCode}&orderValue=${orderValue}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get shipping data for a single inventory item
  async getItemShipping(itemId) {
    try {
      const response = await apiClient.get(`/api/inventory/${itemId}/shipping`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Promo Management
  async createPromo(promoData) {
    try {
      const response = await apiClient.post('/api/inventory/promo', promoData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getActivePromos(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.itemCode) queryParams.append('itemCode', params.itemCode)
      
      const response = await apiClient.get(`/api/inventory/promo/active?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get promo data for a single inventory item
  async getItemPromos(itemId, active = true) {
    try {
      const response = await apiClient.get(`/api/inventory/${itemId}/promo?active=${active}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async calculatePromoDiscount(promoId, orderValue) {
    try {
      const response = await apiClient.post('/api/inventory/promo/calculate', {
        promoId,
        orderValue
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Categories Management
  async getAllCategories() {
    try {
      const response = await apiClient.get('/api/inventory/categories')
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getSubcategories(category) {
    try {
      const response = await apiClient.get(`/api/inventory/categories/${category}/subcategories`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Vendors Management
  async getVendors(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.search) queryParams.append('search', params.search)
      
      const response = await apiClient.get(`/api/inventory/vendors?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default new InventoryService()
