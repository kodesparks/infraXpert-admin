import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus } from 'lucide-react'
import OrderDetailsModal from '@/components/OrderDetailsModal'

const Orders = () => {
  const [filters, setFilters] = useState({
    category: 'all',
    orderDate: '',
    status: 'all'
  })

  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Sample data - in real app, this would come from API
  const orders = [
    {
      id: 'LD-001',
      invoice: 'INV-001234',
      subInvoice: 'SUB-001',
      brand: 'Ultratech',
      category: 'cement',
      subCategory: 'Portland Cement',
      grade: 'OPC 53',
      quantity: '500 bags',
      price: '₹25,000',
      status: 'delivered',
      paymentStatus: 'paid',
      customerName: 'ABC Construction',
      orderDate: '2024-01-15',
      deliveryDate: '2024-01-20'
    },
    {
      id: 'LD-002',
      invoice: 'INV-001235',
      subInvoice: 'SUB-002',
      brand: 'Tata Steel',
      category: 'steel',
      subCategory: 'TMT Bars',
      grade: 'Fe 500',
      quantity: '2 tons',
      price: '₹1,20,000',
      status: 'truck_load',
      paymentStatus: 'partial',
      customerName: 'XYZ Builders',
      orderDate: '2024-01-16',
      deliveryDate: '2024-01-22'
    },
    {
      id: 'LD-003',
      invoice: 'INV-001236',
      subInvoice: 'SUB-003',
      brand: 'Ambuja',
      category: 'cement',
      subCategory: 'Portland Cement',
      grade: 'OPC 43',
      quantity: '300 bags',
      price: '₹15,000',
      status: 'confirmed',
      paymentStatus: 'pending',
      customerName: 'DEF Infrastructure',
      orderDate: '2024-01-17',
      deliveryDate: '2024-01-25'
    },
    {
      id: 'LD-004',
      invoice: 'INV-001237',
      subInvoice: 'SUB-004',
      brand: 'JSW Steel',
      category: 'steel',
      subCategory: 'TMT Bars',
      grade: 'Fe 550',
      quantity: '1.5 tons',
      price: '₹90,000',
      status: 'delivered',
      paymentStatus: 'paid',
      customerName: 'GHI Developers',
      orderDate: '2024-01-18',
      deliveryDate: '2024-01-23'
    },
    {
      id: 'LD-005',
      invoice: 'INV-001238',
      subInvoice: 'SUB-005',
      brand: 'Shree Cement',
      category: 'cement',
      subCategory: 'Portland Cement',
      grade: 'OPC 53',
      quantity: '750 bags',
      price: '₹37,500',
      status: 'truck_load',
      paymentStatus: 'overdue',
      customerName: 'JKL Constructions',
      orderDate: '2024-01-19',
      deliveryDate: '2024-01-26'
    },
    {
      id: 'LD-006',
      invoice: 'INV-001239',
      subInvoice: 'SUB-006',
      brand: 'ACC Cement',
      category: 'cement',
      subCategory: 'Portland Cement',
      grade: 'OPC 43',
      quantity: '400 bags',
      price: '₹20,000',
      status: 'intransport',
      paymentStatus: 'pending',
      customerName: 'MNO Builders',
      orderDate: '2024-01-20',
      deliveryDate: '2024-01-27'
    },
    {
      id: 'LD-007',
      invoice: 'INV-001240',
      subInvoice: 'SUB-007',
      brand: 'Birla Cement',
      category: 'cement',
      subCategory: 'Portland Cement',
      grade: 'OPC 53',
      quantity: '600 bags',
      price: '₹30,000',
      status: 'confirmed',
      paymentStatus: 'paid',
      customerName: 'PQR Construction',
      orderDate: new Date().toISOString().split('T')[0], // Today's date
      deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3 days from now
    }
  ]

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleShowOrderDetails = (order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false)
    setSelectedOrder(null)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      delivered: { variant: 'secondary', className: 'bg-green-100 text-green-800' },
      truck_load: { variant: 'secondary', className: 'bg-blue-100 text-blue-800' },
      confirmed: { variant: 'secondary', className: 'bg-orange-100 text-orange-800' },
      intransport: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' }
    }
    
    const config = statusConfig[status] || { variant: 'secondary', className: 'bg-gray-100 text-gray-800' }
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (paymentStatus) => {
    const paymentStatusConfig = {
      paid: { variant: 'secondary', className: 'bg-green-100 text-green-800' },
      pending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
      partial: { variant: 'secondary', className: 'bg-blue-100 text-blue-800' },
      overdue: { variant: 'secondary', className: 'bg-red-100 text-red-800' }
    }
    
    const config = paymentStatusConfig[paymentStatus] || { variant: 'secondary', className: 'bg-gray-100 text-gray-800' }
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
      </Badge>
    )
  }

  const getCategoryBadge = (category) => {
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800 capitalize">
        {category}
      </Badge>
    )
  }

  const getBrandBadge = (brand) => {
    return (
      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
        {brand}
      </Badge>
    )
  }

  const getSubCategoryBadge = (subCategory) => {
    return (
      <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
        {subCategory}
      </Badge>
    )
  }

  const getGradeBadge = (grade) => {
    return (
      <Badge variant="secondary" className="bg-teal-100 text-teal-800">
        {grade}
      </Badge>
    )
  }

  // Filter orders based on current filters
  const filteredOrders = orders.filter(order => {
    if (filters.category !== 'all' && order.category !== filters.category) return false
    if (filters.status !== 'all' && order.status !== filters.status) return false
    if (filters.orderDate && order.orderDate !== filters.orderDate) return false
    return true
  })

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">Orders Management</CardTitle>
                <p className="text-gray-600 mt-1">View and manage all orders</p>
              </div>
              <Link to="/orders/generate-lead">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Lead
                </Button>
              </Link>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium text-gray-700">Category:</Label>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="cement">Cement</SelectItem>
                    <SelectItem value="steel">Steel</SelectItem>
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
              
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium text-gray-700">Status:</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="truck_load">Truck Load</SelectItem>
                    <SelectItem value="intransport">In Transport</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead ID
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sub Invoice
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brand
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sub Category
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Status
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.invoice}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.subInvoice}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        {getBrandBadge(order.brand)}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        {getCategoryBadge(order.category)}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        {getSubCategoryBadge(order.subCategory)}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        {getGradeBadge(order.grade)}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.quantity}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.price}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => handleShowOrderDetails(order)}
                        >
                          More Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No orders found matching the current filters.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={showOrderDetails}
        onClose={handleCloseOrderDetails}
        order={selectedOrder}
      />
    </div>
  )
}

export default Orders
