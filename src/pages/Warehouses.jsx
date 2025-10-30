import { useState, useEffect } from 'react'
import { Building, Plus, Edit, MapPin, Clock, Truck, CheckCircle, XCircle, Trash2, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import warehouseService from '@/services/warehouseService'
import WarehouseUpdateModal from '@/components/warehouse/WarehouseUpdateModal'
import WarehouseCreateModal from '@/components/warehouse/WarehouseCreateModal'

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [syncing, setSyncing] = useState(false)

  // Load warehouses
  const loadWarehouses = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Use the new warehouse list API
      const response = await warehouseService.listWarehouses({
        page: 1,
        limit: 100, // Load more warehouses for the page
        sortBy: 'warehouseName',
        sortOrder: 'asc'
      })
      
      setWarehouses(response.data?.warehouses || [])
    } catch (err) {
      console.error('Error loading warehouses:', err)
      setError('Failed to load warehouses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWarehouses()
  }, [])

  const handleSyncInventory = async () => {
    try {
      setSyncing(true)
      const res = await warehouseService.syncInventory()
      alert(res?.message || 'Inventory sync started')
    } catch (err) {
      console.error('Error syncing inventory:', err)
      alert(err.response?.data?.message || 'Failed to start inventory sync')
    } finally {
      setSyncing(false)
    }
  }

  const handleUpdateWarehouse = (warehouse) => {
    setSelectedWarehouse(warehouse)
    setShowUpdateModal(true)
  }

  const handleUpdateSuccess = async () => {
    await loadWarehouses()
    setShowUpdateModal(false)
    setSelectedWarehouse(null)
  }

  const handleCreateSuccess = async () => {
    await loadWarehouses()
    setShowCreateModal(false)
  }

  const handleDeleteWarehouse = async (warehouse) => {
    if (window.confirm(`Are you sure you want to delete the warehouse "${warehouse.warehouse?.warehouseName}"? This action cannot be undone.`)) {
      try {
        await warehouseService.deleteWarehouse(warehouse.vendorId)
        await loadWarehouses()
      } catch (err) {
        console.error('Error deleting warehouse:', err)
        setError('Failed to delete warehouse')
      }
    }
  }

  const filteredWarehouses = warehouses.filter(warehouse => {
    if (!warehouse || !warehouse.warehouse) return false
    
    const searchLower = searchTerm.toLowerCase()
    return (
      (warehouse.warehouse.warehouseName || '').toLowerCase().includes(searchLower) ||
      (warehouse.name || '').toLowerCase().includes(searchLower) ||
      (warehouse.warehouse.location?.city || '').toLowerCase().includes(searchLower) ||
      (warehouse.warehouse.location?.state || '').toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading warehouses...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building className="h-8 w-8" />
              Warehouse Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage all warehouse locations and their configurations
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search warehouses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10"
              />
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-black hover:bg-gray-800 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Warehouse
            </Button>
            <Button
              onClick={handleSyncInventory}
              variant="outline"
              disabled={syncing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Inventory'}
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Warehouse Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Warehouses</p>
                <p className="text-2xl font-bold text-gray-900">{warehouses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">
                  {warehouses.filter(w => w?.warehouse?.isVerified).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending Verification</p>
                <p className="text-2xl font-bold text-gray-900">
                  {warehouses.filter(w => !w?.warehouse?.isVerified).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Cities</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(warehouses.map(w => w?.warehouse?.location?.city).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warehouses Grid */}
      {filteredWarehouses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No warehouses found' : 'No warehouses available'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Create vendors with warehouse information to get started'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWarehouses.map((warehouse) => (
            <Card key={warehouse._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {warehouse.warehouse?.warehouseName || 'Unnamed Warehouse'}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {warehouse.name || 'Unknown Vendor'} - {warehouse.companyName || 'Unknown Company'}
                    </p>
                  </div>
                  <Badge 
                    variant={warehouse.warehouse?.isVerified ? "default" : "secondary"}
                    className={warehouse.warehouse?.isVerified ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
                  >
                    {warehouse.warehouse?.isVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Location */}
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{warehouse.warehouse?.location?.address || 'No address'}</p>
                    <p>{warehouse.warehouse?.location?.city || 'Unknown'}, {warehouse.warehouse?.location?.state || 'Unknown'}</p>
                    <p>Pincode: {warehouse.warehouse?.location?.pincode || 'N/A'}</p>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Product Categories
                  </Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(warehouse.warehouse?.categories || []).map((category) => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Delivery Config */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Delivery Charges
                    </Label>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Base:</span> ₹{warehouse.warehouse?.deliveryConfig?.baseDeliveryCharge || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Per KM:</span> ₹{warehouse.warehouse?.deliveryConfig?.perKmCharge || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Min Order:</span> ₹{warehouse.warehouse?.deliveryConfig?.minimumOrder || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Free Delivery:</span> ₹{warehouse.warehouse?.deliveryConfig?.freeDeliveryThreshold || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Operating Hours</p>
                    <p className="text-xs">
                      {warehouse.warehouse?.operatingHours ? 
                        Object.entries(warehouse.warehouse.operatingHours)
                          .filter(([_, hours]) => hours?.isOpen)
                          .slice(0, 2)
                          .map(([day, hours]) => `${day}: ${hours?.open}-${hours?.close}`)
                          .join(', ') + 
                          (Object.values(warehouse.warehouse.operatingHours).filter(h => h?.isOpen).length > 2 ? '...' : '')
                        : 'Not specified'
                      }
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleUpdateWarehouse(warehouse)}
                    className="flex-1 bg-black hover:bg-gray-800 text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Update
                  </Button>
                  <Button
                    onClick={() => handleDeleteWarehouse(warehouse)}
                    variant="outline"
                    className="px-3 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Warehouse Update Modal */}
      <WarehouseUpdateModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false)
          setSelectedWarehouse(null)
        }}
        warehouse={selectedWarehouse}
        onUpdate={handleUpdateSuccess}
      />

      {/* Warehouse Create Modal */}
      <WarehouseCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateSuccess}
      />
    </div>
  )
}

export default Warehouses
