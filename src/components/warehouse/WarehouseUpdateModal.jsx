import { useState, useEffect } from 'react'
import { X, Building, MapPin, Clock, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import warehouseService from '@/services/warehouseService'

const WarehouseUpdateModal = ({ 
  isOpen, 
  onClose, 
  warehouse, 
  onUpdate 
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
  const [error, setError] = useState('')

  // Load warehouse data when modal opens
  useEffect(() => {
    if (isOpen && warehouse) {
      setFormData({
        warehouseName: warehouse.warehouse.warehouseName || '',
        location: {
          address: warehouse.warehouse.location?.address || '',
          city: warehouse.warehouse.location?.city || '',
          state: warehouse.warehouse.location?.state || '',
          pincode: warehouse.warehouse.location?.pincode || '',
          coordinates: {
            latitude: warehouse.warehouse.location?.coordinates?.latitude || '',
            longitude: warehouse.warehouse.location?.coordinates?.longitude || ''
          }
        },
        categories: warehouse.warehouse.categories || [],
        deliveryConfig: {
          baseDeliveryCharge: warehouse.warehouse.deliveryConfig?.baseDeliveryCharge || '',
          perKmCharge: warehouse.warehouse.deliveryConfig?.perKmCharge || '',
          minimumOrder: warehouse.warehouse.deliveryConfig?.minimumOrder || '',
          freeDeliveryThreshold: warehouse.warehouse.deliveryConfig?.freeDeliveryThreshold || '',
          freeDeliveryRadius: warehouse.warehouse.deliveryConfig?.freeDeliveryRadius || '',
          maxDeliveryRadius: warehouse.warehouse.deliveryConfig?.maxDeliveryRadius || 500
        },
        operatingHours: warehouse.warehouse.operatingHours || {
          monday: { open: '09:00', close: '18:00', isOpen: true },
          tuesday: { open: '09:00', close: '18:00', isOpen: true },
          wednesday: { open: '09:00', close: '18:00', isOpen: true },
          thursday: { open: '09:00', close: '18:00', isOpen: true },
          friday: { open: '09:00', close: '18:00', isOpen: true },
          saturday: { open: '09:00', close: '15:00', isOpen: true },
          sunday: { open: '09:00', close: '15:00', isOpen: false }
        },
        isVerified: warehouse.warehouse.isVerified || false
      })
      setError('')
    }
  }, [isOpen, warehouse])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (error) setError('')
  }

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

      await warehouseService.updateWarehouse(warehouse.vendorId, warehouseData)
      
      if (onUpdate) {
        await onUpdate()
      }
      
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while updating warehouse')
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
            Update Warehouse: {warehouse?.warehouse?.warehouseName}
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
              {loading ? 'Updating...' : 'Update Warehouse'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default WarehouseUpdateModal
