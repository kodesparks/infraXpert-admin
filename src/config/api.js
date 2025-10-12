// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://api.infraxpert.in',
  // BASE_URL: 'http://localhost:5000',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REFRESH: '/api/auth/refresh',
      LOGOUT: '/api/auth/logout'
    },
    ORDERS: {
      // Admin Order Management
      LIST: '/api/order/admin/orders',
      DETAIL: '/api/order/admin/orders/:leadId',
      
      // Payment Management
      MARK_PAYMENT: '/api/order/admin/orders/:leadId/payment',
      PAYMENT_DETAILS: '/api/order/admin/payments/:leadId',
      ALL_PAYMENTS: '/api/order/admin/payments',
      
      // Order Confirmation
      CONFIRM: '/api/order/admin/orders/:leadId/confirm',
      
      // Status Management
      UPDATE_STATUS: '/api/order/admin/orders/:leadId/status',
      STATUS_HISTORY: '/api/order/admin/orders/:leadId/status-history',
      CANCEL: '/api/order/admin/orders/:leadId/cancel',
      
      // Delivery Management
      UPDATE_DELIVERY: '/api/order/admin/orders/:leadId/delivery',
      DELIVERY_DETAILS: '/api/order/admin/deliveries/:leadId',
      MARK_DELIVERED: '/api/order/admin/orders/:leadId/delivered',
      
      // Statistics
      STATS_ORDERS: '/api/order/admin/stats/orders',
      STATS_PAYMENTS: '/api/order/admin/stats/payments',
      STATS_DELIVERIES: '/api/order/admin/stats/deliveries'
    },
    INVENTORY: {
      LIST: '/api/inventory',
      CREATE: '/api/inventory',
      UPDATE: '/api/inventory',
      DELETE: '/api/inventory'
    },
    USERS: {
      LIST: '/api/users',
      CREATE: '/api/users',
      UPDATE: '/api/users',
      DELETE: '/api/users'
    }
  },
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3
}

// Request/Response interceptors configuration
export const INTERCEPTOR_CONFIG = {
  REQUEST: {
    ADD_AUTH_HEADER: true,
    ADD_TIMESTAMP: true,
    LOG_REQUESTS: process.env.NODE_ENV === 'development'
  },
  RESPONSE: {
    HANDLE_ERRORS: true,
    LOG_RESPONSES: process.env.NODE_ENV === 'development',
    RETRY_ON_FAILURE: true
  }
}
