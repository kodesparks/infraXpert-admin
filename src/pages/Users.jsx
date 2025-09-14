import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Filter, RefreshCw } from 'lucide-react'
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
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    isActive: 'all',
    page: 1,
    limit: 10
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

  const loadUsers = async () => {
    try {
      setLoading(true)
      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.role !== 'all' && { role: filters.role }),
        ...(filters.isActive !== 'all' && { isActive: filters.isActive === 'active' }),
        ...(filters.search && { search: filters.search })
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
            <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
          </div>
          {canCreateUser && (
            <Button onClick={handleCreateUser} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create User
            </Button>
          )}
        </div>

        {/* Stats */}
        <UserStats stats={stats} />

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
              
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

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Users ({pagination.totalUsers})</CardTitle>
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleFilterChange('page', filters.page - 1)}
              disabled={!pagination.hasPrev || loading}
            >
              Previous
            </Button>
            
            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              onClick={() => handleFilterChange('page', filters.page + 1)}
              disabled={!pagination.hasNext || loading}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitUser}
        user={editingUser}
        isEditMode={!!editingUser}
      />
    </div>
  )
}

export default Users
