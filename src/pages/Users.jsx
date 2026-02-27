import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search, Filter, RefreshCw, Users as UsersIcon, Building2, UserCheck, MapPin } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import userService from '@/services/userService'
import UserModal from '@/components/user/UserModal'
import UserTable from '@/components/user/UserTable'
import UserStats from '@/components/user/UserStats'

const Users = () => {
  const { user: currentUser, hasPermission } = useAuth()
  
  // State management
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [viewingUser, setViewingUser] = useState(null)
  const [activeTab, setActiveTab] = useState('employee') // employee | vendor | customer
  const [defaultRoleForModal, setDefaultRoleForModal] = useState('employee')
  const [modalRole, setModalRole] = useState('employee')
  const [showVendorEmployeeModal, setShowVendorEmployeeModal] = useState(false)
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    search: '',
    role: 'employee',
    isActive: 'all',
    page: 1,
    limit: 10,
    pincode: ''
  })
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false
  })

  // Load users and stats
  useEffect(() => {
    loadUsers()
    loadStats()
  }, [filters])

  // Switch role filter when tab changes
  useEffect(() => {
    const tabToRole = {
      employee: 'employee',
      vendor: 'vendor',
      customer: 'customer'
    }
    setFilters(prev => ({ ...prev, role: tabToRole[activeTab], page: 1 }))
    setDefaultRoleForModal(tabToRole[activeTab])
  }, [activeTab])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.role !== 'all' && { role: filters.role }),
        ...(filters.isActive !== 'all' && { isActive: filters.isActive === 'active' }),
        ...(filters.search && { search: filters.search }),
        ...(filters.role === 'vendor' && filters.pincode && { pincode: filters.pincode })
      }
      
      const response = await userService.getUsers(params)
      setUsers(response.users)
      setPagination(response.pagination)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await userService.getSystemStats()
      setStats(response.stats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handlePageChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      // page: 1 // Reset to first page when filters change
    }))
  }
  const handleCreateUser = () => {
    setEditingUser(null)
    setShowModal(true)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setShowModal(true)
  }

  const handleViewUser = (user) => {
    setViewingUser(user)
    // You can implement a view-only modal here
    console.log('View user:', user)
  }

  const handleSubmitUser = async (userData) => {
    console.log(userData);
    try {
      if (editingUser) {
        await userService.updateUser(editingUser._id, userData)
      } else {
        await userService.createUser(userData)
      }
      loadUsers()
      loadStats()
    } catch (error) {
      throw error
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      await userService.deleteUser(userId)
      loadUsers()
      loadStats()
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleStatusChange = async (userId, isActive) => {
    try {
      await userService.changeUserStatus(userId, isActive)
      loadUsers()
      loadStats()
    } catch (error) {
      console.error('Error changing user status:', error)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.changeUserRole(userId, newRole)
      loadUsers()
      loadStats()
    } catch (error) {
      console.error('Error changing user role:', error)
    }
  }

  const canCreateUser = hasPermission('role_user_creation') || currentUser?.role === 'admin'

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage employees, vendors, customers and their details</p>
          </div>
        </div>

        {/* Stats */}
        <UserStats stats={stats} />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="employee" className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4" />
              Employee Onboard & View
            </TabsTrigger>
            <TabsTrigger value="vendor" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Vendor Onboarding & Pincode
            </TabsTrigger>
            <TabsTrigger value="customer" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Customer Onboard & Details
            </TabsTrigger>
          </TabsList>

          {/* Employee Tab */}
          <TabsContent value="employee" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Employee Management</h2>
                <p className="text-gray-600">Onboard and manage company employees</p>
              </div>
              {canCreateUser && (
                <Button 
                  onClick={() => {
                    setModalRole('employee')
                    setEditingUser(null)
                    setShowModal(true)
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Onboard Employee
                </Button>
              )}
            </div>

            {/* Filters for Employee */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Employee Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search employees..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={filters.isActive} onValueChange={(value) => handleFilterChange('isActive', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    onClick={loadUsers}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Employee Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Employees ({pagination.totalUsers})</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <UserTable
                    users={users}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                    onView={handleViewUser}
                    onStatusChange={handleStatusChange}
                    onRoleChange={handleRoleChange}
                    currentUserRole={currentUser?.role}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vendor Tab */}
          <TabsContent value="vendor" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Vendor Management</h2>
                <p className="text-gray-600">Onboard vendors with pincode coverage and manage vendor employees</p>
              </div>
              <div className="flex items-center gap-2">
                {canCreateUser && (
                  <>
                    <Button 
                      onClick={() => {
                        setModalRole('vendor')
                        setEditingUser(null)
                        setShowModal(true)
                      }}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Onboard Vendor
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        setModalRole('employee')
                        setEditingUser(null)
                        setShowModal(true)
                      }}
                      className="flex items-center gap-2"
                    >
                      <UserCheck className="h-4 w-4" />
                      Onboard Vendor Employee
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Vendor-specific features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Pincode Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Manage vendor service areas by pincode</p>
                  <div className="space-y-2">
                    <Input
                      placeholder="Add pincode (e.g., 400001)"
                      className="mb-2"
                    />
                    <Button size="sm" className="w-full">Add Pincode Coverage</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Vendor Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {stats?.vendors || 0}
                      </div>
                      <div className="text-sm text-gray-600">Total Vendors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {stats?.vendorEmployees || 0}
                      </div>
                      <div className="text-sm text-gray-600">Vendor Employees</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters for Vendor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Vendor Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search vendors..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Filter by Pincode"
                      value={filters.pincode}
                      onChange={(e) => handleFilterChange('pincode', e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={filters.isActive} onValueChange={(value) => handleFilterChange('isActive', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    onClick={loadUsers}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Vendor Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Vendors ({pagination.totalUsers})</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <UserTable
                    users={users}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                    onView={handleViewUser}
                    onStatusChange={handleStatusChange}
                    onRoleChange={handleRoleChange}
                    currentUserRole={currentUser?.role}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customer Tab */}
          <TabsContent value="customer" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Customer Management</h2>
                <p className="text-gray-600">Onboard customers and view their detailed information</p>
              </div>
              {canCreateUser && (
                <Button 
                  onClick={() => {
                    setModalRole('customer')
                    setEditingUser(null)
                    setShowModal(true)
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Onboard Customer
                </Button>
              )}
            </div>

            {/* Customer-specific features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Customer Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {stats?.customers || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Customers</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UsersIcon className="h-5 w-5" />
                    Active Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {stats?.activeCustomers || 0}
                    </div>
                    <div className="text-sm text-gray-600">Active Customers</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    New This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {stats?.newCustomersThisMonth || 0}
                    </div>
                    <div className="text-sm text-gray-600">New This Month</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters for Customer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Customer Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search customers..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={filters.isActive} onValueChange={(value) => handleFilterChange('isActive', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    onClick={loadUsers}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Customer Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Customers ({pagination.totalUsers})</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <UserTable
                    users={users}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                    onView={handleViewUser}
                    onStatusChange={handleStatusChange}
                    onRoleChange={handleRoleChange}
                    currentUserRole={currentUser?.role}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Pagination - Show for all tabs */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange('page', filters.page - 1)}
              disabled={!pagination.hasPrev || loading}
            >
              Previous
            </Button>
            
            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              onClick={() => handlePageChange('page', filters.page + 1)}
              disabled={!pagination.hasNext || loading}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* User Modal */}
      <UserModal
        key={`${modalRole}-${showModal}`}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitUser}
        user={editingUser}
        isEditMode={!!editingUser}
        defaultRole={!editingUser ? modalRole : undefined}
      />
    </div>
  )
}

export default Users
