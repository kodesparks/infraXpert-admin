import { useState, useEffect } from 'react'
import { X, User, Building, MapPin, Clock, Truck, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import userService from '@/services/userService'

const VendorOnboardingModal = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'vendor',
    employeeId: '',
    address: '',
    pincode: '',
    aadharNumber: '',
    panCard: '',
    joiningDate: '',
    terminationDate: '',
    employeeType: 'full_time',
    companyName: ''
  })

  const [warehouseData, setWarehouseData] = useState({
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
      maxDeliveryRadius: '500'
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
  const [fieldErrors, setFieldErrors] = useState({})
  const [activeStep, setActiveStep] = useState(1)

  const categories = ['Cement', 'Iron', 'Steel', 'Concrete Mixer', 'Concrete Mix']
  const employeeTypes = ['full_time', 'part_time', 'contract', 'intern']
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (error) setError('')
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleWarehouseChange = (field, value) => {
    setWarehouseData(prev => ({
      ...prev,
      [field]: value
    }))
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleLocationChange = (field, value) => {
    setWarehouseData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }))
  }

  const handleCoordinatesChange = (field, value) => {
    setWarehouseData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: {
          ...prev.location.coordinates,
          [field]: value
        }
      }
    }))
  }

  const handleDeliveryConfigChange = (field, value) => {
    setWarehouseData(prev => ({
      ...prev,
      deliveryConfig: {
        ...prev.deliveryConfig,
        [field]: value
      }
    }))
  }

  const handleOperatingHoursChange = (day, field, value) => {
    setWarehouseData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value
        }
      }
    }))
  }

  const handleCategoryToggle = (category) => {
    setWarehouseData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})

    try {
      const vendorPayload = {
        ...formData,
        warehouse: warehouseData
      }

      const response = await userService.createVendor(vendorPayload)
      
      // Auto-refresh the vendor list
      await onSubmit()
      onClose()
    } catch (err) {
      console.error('Vendor creation error:', err)
      
      // Handle structured validation errors
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errors = err.response.data.errors
        const fieldErrorMap = {}
        
        errors.forEach(error => {
          if (error.path && error.msg) {
            fieldErrorMap[error.path] = error.msg
          }
        })
        
        setFieldErrors(fieldErrorMap)
        
        // Set general error message
        if (errors.length > 0) {
          setError(`Please fix the following ${errors.length} error${errors.length > 1 ? 's' : ''}:`)
        }
      } else {
        // Handle other types of errors
        setError(err.response?.data?.message || 'An error occurred while creating the vendor')
      }
    } finally {
      setLoading(false)
    }
  }

  const renderFieldError = (fieldName) => {
    if (fieldErrors[fieldName]) {
      return (
        <p className="text-sm text-red-600 mt-1">{fieldErrors[fieldName]}</p>
      )
    }
    return null
  }

  const nextStep = () => {
    if (activeStep < 3) {
      setActiveStep(activeStep + 1)
    }
  }

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Vendor Onboarding
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {activeStep} of 3: {activeStep === 1 ? 'Basic Information' : activeStep === 2 ? 'Warehouse Details' : 'Operating Hours'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Step 1: Basic Information */}
          {activeStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Vendor Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      placeholder="e.g., Rajesh Kumar"
                    />
                    {renderFieldError('name')}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      placeholder="e.g., rajesh@cementvendor.com"
                    />
                    {renderFieldError('email')}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                      placeholder="e.g., +91-9876543210"
                    />
                    {renderFieldError('phone')}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      placeholder="Enter password"
                    />
                    {renderFieldError('password')}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID <span className="text-red-500">*</span></Label>
                    <Input
                      id="employeeId"
                      value={formData.employeeId}
                      onChange={(e) => handleInputChange('employeeId', e.target.value)}
                      required
                      placeholder="e.g., VEN001"
                    />
                    {renderFieldError('employeeId')}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      required
                      placeholder="e.g., Mumbai Cement Suppliers"
                    />
                    {renderFieldError('companyName')}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employeeType">Employee Type <span className="text-red-500">*</span></Label>
                    <Select value={formData.employeeType} onValueChange={(value) => handleInputChange('employeeType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {employeeTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type.replace('_', ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {renderFieldError('employeeType')}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="joiningDate">Joining Date <span className="text-red-500">*</span></Label>
                    <Input
                      id="joiningDate"
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                      required
                    />
                    {renderFieldError('joiningDate')}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      required
                      placeholder="e.g., 123 Industrial Area, Mumbai"
                      rows={3}
                    />
                    {renderFieldError('address')}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode <span className="text-red-500">*</span></Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      required
                      placeholder="e.g., 400001"
                    />
                    {renderFieldError('pincode')}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aadharNumber">Aadhar Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="aadharNumber"
                      value={formData.aadharNumber}
                      onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
                      required
                      placeholder="e.g., 123456789012"
                    />
                    {renderFieldError('aadharNumber')}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="panCard">PAN Card <span className="text-red-500">*</span></Label>
                    <Input
                      id="panCard"
                      value={formData.panCard}
                      onChange={(e) => handleInputChange('panCard', e.target.value)}
                      required
                      placeholder="e.g., ABCDE1234F"
                    />
                    {renderFieldError('panCard')}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Warehouse Details */}
          {activeStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Warehouse Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="warehouseName">Warehouse Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="warehouseName"
                    value={warehouseData.warehouseName}
                    onChange={(e) => handleWarehouseChange('warehouseName', e.target.value)}
                    required
                    placeholder="e.g., Mumbai Cement Warehouse"
                  />
                  {renderFieldError('warehouseName')}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="warehouseAddress">Address <span className="text-red-500">*</span></Label>
                      <Textarea
                        id="warehouseAddress"
                        value={warehouseData.location.address}
                        onChange={(e) => handleLocationChange('address', e.target.value)}
                        required
                        placeholder="e.g., Industrial Area, Andheri East"
                        rows={3}
                      />
                      {renderFieldError('warehouseAddress')}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="warehouseCity">City <span className="text-red-500">*</span></Label>
                      <Input
                        id="warehouseCity"
                        value={warehouseData.location.city}
                        onChange={(e) => handleLocationChange('city', e.target.value)}
                        required
                        placeholder="e.g., Mumbai"
                      />
                      {renderFieldError('warehouseCity')}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="warehouseState">State <span className="text-red-500">*</span></Label>
                      <Input
                        id="warehouseState"
                        value={warehouseData.location.state}
                        onChange={(e) => handleLocationChange('state', e.target.value)}
                        required
                        placeholder="e.g., Maharashtra"
                      />
                      {renderFieldError('warehouseState')}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="warehousePincode">Pincode <span className="text-red-500">*</span></Label>
                      <Input
                        id="warehousePincode"
                        value={warehouseData.location.pincode}
                        onChange={(e) => handleLocationChange('pincode', e.target.value)}
                        required
                        placeholder="e.g., 400069"
                      />
                      {renderFieldError('warehousePincode')}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude <span className="text-red-500">*</span></Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="0.000001"
                        value={warehouseData.location.coordinates.latitude}
                        onChange={(e) => handleCoordinatesChange('latitude', e.target.value)}
                        required
                        placeholder="e.g., 19.0760"
                      />
                      {renderFieldError('latitude')}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude <span className="text-red-500">*</span></Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="0.000001"
                        value={warehouseData.location.coordinates.longitude}
                        onChange={(e) => handleCoordinatesChange('longitude', e.target.value)}
                        required
                        placeholder="e.g., 72.8777"
                      />
                      {renderFieldError('longitude')}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Product Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleCategoryToggle(category)}
                        className={`px-3 py-1 rounded-full text-sm border ${
                          warehouseData.categories.includes(category)
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  {warehouseData.categories.length === 0 && (
                    <p className="text-sm text-red-600">Please select at least one category</p>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Delivery Configuration
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="baseDeliveryCharge">Base Delivery Charge (₹) <span className="text-red-500">*</span></Label>
                      <Input
                        id="baseDeliveryCharge"
                        type="number"
                        value={warehouseData.deliveryConfig.baseDeliveryCharge}
                        onChange={(e) => handleDeliveryConfigChange('baseDeliveryCharge', e.target.value)}
                        required
                        placeholder="e.g., 50"
                      />
                      {renderFieldError('baseDeliveryCharge')}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="perKmCharge">Per KM Charge (₹) <span className="text-red-500">*</span></Label>
                      <Input
                        id="perKmCharge"
                        type="number"
                        step="0.01"
                        value={warehouseData.deliveryConfig.perKmCharge}
                        onChange={(e) => handleDeliveryConfigChange('perKmCharge', e.target.value)}
                        required
                        placeholder="e.g., 5"
                      />
                      {renderFieldError('perKmCharge')}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minimumOrder">Minimum Order (₹) <span className="text-red-500">*</span></Label>
                      <Input
                        id="minimumOrder"
                        type="number"
                        value={warehouseData.deliveryConfig.minimumOrder}
                        onChange={(e) => handleDeliveryConfigChange('minimumOrder', e.target.value)}
                        required
                        placeholder="e.g., 1000"
                      />
                      {renderFieldError('minimumOrder')}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="freeDeliveryThreshold">Free Delivery Threshold (₹)</Label>
                      <Input
                        id="freeDeliveryThreshold"
                        type="number"
                        value={warehouseData.deliveryConfig.freeDeliveryThreshold}
                        onChange={(e) => handleDeliveryConfigChange('freeDeliveryThreshold', e.target.value)}
                        placeholder="e.g., 10000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="freeDeliveryRadius">Free Delivery Radius (KM)</Label>
                      <Input
                        id="freeDeliveryRadius"
                        type="number"
                        value={warehouseData.deliveryConfig.freeDeliveryRadius}
                        onChange={(e) => handleDeliveryConfigChange('freeDeliveryRadius', e.target.value)}
                        placeholder="e.g., 10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxDeliveryRadius">Max Delivery Radius (KM)</Label>
                      <Input
                        id="maxDeliveryRadius"
                        type="number"
                        value={warehouseData.deliveryConfig.maxDeliveryRadius}
                        onChange={(e) => handleDeliveryConfigChange('maxDeliveryRadius', e.target.value)}
                        placeholder="e.g., 500"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Operating Hours */}
          {activeStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Operating Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {days.map(day => (
                    <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-24">
                        <Label className="capitalize font-medium">{day}</Label>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`${day}-open`}
                          checked={warehouseData.operatingHours[day].isOpen}
                          onChange={(e) => handleOperatingHoursChange(day, 'isOpen', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Label htmlFor={`${day}-open`} className="text-sm">Open</Label>
                      </div>

                      {warehouseData.operatingHours[day].isOpen && (
                        <>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`${day}-open-time`} className="text-sm">From:</Label>
                            <Input
                              id={`${day}-open-time`}
                              type="time"
                              value={warehouseData.operatingHours[day].open}
                              onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                              className="w-32"
                            />
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`${day}-close-time`} className="text-sm">To:</Label>
                            <Input
                              id={`${day}-close-time`}
                              type="time"
                              value={warehouseData.operatingHours[day].close}
                              onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                              className="w-32"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isVerified"
                    checked={warehouseData.isVerified}
                    onChange={(e) => handleWarehouseChange('isVerified', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="isVerified" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Mark warehouse as verified
                  </Label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                  {Object.keys(fieldErrors).length > 0 && (
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc list-inside space-y-1">
                        {Object.entries(fieldErrors).map(([field, message]) => (
                          <li key={field}>
                            <span className="font-medium capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}:</span> {message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <div>
              {activeStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              
              {activeStep < 3 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating Vendor...' : 'Create Vendor'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VendorOnboardingModal
