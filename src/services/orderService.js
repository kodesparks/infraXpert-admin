import apiClient from '@/lib/apiClient'

class OrderService {
  // ============================================
  // 1. VIEW ALL ORDERS
  // ============================================
  
  /**
   * Get all orders with filters and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise} Order list with pagination
   */
  async getAllOrders(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      // Add pagination
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      
      // Add filters
      if (params.status) queryParams.append('status', params.status)
      if (params.custUserId) queryParams.append('custUserId', params.custUserId)
      if (params.vendorId) queryParams.append('vendorId', params.vendorId)
      if (params.fromDate) queryParams.append('fromDate', params.fromDate)
      if (params.toDate) queryParams.append('toDate', params.toDate)
      
      const response = await apiClient.get(`/api/order/admin/orders?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get single order details by lead ID
   * @param {String} leadId - Order lead ID
   * @returns {Promise} Order details with status history, payment info, and delivery info
   */
  async getOrderById(leadId) {
    try {
      const response = await apiClient.get(`/api/order/admin/orders/${leadId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // ============================================
  // 2. PAYMENT MANAGEMENT
  // ============================================
  
  /**
   * Mark payment as done for an order (manual payment confirmation)
   * @param {String} leadId - Order lead ID
   * @param {Object} paymentData - Payment details
   * @returns {Promise} Updated order and payment info
   */
  async markPaymentDone(leadId, paymentData) {
    try {
      const response = await apiClient.post(`/api/order/admin/orders/${leadId}/payment`, paymentData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get payment details for specific order
   * @param {String} leadId - Order lead ID
   * @returns {Promise} Payment details
   */
  async getPaymentDetails(leadId) {
    try {
      const response = await apiClient.get(`/api/order/admin/payments/${leadId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get all payment records with filters
   * @param {Object} params - Query parameters
   * @returns {Promise} Payment list with pagination
   */
  async getAllPayments(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus)
      if (params.paymentMethod) queryParams.append('paymentMethod', params.paymentMethod)
      
      const response = await apiClient.get(`/api/order/admin/payments?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // ============================================
  // 3. ORDER CONFIRMATION
  // ============================================
  
  /**
   * Confirm order after payment is done
   * @param {String} leadId - Order lead ID
   * @param {Object} data - Confirmation data with remarks
   * @returns {Promise} Confirmed order
   */
  async confirmOrder(leadId, data = {}) {
    try {
      const response = await apiClient.post(`/api/order/admin/orders/${leadId}/confirm`, data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // ============================================
  // 4. ORDER STATUS MANAGEMENT
  // ============================================
  
  /**
   * Update order status manually (admin override)
   * @param {String} leadId - Order lead ID
   * @param {Object} statusData - Status update data
   * @returns {Promise} Updated order
   */
  async updateOrderStatus(leadId, statusData) {
    try {
      const response = await apiClient.put(`/api/order/admin/orders/${leadId}/status`, statusData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get complete status change history for an order
   * @param {String} leadId - Order lead ID
   * @returns {Promise} Status history
   */
  async getStatusHistory(leadId) {
    try {
      const response = await apiClient.get(`/api/order/admin/orders/${leadId}/status-history`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Cancel order (admin can cancel at any stage)
   * @param {String} leadId - Order lead ID
   * @param {Object} cancelData - Cancellation reason and remarks
   * @returns {Promise} Cancelled order
   */
  async cancelOrder(leadId, cancelData) {
    try {
      const response = await apiClient.post(`/api/order/admin/orders/${leadId}/cancel`, cancelData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // ============================================
  // 5. DELIVERY MANAGEMENT
  // ============================================
  
  /**
   * Update delivery tracking information
   * @param {String} leadId - Order lead ID
   * @param {Object} deliveryData - Delivery tracking data
   * @returns {Promise} Updated delivery info
   */
  async updateDelivery(leadId, deliveryData) {
    try {
      const response = await apiClient.put(`/api/order/admin/orders/${leadId}/delivery`, deliveryData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get delivery details for specific order
   * @param {String} leadId - Order lead ID
   * @returns {Promise} Delivery details
   */
  async getDeliveryDetails(leadId) {
    try {
      const response = await apiClient.get(`/api/order/admin/deliveries/${leadId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Mark order as delivered
   * @param {String} leadId - Order lead ID
   * @param {Object} deliveryData - Delivery confirmation data
   * @returns {Promise} Delivered order
   */
  async markAsDelivered(leadId, deliveryData) {
    try {
      const response = await apiClient.post(`/api/order/admin/orders/${leadId}/delivered`, deliveryData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // ============================================
  // 6. STATISTICS & ANALYTICS
  // ============================================
  
  /**
   * Get overall order statistics
   * @returns {Promise} Order statistics
   */
  async getOrderStats() {
    try {
      const response = await apiClient.get('/api/order/admin/stats/orders')
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get payment statistics
   * @returns {Promise} Payment statistics
   */
  async getPaymentStats() {
    try {
      const response = await apiClient.get('/api/order/admin/stats/payments')
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get delivery statistics
   * @returns {Promise} Delivery statistics
   */
  async getDeliveryStats() {
    try {
      const response = await apiClient.get('/api/order/admin/stats/deliveries')
      return response.data
    } catch (error) {
      throw error
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================
  
  /**
   * Get allowed order statuses
   * @returns {Array} List of allowed statuses
   */
  getAllowedStatuses() {
    return [
      'pending',
      'vendor_accepted',
      'payment_done',
      'order_confirmed',
      'truck_loading',
      'in_transit',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled'
    ]
  }

  /**
   * Get status display name
   * @param {String} status - Status key
   * @returns {String} Display name
   */
  getStatusDisplayName(status) {
    const statusMap = {
      'pending': 'Pending',
      'vendor_accepted': 'Vendor Accepted',
      'payment_done': 'Payment Done',
      'order_confirmed': 'Order Confirmed',
      'truck_loading': 'Truck Loading',
      'in_transit': 'In Transit',
      'shipped': 'Shipped',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    }
    return statusMap[status] || status
  }

  /**
   * Get payment methods
   * @returns {Array} List of payment methods
   */
  getPaymentMethods() {
    return [
      'bank_transfer',
      'upi',
      'cash',
      'cheque',
      'card'
    ]
  }
}

export default new OrderService()

