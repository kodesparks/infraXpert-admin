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
  isEditMode = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    pincode: '',
    role: '',
    employeeId: '',
    aadharNumber: '',
    panCard: '',
    joiningDate: '',
    terminationDate: '',
    employeeType: 'full_time',
    companyName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [roleConfig, setRoleConfig] = useState(null)

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
        companyName: user.companyName || ''
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
            {isEditMode ? 'Edit User' : 'Create New User'}
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
                    Termination Date {isFieldRequired('terminationDate') && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="terminationDate"
                    type="date"
                    value={formData.terminationDate}
                    onChange={(e) => handleInputChange('terminationDate', e.target.value)}
                    required={isFieldRequired('terminationDate')}
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
