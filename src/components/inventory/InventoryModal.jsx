import { useState, useEffect } from 'react'
import { X, Package, Building, FileText, Tag, Truck, Percent } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import inventoryService from '@/services/inventoryService'

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
    unitPrice: '',
    margin: '',
    marginPercentage: '',
    cgst: 9,
    sgst: 9,
    igst: 0,
    tax: 18
  })

  const [shippingData, setShippingData] = useState({
    price0to50k: '',
    price50kto100k: '',
    price100kto150k: '',
    price150kto200k: '',
    priceAbove200k: ''
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
  const [activeTab, setActiveTab] = useState('basic')
  const [initialLoading, setInitialLoading] = useState(false)

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
      const [categoriesRes, vendorsRes] = await Promise.all([
        inventoryService.getAllCategories(),
        inventoryService.getVendors({ limit: 100 })
      ])
      
      setCategories(categoriesRes.categories)
      setVendors(vendorsRes.vendors || [])
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
  }

  const loadSubcategories = async (category) => {
    try {
      const response = await inventoryService.getSubcategories(category)
      setSubcategories(response.subCategories)
    } catch (error) {
      console.error('Error loading subcategories:', error)
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
          unitPrice: pricing.unitPrice || '',
          margin: pricing.margin || '',
          marginPercentage: pricing.marginPercentage || '',
          cgst: pricing.cgst || 9,
          sgst: pricing.sgst || 9,
          igst: pricing.igst || 0,
          tax: pricing.tax || 18
        })
      } else if (pricingResponse.status === 'rejected' && pricingResponse.reason?.response?.status === 404) {
        // No pricing data exists yet - this is normal for new items
        console.log('No pricing data found for this item - user can add it now')
      }

      // Load shipping data (404 is expected if no shipping data exists yet)
      if (shippingResponse.status === 'fulfilled' && shippingResponse.value.shipping) {
        const shipping = shippingResponse.value.shipping
        setShippingData({
          price0to50k: shipping.price0to50k || '',
          price50kto100k: shipping.price50kto100k || '',
          price100kto150k: shipping.price100kto150k || '',
          price150kto200k: shipping.price150kto200k || '',
          priceAbove200k: shipping.priceAbove200k || ''
        })
      } else if (shippingResponse.status === 'rejected' && shippingResponse.reason?.response?.status === 404) {
        // No shipping data exists yet - this is normal for new items
        console.log('No shipping data found for this item - user can add it now')
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
      } else {
        // No promo data exists yet - this is normal
        console.log('No promo data found for this item - user can add it now')
      }
    } catch (error) {
      console.error('Error loading item data:', error)
      // Don't show error to user as this is not critical for basic editing
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


  const removeUploadedImage = (imageKey) => {
    setUploadedImages(prev => prev.filter(img => img.key !== imageKey))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})

    try {
      let itemId
      
      if (isEditMode) {
        // Update existing item
        const response = await inventoryService.updateInventoryItem(item._id, formData)
        itemId = item._id
      } else {
        // Create new item
        const response = await inventoryService.createInventoryItem(formData)
        itemId = response.inventory._id
      }

      // Set pricing if provided
      if (priceData.unitPrice) {
        await inventoryService.createOrUpdatePrice({
          itemCode: itemId,
          ...priceData
        })
      }

      // Set shipping if provided
      if (shippingData.price0to50k) {
        await inventoryService.createOrUpdateShipping({
          itemCode: itemId,
          ...shippingData
        })
      }

      // Create promo if provided
      if (promoData.promoName && promoData.discount) {
        await inventoryService.createPromo({
          itemCode: itemId,
          ...promoData
        })
      }

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

  const getFieldIcon = (field) => {
    const icons = {
      itemDescription: Package,
      category: Tag,
      subCategory: Tag,
      grade: FileText,
      units: Package,
      details: FileText,
      specification: FileText,
      deliveryInformation: Truck,
      hscCode: FileText,
      vendorId: Building
    }
    return icons[field] || Package
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Edit Inventory Item' : 'Create New Inventory Item'}
          </h2>
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
        
        <form onSubmit={handleSubmit} className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Promo</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
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
                      {Object.keys(categories).map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
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

                {/* Vendor */}
                <div className="space-y-2">
                  <Label htmlFor="vendorId" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Vendor <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.vendorId} onValueChange={(value) => handleInputChange('vendorId', value)}>
                    <SelectTrigger className={fieldErrors.vendorId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map(vendor => (
                        <SelectItem key={vendor._id} value={vendor._id}>
                          {vendor.companyName || vendor.name}
                        </SelectItem>
                      ))}
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
            </TabsContent>


            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-6">
              {!priceData.unitPrice && !priceData.margin && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        No pricing data found
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>This item doesn't have pricing data yet. Fill in the pricing information below to create it.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="unitPrice" className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Unit Price (₹)
                  </Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    value={priceData.unitPrice}
                    onChange={(e) => handlePriceChange('unitPrice', e.target.value)}
                    placeholder="e.g., 350"
                  />
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
              </div>
            </TabsContent>

            {/* Shipping & Promo Tab */}
            <TabsContent value="shipping" className="space-y-6">
              {!shippingData.price0to50k && !shippingData.price50kto100k && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        No shipping data found
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>This item doesn't have shipping data yet. Fill in the shipping prices below to create it.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
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

              {/* Promo Section */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Promo Details (Optional)</h4>
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
              </div>
            </TabsContent>
          </Tabs>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
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
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditMode ? 'Update Item' : 'Create Item')}
            </Button>
          </div>
        </form>
        )}
      </div>
    </div>
  )
}

export default InventoryModal
