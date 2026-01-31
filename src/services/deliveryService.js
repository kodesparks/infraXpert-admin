import apiClient from '@/lib/apiClient'

class DeliveryService {
  // Calculate delivery charges (POST /api/delivery/calculate)
  async calculateDelivery(deliveryData) {
    try {
      const response = await apiClient.post('/api/delivery/calculate', deliveryData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Delivery time estimate for pincode (GET /api/delivery/estimate-time/:pincode). Public.
  async getEstimateTime(pincode) {
    try {
      const response = await apiClient.get(`/api/delivery/estimate-time/${encodeURIComponent(pincode)}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get delivery options for a pincode
  async getDeliveryOptions(pincode, items) {
    try {
      const response = await apiClient.post('/api/delivery/options', {
        pincode,
        items
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get delivery time estimates
  async getDeliveryTimeEstimate(pincode, items) {
    try {
      const response = await apiClient.post('/api/delivery/time-estimate', {
        pincode,
        items
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Track delivery
  async trackDelivery(trackingNumber) {
    try {
      const response = await apiClient.get(`/api/delivery/track/${trackingNumber}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get delivery history
  async getDeliveryHistory(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.customerId) queryParams.append('customerId', params.customerId)
      if (params.vendorId) queryParams.append('vendorId', params.vendorId)
      if (params.status) queryParams.append('status', params.status)
      if (params.fromDate) queryParams.append('fromDate', params.fromDate)
      if (params.toDate) queryParams.append('toDate', params.toDate)
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      
      const response = await apiClient.get(`/api/delivery/history?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Update delivery status
  async updateDeliveryStatus(deliveryId, statusData) {
    try {
      const response = await apiClient.put(`/api/delivery/${deliveryId}/status`, statusData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get delivery statistics
  async getDeliveryStats(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.vendorId) queryParams.append('vendorId', params.vendorId)
      if (params.fromDate) queryParams.append('fromDate', params.fromDate)
      if (params.toDate) queryParams.append('toDate', params.toDate)
      
      const response = await apiClient.get(`/api/delivery/stats?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default new DeliveryService()
