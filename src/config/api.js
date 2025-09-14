// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://api.infraxpert.in',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REFRESH: '/api/auth/refresh',
      LOGOUT: '/api/auth/logout'
    },
    ORDERS: {
      LIST: '/api/orders',
      CREATE: '/api/orders',
      UPDATE: '/api/orders',
      DELETE: '/api/orders'
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
