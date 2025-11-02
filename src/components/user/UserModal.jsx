import { useState, useEffect } from 'react'
import { X, User, Mail, Phone, MapPin, Building, Calendar, CreditCard, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import userService from '@/services/userService'

const UserModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  user = null, 
  isEditMode = false,
  defaultRole
}) => {
  const [formData, setFormData] = useState(() => ({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    pincode: '',
    role: defaultRole || '',
    employeeId: '',
    aadharNumber: '',
    panCard: '',
    joiningDate: '',
    terminationDate: '',
    employeeType: 'full_time',
    companyName: '',
    // Warehouse fields for vendors
    warehouse: {
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
    }
  }))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [roleConfig, setRoleConfig] = useState(null)

  // Reset form when modal opens for new user
  useEffect(() => {
    if (isOpen && !isEditMode) {
      setFormData(prev => ({
        ...prev,
        role: defaultRole || ''
      }))
      setError('')
    }
  }, [isOpen, isEditMode, defaultRole])

  // Load role configuration when role changes
  useEffect(() => {
    if (formData.role) {
      loadRoleConfig(formData.role)
    }
  }, [formData.role])

  // Load user data for editing
  useEffect(() => {
    if (isEditMode && user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        address: user.address || '',
        pincode: user.pincode || '',
        role: user.role || '',
        employeeId: user.employeeId || '',
        aadharNumber: user.aadharNumber || '',
        panCard: user.panCard || '',
        joiningDate: user.joiningDate ? user.joiningDate.split('T')[0] : '',
        terminationDate: user.terminationDate ? user.terminationDate.split('T')[0] : '',
        employeeType: user.employeeType || 'full_time',
        companyName: user.companyName || '',
        // Load warehouse data if user has warehouse (for vendors)
        warehouse: user.warehouse ? {
          warehouseName: user.warehouse.warehouseName || '',
          location: {
            address: user.warehouse.location?.address || '',
            city: user.warehouse.location?.city || '',
            state: user.warehouse.location?.state || '',
            pincode: user.warehouse.location?.pincode || '',
            coordinates: {
              latitude: user.warehouse.location?.coordinates?.latitude || '',
              longitude: user.warehouse.location?.coordinates?.longitude || ''
            }
          },
          categories: user.warehouse.categories || [],
          deliveryConfig: {
            baseDeliveryCharge: user.warehouse.deliveryConfig?.baseDeliveryCharge || '',
            perKmCharge: user.warehouse.deliveryConfig?.perKmCharge || '',
            minimumOrder: user.warehouse.deliveryConfig?.minimumOrder || '',
            freeDeliveryThreshold: user.warehouse.deliveryConfig?.freeDeliveryThreshold || '',
            freeDeliveryRadius: user.warehouse.deliveryConfig?.freeDeliveryRadius || '',
            maxDeliveryRadius: user.warehouse.deliveryConfig?.maxDeliveryRadius || 500
          },
          operatingHours: user.warehouse.operatingHours || {
            monday: { open: '09:00', close: '18:00', isOpen: true },
            tuesday: { open: '09:00', close: '18:00', isOpen: true },
            wednesday: { open: '09:00', close: '18:00', isOpen: true },
            thursday: { open: '09:00', close: '18:00', isOpen: true },
            friday: { open: '09:00', close: '18:00', isOpen: true },
            saturday: { open: '09:00', close: '15:00', isOpen: true },
            sunday: { open: '09:00', close: '15:00', isOpen: false }
          },
          isVerified: user.warehouse.isVerified || false
        } : {
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
        }
      })
    }
  }, [isEditMode, user])

  const loadRoleConfig = async (role) => {
    try {
      const config = await userService.getRoleConfig(role)
      setRoleConfig(config.config)
    } catch (error) {
      console.error('Error loading role config:', error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (error) setError('')
  }

  const handleWarehouseInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      warehouse: {
        ...prev.warehouse,
        [field]: value
      }
    }))
    if (error) setError('')
  }

  const handleLocationInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      warehouse: {
        ...prev.warehouse,
        location: {
          ...prev.warehouse.location,
          [field]: value
        }
      }
    }))
    if (error) setError('')
  }

  const handleCoordinatesInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      warehouse: {
        ...prev.warehouse,
        location: {
          ...prev.warehouse.location,
          coordinates: {
            ...prev.warehouse.location.coordinates,
            [field]: value
          }
        }
      }
    }))
    if (error) setError('')
  }

  const handleDeliveryConfigInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      warehouse: {
        ...prev.warehouse,
        deliveryConfig: {
          ...prev.warehouse.deliveryConfig,
          [field]: value
        }
      }
    }))
    if (error) setError('')
  }

  const handleOperatingHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      warehouse: {
        ...prev.warehouse,
        operatingHours: {
          ...prev.warehouse.operatingHours,
          [day]: {
            ...prev.warehouse.operatingHours[day],
            [field]: value
          }
        }
      }
    }))
    if (error) setError('')
  }

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      warehouse: {
        ...prev.warehouse,
        categories: prev.warehouse.categories.includes(category)
          ? prev.warehouse.categories.filter(c => c !== category)
          : [...prev.warehouse.categories, category]
      }
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Remove empty password field for updates
      const submitData = { ...formData }
      if (isEditMode && !submitData.password) {
        delete submitData.password
      }

      // Convert warehouse data types for vendors
      if (formData.role === 'vendor' && submitData.warehouse) {
        submitData.warehouse = {
          ...submitData.warehouse,
          location: {
            ...submitData.warehouse.location,
            coordinates: {
              latitude: parseFloat(submitData.warehouse.location.coordinates.latitude) || 0,
              longitude: parseFloat(submitData.warehouse.location.coordinates.longitude) || 0
            }
          },
          deliveryConfig: {
            baseDeliveryCharge: parseFloat(submitData.warehouse.deliveryConfig.baseDeliveryCharge) || 0,
            perKmCharge: parseFloat(submitData.warehouse.deliveryConfig.perKmCharge) || 0,
            minimumOrder: parseFloat(submitData.warehouse.deliveryConfig.minimumOrder) || 0,
            freeDeliveryThreshold: parseFloat(submitData.warehouse.deliveryConfig.freeDeliveryThreshold) || 0,
            freeDeliveryRadius: parseFloat(submitData.warehouse.deliveryConfig.freeDeliveryRadius) || 0,
            maxDeliveryRadius: parseFloat(submitData.warehouse.deliveryConfig.maxDeliveryRadius) || 500
          }
        }
      }

      await onSubmit(submitData)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const isFieldRequired = (field) => {
    return roleConfig?.requiredFields?.includes(field) || false
  }

  const getFieldIcon = (field) => {
    const icons = {
      name: User,
      email: Mail,
      phone: Phone,
      address: MapPin,
      employeeId: Building,
      aadharNumber: CreditCard,
      panCard: FileText,
      joiningDate: Calendar,
      terminationDate: Calendar,
      companyName: Building
    }
    return icons[field] || User
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode 
              ? 'Edit User' 
              : formData.role === 'vendor' 
                ? 'Create New Vendor' 
                : formData.role === 'employee' 
                  ? 'Create New Employee' 
                  : formData.role === 'customer' 
                    ? 'Create New Customer' 
                    : 'Create New User'
            }
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name {isFieldRequired('name') && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required={isFieldRequired('name')}
                  placeholder="Enter full name"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address {isFieldRequired('email') && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required={isFieldRequired('email')}
                  placeholder="Enter email address"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number {isFieldRequired('phone') && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required={isFieldRequired('phone')}
                  placeholder="Enter phone number"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password {!isEditMode && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required={!isEditMode}
                  placeholder={isEditMode ? "Leave blank to keep current password" : "Enter password"}
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">
                  Role <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
              
              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address {isFieldRequired('address') && <span className="text-red-500">*</span>}
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required={isFieldRequired('address')}
                  placeholder="Enter address"
                  rows={3}
                />
              </div>

              {/* Pincode */}
              <div className="space-y-2">
                <Label htmlFor="pincode">
                  Pincode {isFieldRequired('pincode') && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  required={isFieldRequired('pincode')}
                  placeholder="Enter pincode"
                />
              </div>
            </div>

            {/* Employee Information */}
            {(formData.role === 'admin' || formData.role === 'manager' || formData.role === 'employee' || formData.role === 'vendor') && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Employee Information</h3>
                
                {/* Employee ID */}
                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Employee ID {isFieldRequired('employeeId') && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    required={isFieldRequired('employeeId')}
                    placeholder="Enter employee ID"
                  />
                </div>

                {/* Aadhar Number */}
                <div className="space-y-2">
                  <Label htmlFor="aadharNumber" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Aadhar Number {isFieldRequired('aadharNumber') && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
                    required={isFieldRequired('aadharNumber')}
                    placeholder="Enter Aadhar number"
                  />
                </div>

                {/* PAN Card */}
                <div className="space-y-2">
                  <Label htmlFor="panCard" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PAN Card {isFieldRequired('panCard') && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="panCard"
                    value={formData.panCard}
                    onChange={(e) => handleInputChange('panCard', e.target.value)}
                    required={isFieldRequired('panCard')}
                    placeholder="Enter PAN card number"
                  />
                </div>

                {/* Joining Date */}
                <div className="space-y-2">
                  <Label htmlFor="joiningDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Joining Date {isFieldRequired('joiningDate') && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="joiningDate"
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                    required={isFieldRequired('joiningDate')}
                  />
                </div>

                {/* Termination Date */}
                <div className="space-y-2">
                  <Label htmlFor="terminationDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Termination Date
                  </Label>
                  <Input
                    id="terminationDate"
                    type="date"
                    value={formData.terminationDate}
                    onChange={(e) => handleInputChange('terminationDate', e.target.value)}
                  />
                </div>

                {/* Employee Type */}
                <div className="space-y-2">
                  <Label htmlFor="employeeType">
                    Employee Type {isFieldRequired('employeeType') && <span className="text-red-500">*</span>}
                  </Label>
                  <Select value={formData.employeeType} onValueChange={(value) => handleInputChange('employeeType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Vendor Information */}
            {formData.role === 'vendor' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Vendor Information</h3>
                
                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Company Name {isFieldRequired('companyName') && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    required={isFieldRequired('companyName')}
                    placeholder="Enter company name"
                  />
                </div>
              </div>
            )}

            {/* Warehouse Information - Only for Vendors */}
            {formData.role === 'vendor' && (
              <div className="space-y-6 col-span-2">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Warehouse Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Warehouse Name */}
                  <div className="space-y-2">
                    <Label htmlFor="warehouseName">
                      Warehouse Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="warehouseName"
                      value={formData.warehouse.warehouseName}
                      onChange={(e) => handleWarehouseInputChange('warehouseName', e.target.value)}
                      required
                      placeholder="Enter warehouse name"
                    />
                  </div>

                  {/* Warehouse Address */}
                  <div className="space-y-2">
                    <Label htmlFor="warehouseAddress">
                      Warehouse Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="warehouseAddress"
                      value={formData.warehouse.location.address}
                      onChange={(e) => handleLocationInputChange('address', e.target.value)}
                      required
                      placeholder="Enter warehouse address"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="warehouseCity">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="warehouseCity"
                      value={formData.warehouse.location.city}
                      onChange={(e) => handleLocationInputChange('city', e.target.value)}
                      required
                      placeholder="Enter city"
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-2">
                    <Label htmlFor="warehouseState">
                      State <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="warehouseState"
                      value={formData.warehouse.location.state}
                      onChange={(e) => handleLocationInputChange('state', e.target.value)}
                      required
                      placeholder="Enter state"
                    />
                  </div>

                  {/* Pincode */}
                  <div className="space-y-2">
                    <Label htmlFor="warehousePincode">
                      Pincode <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="warehousePincode"
                      value={formData.warehouse.location.pincode}
                      onChange={(e) => handleLocationInputChange('pincode', e.target.value)}
                      required
                      placeholder="Enter 6-digit pincode"
                      maxLength="6"
                    />
                  </div>

                  {/* Latitude */}
                  <div className="space-y-2">
                    <Label htmlFor="warehouseLatitude">
                      Latitude <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="warehouseLatitude"
                      type="number"
                      step="any"
                      value={formData.warehouse.location.coordinates.latitude}
                      onChange={(e) => handleCoordinatesInputChange('latitude', e.target.value)}
                      required
                      placeholder="Enter latitude"
                    />
                  </div>

                  {/* Longitude */}
                  <div className="space-y-2">
                    <Label htmlFor="warehouseLongitude">
                      Longitude <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="warehouseLongitude"
                      type="number"
                      step="any"
                      value={formData.warehouse.location.coordinates.longitude}
                      onChange={(e) => handleCoordinatesInputChange('longitude', e.target.value)}
                      required
                      placeholder="Enter longitude"
                    />
                  </div>

                  {/* Categories */}
                  <div className="space-y-2 col-span-2">
                    <Label>Product Categories <span className="text-red-500">*</span></Label>
                    <div className="flex flex-wrap gap-2">
                      {['Cement', 'Iron', 'Steel', 'Concrete Mixer', 'Concrete Mix'].map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleCategoryToggle(category)}
                          className={`px-3 py-1 rounded-full text-sm border ${
                            formData.warehouse.categories.includes(category)
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

                {/* Delivery Configuration */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Delivery Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Base Delivery Charge */}
                    <div className="space-y-2">
                      <Label htmlFor="baseDeliveryCharge">
                        Base Delivery Charge (₹) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="baseDeliveryCharge"
                        type="number"
                        min="0"
                        value={formData.warehouse.deliveryConfig.baseDeliveryCharge}
                        onChange={(e) => handleDeliveryConfigInputChange('baseDeliveryCharge', e.target.value)}
                        required
                        placeholder="0"
                      />
                    </div>

                    {/* Per KM Charge */}
                    <div className="space-y-2">
                      <Label htmlFor="perKmCharge">
                        Per KM Charge (₹) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="perKmCharge"
                        type="number"
                        min="0"
                        value={formData.warehouse.deliveryConfig.perKmCharge}
                        onChange={(e) => handleDeliveryConfigInputChange('perKmCharge', e.target.value)}
                        required
                        placeholder="0"
                      />
                    </div>

                    {/* Minimum Order */}
                    <div className="space-y-2">
                      <Label htmlFor="minimumOrder">
                        Minimum Order (₹) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="minimumOrder"
                        type="number"
                        min="0"
                        value={formData.warehouse.deliveryConfig.minimumOrder}
                        onChange={(e) => handleDeliveryConfigInputChange('minimumOrder', e.target.value)}
                        required
                        placeholder="0"
                      />
                    </div>

                    {/* Free Delivery Threshold */}
                    <div className="space-y-2">
                      <Label htmlFor="freeDeliveryThreshold">
                        Free Delivery Threshold (₹)
                      </Label>
                      <Input
                        id="freeDeliveryThreshold"
                        type="number"
                        min="0"
                        value={formData.warehouse.deliveryConfig.freeDeliveryThreshold}
                        onChange={(e) => handleDeliveryConfigInputChange('freeDeliveryThreshold', e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    {/* Free Delivery Radius */}
                    <div className="space-y-2">
                      <Label htmlFor="freeDeliveryRadius">
                        Free Delivery Radius (km)
                      </Label>
                      <Input
                        id="freeDeliveryRadius"
                        type="number"
                        min="0"
                        value={formData.warehouse.deliveryConfig.freeDeliveryRadius}
                        onChange={(e) => handleDeliveryConfigInputChange('freeDeliveryRadius', e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    {/* Max Delivery Radius */}
                    <div className="space-y-2">
                      <Label htmlFor="maxDeliveryRadius">
                        Max Delivery Radius (km)
                      </Label>
                      <Input
                        id="maxDeliveryRadius"
                        type="number"
                        min="0"
                        value={formData.warehouse.deliveryConfig.maxDeliveryRadius}
                        onChange={(e) => handleDeliveryConfigInputChange('maxDeliveryRadius', e.target.value)}
                        placeholder="500"
                      />
                    </div>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Operating Hours</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(formData.warehouse.operatingHours).map(([day, hours]) => (
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
                </div>

                {/* Warehouse Verification */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isVerified"
                      checked={formData.warehouse.isVerified}
                      onChange={(e) => handleWarehouseInputChange('isVerified', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="isVerified">Warehouse Verified</Label>
                  </div>
                </div>
              </div>
            )}
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
              {loading ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserModal
