import { useEffect, useState } from 'react'
import { X, Building, MapPin, Clock, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import warehouseService from '@/services/warehouseService'
import inventoryService from '@/services/inventoryService'

const WarehouseCreateModal = ({ 
  isOpen, 
  onClose, 
  onCreate 
}) => {
  const [formData, setFormData] = useState({
    warehouseName: '',
    location: {
      address: '',
      city: '',
      state: '',
      pincode: '',
      coordinates: {
        latitude: '',
        longitude: ''
      }
    },
    categories: [],
    deliveryConfig: {
      baseDeliveryCharge: '',
      perKmCharge: '',
      minimumOrder: '',
      freeDeliveryThreshold: '',
      freeDeliveryRadius: '',
      maxDeliveryRadius: 500
    },
    operatingHours: {
      monday: { open: '09:00', close: '18:00', isOpen: true },
      tuesday: { open: '09:00', close: '18:00', isOpen: true },
      wednesday: { open: '09:00', close: '18:00', isOpen: true },
      thursday: { open: '09:00', close: '18:00', isOpen: true },
      friday: { open: '09:00', close: '18:00', isOpen: true },
      saturday: { open: '09:00', close: '15:00', isOpen: true },
      sunday: { open: '09:00', close: '15:00', isOpen: false }
    },
    isVerified: false
  })
  const [loading, setLoading] = useState(false)
  const [vendors, setVendors] = useState([])
  const [vendorSearch, setVendorSearch] = useState('')
  const [selectedVendorId, setSelectedVendorId] = useState('')
  const [error, setError] = useState('')

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (error) setError('')
  }

  // Load vendors on open
  useEffect(() => {
    const loadVendors = async () => {
      if (!isOpen) return
      try {
        const res = await inventoryService.getVendors({ limit: 100 })
        setVendors(res.vendors || [])
      } catch (e) {
        // keep vendors empty, show via validation later
        setVendors([])
      }
    }
    loadVendors()
  }, [isOpen])

  const filteredVendors = vendors.filter(v => {
    const q = vendorSearch.toLowerCase()
    return (
      (v.name || '').toLowerCase().includes(q) ||
      (v.email || '').toLowerCase().includes(q) ||
      (v.companyName || '').toLowerCase().includes(q)
    )
  })

  const handleLocationInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }))
    if (error) setError('')
  }

  const handleCoordinatesInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: {
          ...prev.location.coordinates,
          [field]: value
        }
      }
    }))
    if (error) setError('')
  }

  const handleDeliveryConfigInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      deliveryConfig: {
        ...prev.deliveryConfig,
        [field]: value
      }
    }))
    if (error) setError('')
  }

  const handleOperatingHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value
        }
      }
    }))
    if (error) setError('')
  }

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate vendor selection
      if (!selectedVendorId) {
        setError('Please select an existing vendor to assign this warehouse')
        setLoading(false)
        return
      }
      // Validate location and coordinates
      const { pincode, coordinates, city, state, address } = formData.location
      if (!address || !city || !state || !pincode) {
        setError('Please fill all required location fields')
        setLoading(false)
        return
      }
      if ((pincode || '').length !== 6) {
        setError('Pincode must be 6 digits')
        setLoading(false)
        return
      }
      const lat = parseFloat(coordinates.latitude)
      const lon = parseFloat(coordinates.longitude)
      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        setError('Latitude and Longitude are required')
        setLoading(false)
        return
      }
      if (lat < -90 || lat > 90) {
        setError('Latitude must be between -90 and 90')
        setLoading(false)
        return
      }
      if (lon < -180 || lon > 180) {
        setError('Longitude must be between -180 and 180')
        setLoading(false)
        return
      }

      // Convert data types
      const warehouseData = {
        warehouseName: formData.warehouseName,
        location: {
          ...formData.location,
          coordinates: {
            latitude: parseFloat(formData.location.coordinates.latitude) || 0,
            longitude: parseFloat(formData.location.coordinates.longitude) || 0
          }
        },
        categories: formData.categories,
        deliveryConfig: {
          baseDeliveryCharge: parseFloat(formData.deliveryConfig.baseDeliveryCharge) || 0,
          perKmCharge: parseFloat(formData.deliveryConfig.perKmCharge) || 0,
          minimumOrder: parseFloat(formData.deliveryConfig.minimumOrder) || 0,
          freeDeliveryThreshold: parseFloat(formData.deliveryConfig.freeDeliveryThreshold) || 0,
          freeDeliveryRadius: parseFloat(formData.deliveryConfig.freeDeliveryRadius) || 0,
          maxDeliveryRadius: parseFloat(formData.deliveryConfig.maxDeliveryRadius) || 500
        },
        operatingHours: formData.operatingHours,
        isVerified: formData.isVerified
      }

      // Assign/update vendor's primary warehouse via PUT
      await warehouseService.updateWarehouse(selectedVendorId, warehouseData)
      // Trigger sync
      try {
        const syncRes = await warehouseService.syncInventory()
        alert(syncRes?.message || 'Inventory sync started')
      } catch (syncErr) {
        // surface backend error but do not block the success path
        alert(syncErr.response?.data?.message || 'Failed to start inventory sync')
      }
      
      if (onCreate) {
        await onCreate()
      }
      
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while creating warehouse')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Assign Warehouse to Existing Vendor
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Vendor Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Select Vendor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="vendorSearch">Search Vendor</Label>
                    <Input
                      id="vendorSearch"
                      placeholder="Search by name, email, or company"
                      value={vendorSearch}
                      onChange={(e) => setVendorSearch(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vendorSelect">Vendor <span className="text-red-500">*</span></Label>
                    <select
                      id="vendorSelect"
                      className="border rounded-md h-10 px-3 text-sm w-full"
                      value={selectedVendorId}
                      onChange={(e) => setSelectedVendorId(e.target.value)}
                      required
                    >
                      <option value="">Select vendor</option>
                      {filteredVendors.map(v => (
                        <option key={v.id || v._id} value={(v.id || v._id)}>
                          {(v.name || 'Unnamed')} - {(v.companyName || 'No Company')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="warehouseName">
                      Warehouse Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="warehouseName"
                      value={formData.warehouseName}
                      onChange={(e) => handleInputChange('warehouseName', e.target.value)}
                      required
                      placeholder="Enter warehouse name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warehouseAddress">
                      Warehouse Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="warehouseAddress"
                      value={formData.location.address}
                      onChange={(e) => handleLocationInputChange('address', e.target.value)}
                      required
                      placeholder="Enter warehouse address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warehouseCity">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="warehouseCity"
                      value={formData.location.city}
                      onChange={(e) => handleLocationInputChange('city', e.target.value)}
                      required
                      placeholder="Enter city"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warehouseState">
                      State <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="warehouseState"
                      value={formData.location.state}
                      onChange={(e) => handleLocationInputChange('state', e.target.value)}
                      required
                      placeholder="Enter state"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warehousePincode">
                      Pincode <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="warehousePincode"
                      value={formData.location.pincode}
                      onChange={(e) => handleLocationInputChange('pincode', e.target.value)}
                      required
                      placeholder="Enter 6-digit pincode"
                      maxLength="6"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warehouseLatitude">
                      Latitude <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="warehouseLatitude"
                      type="number"
                      step="any"
                      value={formData.location.coordinates.latitude}
                      onChange={(e) => handleCoordinatesInputChange('latitude', e.target.value)}
                      required
                      placeholder="Enter latitude"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warehouseLongitude">
                      Longitude <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="warehouseLongitude"
                      type="number"
                      step="any"
                      value={formData.location.coordinates.longitude}
                      onChange={(e) => handleCoordinatesInputChange('longitude', e.target.value)}
                      required
                      placeholder="Enter longitude"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label>Product Categories <span className="text-red-500">*</span></Label>
                    <div className="flex flex-wrap gap-2">
                      {['Cement', 'Iron', 'Steel', 'Concrete Mixer', 'Concrete Mix'].map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleCategoryToggle(category)}
                          className={`px-3 py-1 rounded-full text-sm border ${
                            formData.categories.includes(category)
                              ? 'bg-blue-100 border-blue-300 text-blue-800'
                              : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="baseDeliveryCharge">
                      Base Delivery Charge (₹) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="baseDeliveryCharge"
                      type="number"
                      min="0"
                      value={formData.deliveryConfig.baseDeliveryCharge}
                      onChange={(e) => handleDeliveryConfigInputChange('baseDeliveryCharge', e.target.value)}
                      required
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="perKmCharge">
                      Per KM Charge (₹) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="perKmCharge"
                      type="number"
                      min="0"
                      value={formData.deliveryConfig.perKmCharge}
                      onChange={(e) => handleDeliveryConfigInputChange('perKmCharge', e.target.value)}
                      required
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minimumOrder">
                      Minimum Order (₹) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="minimumOrder"
                      type="number"
                      min="0"
                      value={formData.deliveryConfig.minimumOrder}
                      onChange={(e) => handleDeliveryConfigInputChange('minimumOrder', e.target.value)}
                      required
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="freeDeliveryThreshold">
                      Free Delivery Threshold (₹)
                    </Label>
                    <Input
                      id="freeDeliveryThreshold"
                      type="number"
                      min="0"
                      value={formData.deliveryConfig.freeDeliveryThreshold}
                      onChange={(e) => handleDeliveryConfigInputChange('freeDeliveryThreshold', e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="freeDeliveryRadius">
                      Free Delivery Radius (km)
                    </Label>
                    <Input
                      id="freeDeliveryRadius"
                      type="number"
                      min="0"
                      value={formData.deliveryConfig.freeDeliveryRadius}
                      onChange={(e) => handleDeliveryConfigInputChange('freeDeliveryRadius', e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxDeliveryRadius">
                      Max Delivery Radius (km)
                    </Label>
                    <Input
                      id="maxDeliveryRadius"
                      type="number"
                      min="0"
                      value={formData.deliveryConfig.maxDeliveryRadius}
                      onChange={(e) => handleDeliveryConfigInputChange('maxDeliveryRadius', e.target.value)}
                      placeholder="500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Operating Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(formData.operatingHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={hours.isOpen}
                          onChange={(e) => handleOperatingHoursChange(day, 'isOpen', e.target.checked)}
                          className="rounded"
                        />
                        <Label className="capitalize font-medium">{day}</Label>
                      </div>
                      {hours.isOpen && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={hours.open}
                            onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                            className="w-24"
                          />
                          <span>to</span>
                          <Input
                            type="time"
                            value={hours.close}
                            onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                            className="w-24"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Warehouse Verification */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isVerified"
                    checked={formData.isVerified}
                    onChange={(e) => handleInputChange('isVerified', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="isVerified">Warehouse Verified</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Warehouse'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default WarehouseCreateModal
