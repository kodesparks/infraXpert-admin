import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Filter, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import inventoryService from '@/services/inventoryService'
import InventoryModal from '@/components/inventory/InventoryModal'
import InventoryTable from '@/components/inventory/InventoryTable'
import InventoryStats from '@/components/inventory/InventoryStats'
import ImageManagementModal from '@/components/inventory/ImageManagementModal'

const Inventory = () => {
  const { user: currentUser, hasPermission } = useAuth()
  
  // State management
  const [items, setItems] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [imageItem, setImageItem] = useState(null)
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    subCategory: 'all',
    vendorId: 'all',
    isActive: 'all',
    page: 1,
    limit: 20
  })
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  })

  // Load items and stats
  useEffect(() => {
    loadItems()
    loadStats()
  }, [filters])

  const loadItems = async () => {
    try {
      setLoading(true)
      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.subCategory !== 'all' && { subCategory: filters.subCategory }),
        ...(filters.vendorId !== 'all' && { vendorId: filters.vendorId }),
        ...(filters.isActive !== 'all' && { isActive: filters.isActive === 'active' }),
        ...(filters.search && { search: filters.search })
      }
      
      const response = await inventoryService.getInventoryItems(params)
      setItems(response.inventory)
      setPagination(response.pagination)
    } catch (error) {
      console.error('Error loading inventory items:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await inventoryService.getOverviewStats()
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

  const handleCreateItem = () => {
    setEditingItem(null)
    setShowModal(true)
  }

  const handleEditItem = (item) => {
    setEditingItem(item)
    setShowModal(true)
  }

  const handleSubmitItem = async () => {
    loadItems()
    loadStats()
  }

  const handleDeleteItem = async (itemId) => {
    try {
      await inventoryService.deleteInventoryItem(itemId)
      loadItems()
      loadStats()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const handleReactivateItem = async (itemId) => {
    try {
      await inventoryService.reactivateInventoryItem(itemId)
      loadItems()
      loadStats()
    } catch (error) {
      console.error('Error reactivating item:', error)
    }
  }

  const handleManageImages = (item) => {
    setImageItem(item)
    setShowImageModal(true)
  }

  const canManageInventory = hasPermission('inventory_page') || currentUser?.role === 'admin'

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-1">Manage your construction materials efficiently</p>
          </div>
          {canManageInventory && (
            <Button onClick={handleCreateItem} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Item
            </Button>
          )}
        </div>

        {/* Stats */}
        <InventoryStats stats={stats} />

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Cement">Cement</SelectItem>
                  <SelectItem value="Iron">Iron</SelectItem>
                  <SelectItem value="Concrete Mixer">Concrete Mixer</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filters.subCategory} onValueChange={(value) => handleFilterChange('subCategory', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sub Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sub Categories</SelectItem>
                  <SelectItem value="PPC">PPC</SelectItem>
                  <SelectItem value="OPC">OPC</SelectItem>
                  <SelectItem value="PSC">PSC</SelectItem>
                  <SelectItem value="TMT Bars">TMT Bars</SelectItem>
                  <SelectItem value="Mild Steel">Mild Steel</SelectItem>
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
                onClick={loadItems}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Inventory Items ({pagination.totalItems})</CardTitle>
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
              <InventoryTable
                items={items}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onReactivate={handleReactivateItem}
                onManageImages={handleManageImages}
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

      {/* Inventory Modal */}
      <InventoryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitItem}
        item={editingItem}
        isEditMode={!!editingItem}
      />

      {/* Image Management Modal */}
      <ImageManagementModal
        isOpen={showImageModal}
        onClose={() => {
          setShowImageModal(false)
          setImageItem(null)
        }}
        item={imageItem}
      />
    </div>
  )
}

export default Inventory