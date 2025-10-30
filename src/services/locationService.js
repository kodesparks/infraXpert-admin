import apiClient from '@/lib/apiClient'

class LocationService {
  // Validate pincode and get coordinates
  async validatePincode(pincode) {
    try {
      const response = await apiClient.post('/api/location/validate-pincode', { pincode })
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get location details by pincode
  async getLocationByPincode(pincode) {
    try {
      const response = await apiClient.get(`/api/location/pincode/${pincode}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get nearby warehouses by pincode
  async getNearbyWarehouses(pincode, radius = 50) {
    try {
      const response = await apiClient.get(`/api/location/warehouses?pincode=${pincode}&radius=${radius}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Calculate distance between two coordinates
  async calculateDistance(fromCoords, toCoords) {
    try {
      const response = await apiClient.post('/api/location/distance', {
        from: fromCoords,
        to: toCoords
      })
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default new LocationService()
