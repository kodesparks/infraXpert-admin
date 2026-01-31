// API Configuration - COMPLETE API ENDPOINTS
export const API_CONFIG = {
  BASE_URL: 'https://api.infraxpert.in',
  // BASE_URL: 'http://localhost:5000',
  ENDPOINTS: {
    // Authentication APIs
    AUTH: {
      LOGIN: '/api/auth/login',
      REFRESH: '/api/auth/refresh',
      LOGOUT: '/api/auth/logout'
    },

    // Admin dashboard & user management (base: /api/admin)
    ADMIN: {
      DASHBOARD: '/api/admin/dashboard',
      INVENTORY: '/api/admin/inventory',
      BANK_PAYMENTS: '/api/admin/bank-payments',
      VENDOR_DETAILS: '/api/admin/vendor-details',
      USER_MANAGEMENT: '/api/admin/user-management',
      STATS: '/api/admin/stats',
      UPDATE_USER_ROLE: '/api/admin/users/:userId/role',
      UPDATE_USER_STATUS: '/api/admin/users/:userId/status'
    },

    // User Management APIs
    USERS: {
      LIST: '/api/users',
      CREATE: '/api/users',
      GET_BY_ID: '/api/users/:id',
      UPDATE: '/api/users/:id',
      DELETE: '/api/users/:id',
      GET_ROLES: '/api/users/roles',
      GET_ROLE_CONFIG: '/api/users/roles/:role'
    },

    // Warehouse Management APIs (base: /api/warehouse)
    WAREHOUSE: {
      CREATE: '/api/warehouse/create',
      DELETE: '/api/warehouse/:vendorId',
      SEARCH: '/api/warehouse/search',
      LIST: '/api/warehouse/list',
      AVAILABLE: '/api/warehouse/available',
      GET_BY_VENDOR: '/api/warehouse/vendor/:vendorId',
      UPDATE_VENDOR: '/api/warehouse/vendor/:vendorId',
      SYNC_INVENTORY: '/api/warehouse/sync-inventory',
      CLEANUP_ORPHANED: '/api/warehouse/cleanup-orphaned'
    },

    // Inventory Management APIs (base: /api/inventory)
    INVENTORY: {
      LIST: '/api/inventory',
      CREATE: '/api/inventory',
      GET_BY_ID: '/api/inventory/:id',
      UPDATE: '/api/inventory/:id',
      DELETE: '/api/inventory/:id',
      PRICING: '/api/inventory/pricing',
      SINGLE_ITEM_PRICING: '/api/inventory/pricing/:itemId',
      UPDATE_PRICING: '/api/inventory/price',
      UPDATE_ITEM_PRICING: '/api/inventory/:id/pricing',
      CATEGORIES: '/api/inventory/categories',
      SUB_CATEGORIES: '/api/inventory/categories/:category/subcategories',
      VENDORS: '/api/inventory/vendors',
      STATS: '/api/inventory/stats/overview',
      // Zoho Books mapping (Admin/Manager)
      ZOHO_UNMAPPED: '/api/inventory/zoho/unmapped',
      ZOHO_MAP: '/api/inventory/:id/zoho/map',
      // Image Management
      ADD_IMAGES: '/api/inventory/:id/images',
      REMOVE_IMAGE: '/api/inventory/:id/images/:imageKey',
      SET_PRIMARY_IMAGE: '/api/inventory/:id/images/:imageKey/primary',
      GET_IMAGES: '/api/inventory/:id/images'
    },

    // Promo Management APIs
    PROMO: {
      CREATE: '/api/inventory/promo',
      GET_ACTIVE: '/api/inventory/promo/active',
      GET_ITEM_PROMOS: '/api/inventory/:itemId/promo',
      CALCULATE: '/api/inventory/promo/calculate'
    },

    // Order Management APIs
    ORDERS: {
      // Customer APIs
      CUSTOMER: {
        ADD_TO_CART: '/api/order/cart/add',
        GET_ORDERS: '/api/order/customer/orders',
        GET_ORDER_DETAILS: '/api/order/customer/orders/:leadId',
        UPDATE_ORDER: '/api/order/customer/orders/:leadId',
        REMOVE_ITEM: '/api/order/customer/orders/:leadId/items',
        REMOVE_ORDER: '/api/order/customer/orders/:leadId',
        PLACE_ORDER: '/api/order/customer/orders/:leadId/place',
        GET_TRACKING: '/api/order/customer/orders/:leadId/tracking'
      },
      
      // Vendor APIs
      VENDOR: {
        GET_ORDERS: '/api/order/vendor/orders',
        GET_ORDER_DETAILS: '/api/order/vendor/orders/:leadId',
        ACCEPT_ORDER: '/api/order/vendor/orders/:leadId/accept',
        REJECT_ORDER: '/api/order/vendor/orders/:leadId/reject',
        UPDATE_STATUS: '/api/order/vendor/orders/:leadId/status',
        UPDATE_TRACKING: '/api/order/vendor/orders/:leadId/tracking',
        GET_STATS: '/api/order/vendor/stats',
        GET_PENDING: '/api/order/vendor/orders/pending'
      },
      
      // Admin APIs
      ADMIN: {
        GET_ALL_ORDERS: '/api/order/admin/orders',
        GET_ORDER_DETAILS: '/api/order/admin/orders/:leadId',
        CONFIRM_PAYMENT: '/api/order/admin/orders/:leadId/payment/confirm',
        UPDATE_STATUS: '/api/order/admin/orders/:leadId/status',
        GET_STATS: '/api/order/admin/orders/stats',
        GET_ORDERS_DATE_RANGE: '/api/order/admin/orders/date-range',
        // Legacy admin APIs (keeping for backward compatibility)
        MARK_PAYMENT: '/api/order/admin/orders/:leadId/payment',
        PAYMENT_DETAILS: '/api/order/admin/payments/:leadId',
        ALL_PAYMENTS: '/api/order/admin/payments',
        CONFIRM: '/api/order/admin/orders/:leadId/confirm',
        STATUS_HISTORY: '/api/order/admin/orders/:leadId/status-history',
        CANCEL: '/api/order/admin/orders/:leadId/cancel',
        UPDATE_DELIVERY: '/api/order/admin/orders/:leadId/delivery',
        DELIVERY_DETAILS: '/api/order/admin/deliveries/:leadId',
        MARK_DELIVERED: '/api/order/admin/orders/:leadId/delivered',
        STATS_PAYMENTS: '/api/order/admin/payments/stats',
        STATS_DELIVERIES: '/api/order/admin/deliveries/stats',
        // PDF downloads (backend fetches from Zoho and returns file)
        PDF_PO: '/api/order/admin/orders/:leadId/pdf/po',
        PDF_QUOTE: '/api/order/admin/orders/:leadId/pdf/quote',
        PDF_SO: '/api/order/admin/orders/:leadId/pdf/so',
        PDF_INVOICE: '/api/order/admin/orders/:leadId/pdf/invoice'
      }
    },

    // Location APIs
    LOCATION: {
      VALIDATE_PINCODE: '/api/location/validate-pincode'
    },

    // Delivery APIs (base: /api/delivery, public)
    DELIVERY: {
      CALCULATE: '/api/delivery/calculate',
      ESTIMATE_TIME: '/api/delivery/estimate-time/:pincode'
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
