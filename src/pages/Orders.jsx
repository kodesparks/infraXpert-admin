import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Loader2, RefreshCw } from 'lucide-react'
import OrderDetailsModal from '@/components/OrderDetailsModal'
import orderService from '@/services/orderService'

const Orders = () => {
  const [filters, setFilters] = useState({
    category: 'all',
    orderDate: '',
    status: 'all'
  })

  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  })

  // Fetch orders from API
  useEffect(() => {
    fetchOrders()
  }, [filters, pagination.currentPage])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const page = pagination.currentPage
      const limit = 20

      let response
      if (filters.orderDate) {
        // Use dedicated date-range endpoint with startDate/endDate (ISO)
        response = await orderService.getOrdersByDateRange({
          startDate: filters.orderDate,
          endDate: filters.orderDate,
          page,
          limit
        })
      } else {
        // List endpoint: status, vendorId, customerId, page, limit only (no date params)
        const params = { page, limit }
        if (filters.status && filters.status !== 'all') params.status = filters.status
        response = await orderService.getAllOrders(params)
      }

      if (response.orders) {
        setOrders(response.orders)
        if (response.pagination) {
          setPagination(response.pagination)
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError(err.response?.data?.message || 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleShowOrderDetails = async (order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false)
    setSelectedOrder(null)
  }

  const handleRefresh = () => {
    fetchOrders()
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'secondary', className: 'bg-gray-100 text-gray-800' },
      order_placed: { variant: 'secondary', className: 'bg-blue-100 text-blue-800' },
      vendor_accepted: { variant: 'secondary', className: 'bg-green-100 text-green-800' },
      payment_done: { variant: 'secondary', className: 'bg-purple-100 text-purple-800' },
      order_confirmed: { variant: 'secondary', className: 'bg-orange-100 text-orange-800' },
      truck_loading: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
      in_transit: { variant: 'secondary', className: 'bg-indigo-100 text-indigo-800' },
      shipped: { variant: 'secondary', className: 'bg-cyan-100 text-cyan-800' },
      out_for_delivery: { variant: 'secondary', className: 'bg-teal-100 text-teal-800' },
      delivered: { variant: 'secondary', className: 'bg-green-100 text-green-800' },
      cancelled: { variant: 'secondary', className: 'bg-red-100 text-red-800' }
    }
    
    const config = statusConfig[status] || { variant: 'secondary', className: 'bg-gray-100 text-gray-800' }
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {orderService.getStatusDisplayName(status)}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (paymentStatus) => {
    const paymentStatusConfig = {
      completed: { variant: 'secondary', className: 'bg-green-100 text-green-800' },
      pending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
      partial: { variant: 'secondary', className: 'bg-blue-100 text-blue-800' },
      failed: { variant: 'secondary', className: 'bg-red-100 text-red-800' }
    }
    
    const config = paymentStatusConfig[paymentStatus] || { variant: 'secondary', className: 'bg-gray-100 text-gray-800' }
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {paymentStatus ? paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1) : 'N/A'}
      </Badge>
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">Orders Management</CardTitle>
                <p className="text-gray-600 mt-1">
                  View and manage all orders {pagination.totalItems > 0 && `(${pagination.totalItems} total)`}
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleRefresh}
                  disabled={loading}
                  className="border-gray-300"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Link to="/orders/generate-lead">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Lead
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium text-gray-700">Status:</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">{orderService.getStatusDisplayName('pending')}</SelectItem>
                    <SelectItem value="order_placed">{orderService.getStatusDisplayName('order_placed')}</SelectItem>
                    <SelectItem value="vendor_accepted">{orderService.getStatusDisplayName('vendor_accepted')}</SelectItem>
                    <SelectItem value="payment_done">{orderService.getStatusDisplayName('payment_done')}</SelectItem>
                    <SelectItem value="order_confirmed">{orderService.getStatusDisplayName('order_confirmed')}</SelectItem>
                    <SelectItem value="truck_loading">{orderService.getStatusDisplayName('truck_loading')}</SelectItem>
                    <SelectItem value="in_transit">{orderService.getStatusDisplayName('in_transit')}</SelectItem>
                    <SelectItem value="shipped">{orderService.getStatusDisplayName('shipped')}</SelectItem>
                    <SelectItem value="out_for_delivery">{orderService.getStatusDisplayName('out_for_delivery')}</SelectItem>
                    <SelectItem value="delivered">{orderService.getStatusDisplayName('delivered')}</SelectItem>
                    <SelectItem value="cancelled">{orderService.getStatusDisplayName('cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium text-gray-700">Order Date:</Label>
                <Input
                  type="date"
                  value={filters.orderDate}
                  onChange={(e) => handleFilterChange('orderDate', e.target.value)}
                  className="w-40"
                />
              </div>
              
              {filters.orderDate && (
                <Button
                  variant="outline"
                  onClick={() => handleFilterChange('orderDate', '')}
                  className="text-sm"
                >
                  Clear Date
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading orders...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={handleRefresh} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lead ID
                        </TableHead>
                        {/* <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice
                        </TableHead> */}
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vendor
                        </TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Items
                        </TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Qty
                        </TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order Date
                        </TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </TableHead>
                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.leadId} className="hover:bg-gray-50">
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-blue-600 hover:text-blue-900 cursor-pointer" variant="ghost" 
                          onClick={() => handleShowOrderDetails(order)}>
                            {order.formattedLeadId || order.leadId}
                          </TableCell>
                          {/* <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {order.invcNum}
                          </TableCell> */}
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">{order.customer?.name || order.custUserId?.name}</div>
                              <div className="text-gray-500">{order.customer?.phone || order.custUserId?.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">{order.vendor?.name || order.vendorId?.name}</div>
                              <div className="text-gray-500">{order.vendor?.email || order.vendorId?.companyName}</div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {order.items?.length || 0} item(s)
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || order.totalQty || 0}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(order.createdAt || order.orderDate)}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(order.orderStatus)}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => handleShowOrderDetails(order)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {orders.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No orders found matching the current filters.</p>
                  </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total orders)
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrev}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNext}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={showOrderDetails}
        onClose={handleCloseOrderDetails}
        order={selectedOrder}
        onOrderUpdate={fetchOrders}
      />
    </div>
  )
}

export default Orders
