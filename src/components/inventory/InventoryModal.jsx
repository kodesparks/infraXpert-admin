import { useState, useEffect } from 'react'
import { X, Package, Building, FileText, Tag, Truck, Percent, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import inventoryService from '@/services/inventoryService'
import warehouseService from '@/services/warehouseService'
import { generateInventoryCode } from '@/utils/inventoryUtils'
import WarehouseUpdateModal from '@/components/warehouse/WarehouseUpdateModal'

const InventoryModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  item = null, 
  isEditMode = false 
}) => {
  const [formData, setFormData] = useState({
    itemDescription: '',
    category: '',
    subCategory: '',
    grade: '',
    units: 'BAG',
    details: '',
    specification: '',
    deliveryInformation: '',
    hscCode: '',
    vendorId: ''
  })

  const [priceData, setPriceData] = useState({
    basePrice: '',
    unitPrice: '',
    currency: 'INR',
    margin: '',
    marginPercentage: '',
    cgst: '',
    sgst: '',
    igst: '',
    tax: '',
    totalPrice: ''
  })

  const [shippingData, setShippingData] = useState({
    price0to50k: '',
    price50kto100k: '',
    price100kto150k: '',
    price150kto200k: '',
    priceAbove200k: '',
    baseCharge: '',
    perKmCharge: '',
    freeDeliveryThreshold: '',
    freeDeliveryRadius: ''
  })

  const [promoData, setPromoData] = useState({
    promoName: '',
    discount: '',
    discountType: 'percentage',
    startDate: '',
    endDate: '',
    minOrderValue: '',
    maxDiscountAmount: '',
    usageLimit: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [uploadedImages, setUploadedImages] = useState([])
  const [categories, setCategories] = useState({})
  const [subcategories, setSubcategories] = useState([])
  const [vendors, setVendors] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [selectedWarehouses, setSelectedWarehouses] = useState([])
  const [initialLoading, setInitialLoading] = useState(false)
  const [showWarehouseUpdateModal, setShowWarehouseUpdateModal] = useState(false)
  const [selectedWarehouseForUpdate, setSelectedWarehouseForUpdate] = useState(null)

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      const initializeData = async () => {
        setInitialLoading(true)
        try {
          // First load categories and vendors
          await loadInitialData()
          // Then load item data if in edit mode
          if (isEditMode && item) {
            await loadItemData()
          }
        } catch (error) {
          console.error('Error initializing modal data:', error)
        } finally {
          setInitialLoading(false)
        }
      }
      initializeData()
    }
  }, [isOpen, isEditMode, item])

  // Load subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      loadSubcategories(formData.category)
    }
  }, [formData.category])


  const loadInitialData = async () => {
    try {
      // Load categories and vendors first (warehouses API doesn't exist yet)
      const [categoriesRes, vendorsRes] = await Promise.all([
        inventoryService.getAllCategories(),
        inventoryService.getVendors({ limit: 100 })
      ])
      
      
      // Set categories
      const categoriesData = categoriesRes.categories || {}
      setCategories(categoriesData)
      
      // Set vendors
      console.log('Vendors response:', vendorsRes)
      const vendorsData = vendorsRes.vendors || []
      console.log('Vendors loaded:', vendorsData.length, vendorsData)
      setVendors(vendorsData)
      
      // Try to load warehouses, but don't fail if it doesn't exist
      try {
        const warehousesRes = await warehouseService.getAvailableWarehouses()
        // Handle the exact response structure from your API documentation
        setWarehouses(warehousesRes.data?.warehouses || [])
      } catch (warehouseError) {
        console.warn('Warehouses API not available:', warehouseError.message)
        setWarehouses([]) // Set empty array if warehouses API doesn't exist
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
  }

  const loadSubcategories = async (category) => {
    try {
      const response = await inventoryService.getSubcategories(category)
      console.log('Subcategories response:', response)
      setSubcategories(response.subCategories || response.subcategories || [])
    } catch (error) {
      console.error('Error loading subcategories:', error)
      setSubcategories([])
    }
  }

  const loadItemData = async () => {
    // Load basic item data
    const itemData = {
      itemDescription: item.itemDescription || '',
      category: item.category || '',
      subCategory: item.subCategory || '',
      grade: item.grade || '',
      units: item.units || 'BAG',
      details: item.details || '',
      specification: item.specification || '',
      deliveryInformation: item.deliveryInformation || '',
      hscCode: item.hscCode || '',
      vendorId: item.vendorId?._id || ''
    }
    
    setFormData(itemData)
    
    if (item.images) {
      setUploadedImages(item.images)
    }

    // Load subcategories for the item's category
    if (item.category) {
      await loadSubcategories(item.category)
    }

    // Fetch pricing, shipping, and promo data from APIs
    try {
      const [pricingResponse, shippingResponse, promoResponse] = await Promise.allSettled([
        inventoryService.getItemPricing(item._id),
        inventoryService.getItemShipping(item._id),
        inventoryService.getItemPromos(item._id, true)
      ])

      // Load pricing data (404 is expected if no pricing data exists yet)
      if (pricingResponse.status === 'fulfilled' && pricingResponse.value.pricing) {
        const pricing = pricingResponse.value.pricing
        setPriceData({
          basePrice: pricing.basePrice || '',
          unitPrice: pricing.unitPrice || '',
          currency: pricing.currency || 'INR',
          margin: pricing.margin || '',
          marginPercentage: pricing.marginPercentage || '',
          cgst: pricing.cgst || '',
          sgst: pricing.sgst || '',
          igst: pricing.igst || '',
          tax: pricing.tax || '',
          totalPrice: pricing.totalPrice || ''
        })
      }

      // Load shipping data (404 is expected if no shipping data exists yet)
      if (shippingResponse.status === 'fulfilled' && shippingResponse.value.shipping) {
        const shipping = shippingResponse.value.shipping
        setShippingData({
          price0to50k: shipping.price0to50k || '',
          price50kto100k: shipping.price50kto100k || '',
          price100kto150k: shipping.price100kto150k || '',
          price150kto200k: shipping.price150kto200k || '',
          priceAbove200k: shipping.priceAbove200k || '',
          baseCharge: shipping.baseCharge || '',
          perKmCharge: shipping.perKmCharge || '',
          freeDeliveryThreshold: shipping.freeDeliveryThreshold || '',
          freeDeliveryRadius: shipping.freeDeliveryRadius || ''
        })
      }

      // Load promo data (empty array is expected if no promos exist)
      if (promoResponse.status === 'fulfilled' && promoResponse.value.promos && promoResponse.value.promos.length > 0) {
        const promo = promoResponse.value.promos[0] // Get the first active promo
        setPromoData({
          promoName: promo.promoName || '',
          discount: promo.discountValue || '',
          discountType: promo.discountType || 'percentage',
          startDate: promo.startDate ? new Date(promo.startDate).toISOString().slice(0, 16) : '',
          endDate: promo.endDate ? new Date(promo.endDate).toISOString().slice(0, 16) : '',
          minOrderValue: promo.minOrderValue || '',
          maxDiscountAmount: promo.maxDiscountAmount || '',
          usageLimit: promo.usageLimit || ''
        })
      }
    } catch (error) {
      console.error('Error loading item data:', error)
    }
  }

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

  const handlePriceChange = (field, value) => {
    setPriceData(prev => ({
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

  const handleShippingChange = (field, value) => {
    setShippingData(prev => ({
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

  const handlePromoChange = (field, value) => {
    setPromoData(prev => ({
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

  const handleWarehouseSelection = (warehouseId, isSelected) => {
    if (isSelected) {
      const warehouse = warehouses.find(w => w.vendorId === warehouseId)
      if (warehouse) {
        setSelectedWarehouses(prev => [...prev, {
          warehouseId: warehouse.vendorId,
          warehouseName: warehouse.warehouse.warehouseName,
          location: warehouse.warehouse.location,
          deliveryConfig: warehouse.warehouse.deliveryConfig,
          stock: {
            available: 0,
            reserved: 0
          },
          isActive: true
        }])
      }
    } else {
      setSelectedWarehouses(prev => prev.filter(w => w.warehouseId !== warehouseId))
    }
  }

  const handleUpdateWarehouse = (warehouse) => {
    setSelectedWarehouseForUpdate(warehouse)
    setShowWarehouseUpdateModal(true)
  }

  const handleWarehouseUpdateSuccess = async () => {
    // Refresh the warehouses list after successful update
    await loadInitialData()
  }

  const removeUploadedImage = (imageKey) => {
    setUploadedImages(prev => prev.filter(img => img.key !== imageKey))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})

    try {
      let response
      if (isEditMode) {
        // For updates, only send changed fields
        const updatePayload = {}
        
        // Check basic info changes
        if (formData.itemDescription !== item.itemDescription) {
          updatePayload.itemDescription = formData.itemDescription
        }
        if (formData.category !== item.category) {
          updatePayload.category = formData.category
        }
        if (formData.subCategory !== item.subCategory) {
          updatePayload.subCategory = formData.subCategory
        }
        if (formData.grade !== item.grade) {
          updatePayload.grade = formData.grade
        }
        if (formData.units !== item.units) {
          updatePayload.units = formData.units
        }
        if (formData.details !== item.details) {
          updatePayload.details = formData.details
        }
        if (formData.specification !== item.specification) {
          updatePayload.specification = formData.specification
        }
        
        // Check pricing changes
        const currentPricing = item.pricing || {}
        const newPricing = {
          basePrice: parseFloat(priceData.basePrice) || 0,
          unitPrice: parseFloat(priceData.unitPrice) || 0,
          currency: priceData.currency || 'INR',
          margin: parseFloat(priceData.margin) || 0,
          marginPercentage: parseFloat(priceData.marginPercentage) || 0,
          cgst: parseFloat(priceData.cgst) || 0,
          sgst: parseFloat(priceData.sgst) || 0,
          igst: parseFloat(priceData.igst) || 0,
          tax: parseFloat(priceData.tax) || 0,
          totalPrice: parseFloat(priceData.totalPrice) || 0
        }
        
        // Only include pricing if it has changed
        const pricingChanged = Object.keys(newPricing).some(key => 
          newPricing[key] !== (currentPricing[key] || 0)
        )
        
        if (pricingChanged) {
          updatePayload.pricing = newPricing
        }
        
        // Check warehouse changes (if warehouses are being managed)
        if (selectedWarehouses.length > 0) {
          updatePayload.warehouses = selectedWarehouses
        }
        
        // Check vendor changes
        if (formData.vendorId !== item.vendorId) {
          updatePayload.vendorId = formData.vendorId
        }
        
        // Only proceed if there are changes
        if (Object.keys(updatePayload).length === 0) {
          setError('No changes detected to update')
          return
        }
        
        response = await inventoryService.updateInventoryItem(item._id, updatePayload)
      } else {
        // For new items, send complete payload
        const itemPayload = {
          // Basic info
          itemDescription: formData.itemDescription,
          category: formData.category,
          subCategory: formData.subCategory,
          grade: formData.grade,
          units: formData.units,
          details: formData.details,
          specification: formData.specification,
          
          // Pricing info (direct in inventory model)
          pricing: {
            basePrice: parseFloat(priceData.basePrice) || 0,
            unitPrice: parseFloat(priceData.unitPrice) || 0,
            currency: priceData.currency || 'INR',
            margin: parseFloat(priceData.margin) || 0,
            marginPercentage: parseFloat(priceData.marginPercentage) || 0,
            cgst: parseFloat(priceData.cgst) || 0,
            sgst: parseFloat(priceData.sgst) || 0,
            igst: parseFloat(priceData.igst) || 0,
            tax: parseFloat(priceData.tax) || 0,
            totalPrice: parseFloat(priceData.totalPrice) || 0
          },
          
          // Warehouse selection (optional for now)
          warehouses: selectedWarehouses.length > 0 ? selectedWarehouses : [],
          
          // Vendor (optional)
          ...(formData.vendorId && { vendorId: formData.vendorId })
        }
        
        response = await inventoryService.createInventoryItem(itemPayload)
      }

      // Auto-refresh the inventory list
      await onSubmit()
      onClose()
    } catch (err) {
      console.error('Submission error:', err)
      
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
        setError(err.response?.data?.message || 'An error occurred while saving the item')
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

  if (!isOpen) return null

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? 'Edit Inventory Item' : 'Create New Inventory Item'}
            </h2>
            {isEditMode && item && (
              <div className="mt-1">
                <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                  {generateInventoryCode(item.category, item._id)}
                </span>
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {initialLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        ) : (
          <>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Required</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Item Description */}
                <div className="space-y-2">
                  <Label htmlFor="itemDescription" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Item Description <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="itemDescription"
                    value={formData.itemDescription}
                    onChange={(e) => handleInputChange('itemDescription', e.target.value)}
                    required
                    placeholder="e.g., UltraTech PPC Cement 50kg Bag"
                    className={fieldErrors.itemDescription ? 'border-red-500' : ''}
                  />
                  {renderFieldError('itemDescription')}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className={fieldErrors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(categories).length > 0 ? (
                        Object.keys(categories).map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-categories" disabled>No categories available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {renderFieldError('category')}
                </div>

                {/* Sub Category */}
                <div className="space-y-2">
                  <Label htmlFor="subCategory" className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Sub Category
                  </Label>
                  <Select value={formData.subCategory} onValueChange={(value) => handleInputChange('subCategory', value)}>
                    <SelectTrigger className={fieldErrors.subCategory ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select sub category" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map(subCategory => (
                        <SelectItem key={subCategory} value={subCategory}>{subCategory}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {renderFieldError('subCategory')}
                </div>

                {/* Grade */}
                <div className="space-y-2">
                  <Label htmlFor="grade" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Grade
                  </Label>
                  <Input
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    placeholder="e.g., 43 Grade, 53 Grade"
                  />
                </div>

                {/* Units */}
                <div className="space-y-2">
                  <Label htmlFor="units" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Units <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.units} onValueChange={(value) => handleInputChange('units', value)}>
                    <SelectTrigger className={fieldErrors.units ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select units" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BAG">BAG</SelectItem>
                      <SelectItem value="TON">TON</SelectItem>
                      <SelectItem value="KG">KG</SelectItem>
                      <SelectItem value="PIECE">PIECE</SelectItem>
                      <SelectItem value="CUBIC_METER">CUBIC METER</SelectItem>
                      <SelectItem value="SQUARE_METER">SQUARE METER</SelectItem>
                    </SelectContent>
                  </Select>
                  {renderFieldError('units')}
                </div>

                {/* HSC Code */}
                <div className="space-y-2">
                  <Label htmlFor="hscCode" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    HSC Code
                  </Label>
                  <Input
                    id="hscCode"
                    value={formData.hscCode}
                    onChange={(e) => handleInputChange('hscCode', e.target.value)}
                    placeholder="e.g., 25232900"
                  />
                </div>

                {/* Vendor (optional) */}
                <div className="space-y-2">
                  <Label htmlFor="vendorId" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Vendor <span className="text-gray-400 font-normal">(Optional)</span>
                  </Label>
                  <Select value={formData.vendorId || 'none'} onValueChange={(value) => handleInputChange('vendorId', value === 'none' ? '' : value)}>
                    <SelectTrigger className={fieldErrors.vendorId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select vendor (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No vendor</SelectItem>
                      {vendors.length > 0 ? (
                        vendors.map(vendor => (
                        <SelectItem key={vendor._id} value={vendor._id}>
                          {vendor.companyName || vendor.name}
                        </SelectItem>
                        ))
                      ) : null}
                    </SelectContent>
                  </Select>
                  {renderFieldError('vendorId')}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <Label htmlFor="details" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Details
                </Label>
                <Textarea
                  id="details"
                  value={formData.details}
                  onChange={(e) => handleInputChange('details', e.target.value)}
                  placeholder="Detailed product information..."
                  rows={3}
                />
              </div>

              {/* Specification */}
              <div className="space-y-2">
                <Label htmlFor="specification" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Specification
                </Label>
                <Textarea
                  id="specification"
                  value={formData.specification}
                  onChange={(e) => handleInputChange('specification', e.target.value)}
                  placeholder="Technical specifications..."
                  rows={3}
                />
              </div>

              {/* Delivery Information */}
              <div className="space-y-2">
                <Label htmlFor="deliveryInformation" className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Delivery Information
                </Label>
                <Textarea
                  id="deliveryInformation"
                  value={formData.deliveryInformation}
                  onChange={(e) => handleInputChange('deliveryInformation', e.target.value)}
                  placeholder="Delivery terms and information..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Information
                <Badge variant="secondary" className="bg-green-100 text-green-800">Required</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="basePrice" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Base Price (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="basePrice"
                    type="number"
                    value={priceData.basePrice}
                    onChange={(e) => handlePriceChange('basePrice', e.target.value)}
                    placeholder="e.g., 300"
                    required
                    className={fieldErrors.basePrice ? 'border-red-500' : ''}
                  />
                  {renderFieldError('basePrice')}
                    </div>

                <div className="space-y-2">
                  <Label htmlFor="unitPrice" className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Unit Price (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    value={priceData.unitPrice}
                    onChange={(e) => handlePriceChange('unitPrice', e.target.value)}
                    placeholder="e.g., 350"
                    required
                    className={fieldErrors.unitPrice ? 'border-red-500' : ''}
                  />
                  {renderFieldError('unitPrice')}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="margin">Margin (₹)</Label>
                  <Input
                    id="margin"
                    type="number"
                    value={priceData.margin}
                    onChange={(e) => handlePriceChange('margin', e.target.value)}
                    placeholder="e.g., 50"
                    className={fieldErrors.margin ? 'border-red-500' : ''}
                  />
                  {renderFieldError('margin')}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marginPercentage">Margin Percentage (%)</Label>
                  <Input
                    id="marginPercentage"
                    type="number"
                    step="0.01"
                    value={priceData.marginPercentage}
                    onChange={(e) => handlePriceChange('marginPercentage', e.target.value)}
                    placeholder="e.g., 16.67"
                    className={fieldErrors.marginPercentage ? 'border-red-500' : ''}
                  />
                  {renderFieldError('marginPercentage')}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cgst">CGST (%)</Label>
                  <Input
                    id="cgst"
                    type="number"
                    value={priceData.cgst}
                    onChange={(e) => handlePriceChange('cgst', e.target.value)}
                    placeholder="e.g., 9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sgst">SGST (%)</Label>
                  <Input
                    id="sgst"
                    type="number"
                    value={priceData.sgst}
                    onChange={(e) => handlePriceChange('sgst', e.target.value)}
                    placeholder="e.g., 9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="igst">IGST (%)</Label>
                  <Input
                    id="igst"
                    type="number"
                    value={priceData.igst}
                    onChange={(e) => handlePriceChange('igst', e.target.value)}
                    placeholder="e.g., 0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalPrice">Total Price (₹)</Label>
                  <Input
                    id="totalPrice"
                    type="number"
                    value={priceData.totalPrice}
                    onChange={(e) => handlePriceChange('totalPrice', e.target.value)}
                    placeholder="e.g., 413"
                    readOnly
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Calculated automatically</p>
              </div>
              </div>
            </CardContent>
          </Card>

          {/* Warehouse Selection Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Warehouse Selection
              </CardTitle>
              <p className="text-sm text-gray-600">Select warehouses where this item will be available</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {warehouses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No warehouses available. Please create vendors with warehouses first.</p>
                    </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {warehouses.map((warehouse) => (
                      <div key={warehouse.vendorId} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {warehouse.warehouse.warehouseName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {warehouse.companyName} - {warehouse.vendorName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {warehouse.warehouse.location.city}, {warehouse.warehouse.location.state}
                            </p>
                            <div className="mt-2">
                              <div className="flex flex-wrap gap-1">
                                {warehouse.warehouse.categories.map((category) => (
                                  <Badge key={category} variant="outline" className="text-xs">
                                    {category}
                                  </Badge>
                                ))}
                      </div>
                    </div>
                            <div className="mt-2 text-xs text-gray-500">
                              <p>Base Charge: ₹{warehouse.warehouse.deliveryConfig.baseDeliveryCharge}</p>
                              <p>Per KM: ₹{warehouse.warehouse.deliveryConfig.perKmCharge}</p>
                              <p>Min Order: ₹{warehouse.warehouse.deliveryConfig.minimumOrder}</p>
                  </div>
                          </div>
                          <div className="ml-4 flex flex-col gap-2">
                            <input
                              type="checkbox"
                              id={`warehouse-${warehouse.vendorId}`}
                              checked={selectedWarehouses.some(w => w.warehouseId === warehouse.vendorId)}
                              onChange={(e) => handleWarehouseSelection(warehouse.vendorId, e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleUpdateWarehouse(warehouse)}
                              className="text-xs bg-black hover:bg-gray-800 text-white"
                            >
                              Update
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
              
                {selectedWarehouses.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">
                      Selected Warehouses ({selectedWarehouses.length})
                    </h5>
                    <div className="space-y-2">
                      {selectedWarehouses.map((warehouse) => (
                        <div key={warehouse.warehouseId} className="flex items-center justify-between text-sm">
                          <span className="text-blue-800">{warehouse.warehouseName}</span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Active
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Section (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Information
                <Badge variant="outline" className="text-gray-600">Optional</Badge>
              </CardTitle>
              <p className="text-sm text-gray-600">You can add shipping details now or update them later</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price0to50k" className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Price 0-50K (₹)
                  </Label>
                  <Input
                    id="price0to50k"
                    type="number"
                    value={shippingData.price0to50k}
                    onChange={(e) => handleShippingChange('price0to50k', e.target.value)}
                    placeholder="e.g., 500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price50kto100k">Price 50K-100K (₹)</Label>
                  <Input
                    id="price50kto100k"
                    type="number"
                    value={shippingData.price50kto100k}
                    onChange={(e) => handleShippingChange('price50kto100k', e.target.value)}
                    placeholder="e.g., 800"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price100kto150k">Price 100K-150K (₹)</Label>
                  <Input
                    id="price100kto150k"
                    type="number"
                    value={shippingData.price100kto150k}
                    onChange={(e) => handleShippingChange('price100kto150k', e.target.value)}
                    placeholder="e.g., 1200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price150kto200k">Price 150K-200K (₹)</Label>
                  <Input
                    id="price150kto200k"
                    type="number"
                    value={shippingData.price150kto200k}
                    onChange={(e) => handleShippingChange('price150kto200k', e.target.value)}
                    placeholder="e.g., 1500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceAbove200k">Price Above 200K (₹)</Label>
                  <Input
                    id="priceAbove200k"
                    type="number"
                    value={shippingData.priceAbove200k}
                    onChange={(e) => handleShippingChange('priceAbove200k', e.target.value)}
                    placeholder="e.g., 2000"
                  />
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Promo Section (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Promo Details
                <Badge variant="outline" className="text-gray-600">Optional</Badge>
              </CardTitle>
              <p className="text-sm text-gray-600">You can add promotional offers now or create them later</p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="promoName">Promo Name</Label>
                    <Input
                      id="promoName"
                      value={promoData.promoName}
                      onChange={(e) => handlePromoChange('promoName', e.target.value)}
                      placeholder="e.g., Monsoon Special"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={promoData.discount}
                      onChange={(e) => handlePromoChange('discount', e.target.value)}
                      placeholder="e.g., 10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountType">Discount Type</Label>
                    <Select value={promoData.discountType} onValueChange={(value) => handlePromoChange('discountType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minOrderValue">Min Order Value (₹)</Label>
                    <Input
                      id="minOrderValue"
                      type="number"
                      value={promoData.minOrderValue}
                      onChange={(e) => handlePromoChange('minOrderValue', e.target.value)}
                      placeholder="e.g., 100000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxDiscountAmount">Max Discount Amount (₹)</Label>
                    <Input
                      id="maxDiscountAmount"
                      type="number"
                      value={promoData.maxDiscountAmount}
                      onChange={(e) => handlePromoChange('maxDiscountAmount', e.target.value)}
                      placeholder="e.g., 5000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usageLimit">Usage Limit</Label>
                    <Input
                      id="usageLimit"
                      type="number"
                      value={promoData.usageLimit}
                      onChange={(e) => handlePromoChange('usageLimit', e.target.value)}
                      placeholder="e.g., 100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={promoData.startDate}
                      onChange={(e) => handlePromoChange('startDate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={promoData.endDate}
                      onChange={(e) => handlePromoChange('endDate', e.target.value)}
                    />
                  </div>
                </div>
            </CardContent>
          </Card>

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

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditMode ? 'Update Item' : 'Create Item')}
            </Button>
          </div>
        </form>
          </>
        )}
      </div>
    </div>

    {/* Warehouse Update Modal */}
    <WarehouseUpdateModal
      isOpen={showWarehouseUpdateModal}
      onClose={() => {
        setShowWarehouseUpdateModal(false)
        setSelectedWarehouseForUpdate(null)
      }}
      warehouse={selectedWarehouseForUpdate}
      onUpdate={handleWarehouseUpdateSuccess}
    />
    </>
  )
}

export default InventoryModal