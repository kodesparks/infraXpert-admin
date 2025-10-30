import apiClient from '@/lib/apiClient'

class OrderService {
  // ============================================
  // CUSTOMER ORDER APIs
  // ============================================
  
  // Add item to cart (creates new order)
  async addToCart(cartData) {
    try {
      const response = await apiClient.post('/api/order/cart/add', cartData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get customer orders
  async getCustomerOrders(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.status) queryParams.append('status', params.status)
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      
      const response = await apiClient.get(`/api/order/customer/orders?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get customer order details
  async getCustomerOrderDetails(leadId) {
    try {
      const response = await apiClient.get(`/api/order/customer/orders/${leadId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Update customer order
  async updateCustomerOrder(leadId, orderData) {
    try {
      const response = await apiClient.put(`/api/order/customer/orders/${leadId}`, orderData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Remove item from cart
  async removeItemFromCart(leadId, itemCode) {
    try {
      const response = await apiClient.delete(`/api/order/customer/orders/${leadId}/items`, {
        data: { itemCode }
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Remove entire order from cart
  async removeOrderFromCart(leadId) {
    try {
      const response = await apiClient.delete(`/api/order/customer/orders/${leadId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Place order (move from cart to placed)
  async placeOrder(leadId, orderData) {
    try {
      const response = await apiClient.post(`/api/order/customer/orders/${leadId}/place`, orderData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get order tracking
  async getOrderTracking(leadId) {
    try {
      const response = await apiClient.get(`/api/order/customer/orders/${leadId}/tracking`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // ============================================
  // VENDOR ORDER APIs
  // ============================================
  
  // Get vendor orders
  async getVendorOrders(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.status) queryParams.append('status', params.status)
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      
      const response = await apiClient.get(`/api/order/vendor/orders?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get vendor order details
  async getVendorOrderDetails(leadId) {
    try {
      const response = await apiClient.get(`/api/order/vendor/orders/${leadId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Accept order
  async acceptOrder(leadId) {
    try {
      const response = await apiClient.post(`/api/order/vendor/orders/${leadId}/accept`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Reject order
  async rejectOrder(leadId, reason) {
    try {
      const response = await apiClient.post(`/api/order/vendor/orders/${leadId}/reject`, { reason })
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Update vendor order status
  async updateVendorOrderStatus(leadId, statusData) {
    try {
      const response = await apiClient.put(`/api/order/vendor/orders/${leadId}/status`, statusData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Update delivery tracking
  async updateDeliveryTracking(leadId, trackingData) {
    try {
      const response = await apiClient.put(`/api/order/vendor/orders/${leadId}/tracking`, trackingData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get vendor order stats
  async getVendorOrderStats() {
    try {
      const response = await apiClient.get('/api/order/vendor/stats')
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get pending orders for vendor
  async getPendingOrders() {
    try {
      const response = await apiClient.get('/api/order/vendor/orders/pending')
      return response.data
    } catch (error) {
      throw error
    }
  }

  // ============================================
  // ADMIN ORDER APIs
  // ============================================
  
  // Get all orders (admin)
  async getAllOrders(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.status) queryParams.append('status', params.status)
      if (params.vendorId) queryParams.append('vendorId', params.vendorId)
      if (params.customerId) queryParams.append('customerId', params.customerId)
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      
      const response = await apiClient.get(`/api/order/admin/orders?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get admin order details
  async getAdminOrderDetails(leadId) {
    try {
      const response = await apiClient.get(`/api/order/admin/orders/${leadId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Confirm payment (admin)
  async confirmPayment(leadId, paymentData) {
    try {
      const response = await apiClient.post(`/api/order/admin/orders/${leadId}/payment/confirm`, paymentData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Update admin order status
  async updateAdminOrderStatus(leadId, statusData) {
    try {
      const response = await apiClient.put(`/api/order/admin/orders/${leadId}/status`, statusData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get admin order stats
  async getAdminOrderStats() {
    try {
      const response = await apiClient.get('/api/order/admin/stats')
      return response.data
    } catch (error) {
      throw error
    }
  }

  // ============================================
  // LEGACY ADMIN APIs (for backward compatibility)
  // ============================================
  
  // Get single order details by lead ID (legacy)
  async getOrderById(leadId) {
    return this.getAdminOrderDetails(leadId)
  }

  // Mark payment done (legacy)
  async markPaymentDone(leadId, paymentData) {
    try {
      const response = await apiClient.post(`/api/order/admin/orders/${leadId}/payment`, paymentData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Confirm order (legacy)
  async confirmOrder(leadId) {
    try {
      const response = await apiClient.post(`/api/order/admin/orders/${leadId}/confirm`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Update order status (legacy)
  async updateOrderStatus(leadId, statusData) {
    return this.updateAdminOrderStatus(leadId, statusData)
  }

  // Cancel order (legacy)
  async cancelOrder(leadId, reason) {
    try {
      const response = await apiClient.post(`/api/order/admin/orders/${leadId}/cancel`, { reason })
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Update delivery (legacy)
  async updateDelivery(leadId, deliveryData) {
    try {
      const response = await apiClient.put(`/api/order/admin/orders/${leadId}/delivery`, deliveryData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Mark delivered (legacy)
  async markDelivered(leadId) {
    try {
      const response = await apiClient.post(`/api/order/admin/orders/${leadId}/delivered`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get status history (legacy)
  async getStatusHistory(leadId) {
    try {
      const response = await apiClient.get(`/api/order/admin/orders/${leadId}/status-history`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get payment details (legacy)
  async getPaymentDetails(leadId) {
    try {
      const response = await apiClient.get(`/api/order/admin/payments/${leadId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get all payments (legacy)
  async getAllPayments(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.status) queryParams.append('status', params.status)
      
      const response = await apiClient.get(`/api/order/admin/payments?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get delivery details (legacy)
  async getDeliveryDetails(leadId) {
    try {
      const response = await apiClient.get(`/api/order/admin/deliveries/${leadId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get payment stats (legacy)
  async getPaymentStats() {
    try {
      const response = await apiClient.get('/api/order/admin/stats/payments')
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get delivery stats (legacy)
  async getDeliveryStats() {
    try {
      const response = await apiClient.get('/api/order/admin/stats/deliveries')
      return response.data
    } catch (error) {
      throw error
    }
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  
  // Get status display name
  getStatusDisplayName(status) {
    const statusMap = {
      'cart': 'In Cart',
      'pending': 'Pending',
      'order_placed': 'Order Placed',
      'vendor_accepted': 'Vendor Accepted',
      'payment_done': 'Payment Done',
      'order_confirmed': 'Order Confirmed',
      'truck_loading': 'Truck Loading',
      'in_transit': 'In Transit',
      'shipped': 'Shipped',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'rejected': 'Rejected'
    }
    return statusMap[status] || status
  }

  // Get allowed statuses for admin
  getAllowedStatuses(currentStatus) {
    // For admin, allow most status transitions (more flexible than customer flow)
    const allStatuses = [
      'pending',
      'order_placed', 
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
    
    // Don't allow changing from delivered or cancelled
    if (currentStatus === 'delivered' || currentStatus === 'cancelled') {
      return []
    }
    
    // For all other statuses, allow changing to any status except the current one
    return allStatuses.filter(status => status !== currentStatus)
  }
}

export default new OrderService()