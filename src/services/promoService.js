import apiClient from '@/lib/apiClient'

class PromoService {
  // Create promotional offer
  async createPromo(promoData) {
    try {
      const response = await apiClient.post('/api/inventory/promo', promoData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get active promotional offers
  async getActivePromos(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.active !== undefined) queryParams.append('active', params.active)
      if (params.category) queryParams.append('category', params.category)
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      
      const response = await apiClient.get(`/api/inventory/promo?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get promotional offers for specific item
  async getItemPromos(itemId, params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.active !== undefined) queryParams.append('active', params.active)
      
      const response = await apiClient.get(`/api/inventory/${itemId}/promo?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Calculate promo discount
  async calculatePromoDiscount(promoData) {
    try {
      const response = await apiClient.post('/api/inventory/promo/calculate', promoData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Update promo
  async updatePromo(promoId, promoData) {
    try {
      const response = await apiClient.put(`/api/inventory/promo/${promoId}`, promoData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Delete promo
  async deletePromo(promoId) {
    try {
      const response = await apiClient.delete(`/api/inventory/promo/${promoId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get promo by ID
  async getPromo(promoId) {
    try {
      const response = await apiClient.get(`/api/inventory/promo/${promoId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default new PromoService()
