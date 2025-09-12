import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const InventoryModal = ({ isOpen, onClose, onSubmit, editingItem, isEditMode = false }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: '',
    subcategory: '',
    grade: '',
    quantity: '',
    unit: '',
    unitPrice: '',
    discountCode: '',
    discountPercentage: '',
    tieredPricing: {
      '0-50K': '',
      '50-100K': '',
      '100-150K': '',
      '150-200K': '',
      '>200K': ''
    },
    supplier: '',
    details: '',
    specification: '',
    deliveryInfo: '',
    image: '',
    status: 'In Stock'
  })

  useEffect(() => {
    if (editingItem && isEditMode) {
      setFormData({
        id: editingItem.id,
        name: editingItem.name,
        category: editingItem.category,
        subcategory: editingItem.subcategory || '',
        grade: editingItem.grade || '',
        quantity: editingItem.quantity.toString(),
        unit: editingItem.unit,
        unitPrice: editingItem.unitPrice.toString(),
        discountCode: editingItem.discountCode || '',
        discountPercentage: editingItem.discountPercentage || '',
        tieredPricing: {
          '0-50K': editingItem.tieredPricing['0-50K'].toString(),
          '50-100K': editingItem.tieredPricing['50-100K'].toString(),
          '100-150K': editingItem.tieredPricing['100-150K'].toString(),
          '150-200K': editingItem.tieredPricing['150-200K'].toString(),
          '>200K': editingItem.tieredPricing['>200K'].toString()
        },
        supplier: editingItem.supplier,
        details: editingItem.details || '',
        specification: editingItem.specification || '',
        deliveryInfo: editingItem.deliveryInfo || '',
        image: editingItem.image || '',
        status: editingItem.status
      })
    } else {
      // Reset form for new item
      setFormData({
        id: '',
        name: '',
        category: '',
        subcategory: '',
        grade: '',
        quantity: '',
        unit: '',
        unitPrice: '',
        discountCode: '',
        discountPercentage: '',
        tieredPricing: {
          '0-50K': '',
          '50-100K': '',
          '100-150K': '',
          '150-200K': '',
          '>200K': ''
        },
        supplier: '',
        details: '',
        specification: '',
        deliveryInfo: '',
        image: '',
        status: 'In Stock'
      })
    }
  }, [editingItem, isEditMode, isOpen])

  const getUnitPlaceholder = (category) => {
    switch (category) {
      case 'Cement':
        return 'e.g., 500 bags'
      case 'Steel':
        return 'e.g., 2 tons'
      case 'Concrete Mix':
        return 'e.g., 10 cubic meters'
      default:
        return 'e.g., 100 pieces'
    }
  }

  const handleFormChange = (field, value) => {
    if (field.startsWith('tieredPricing.')) {
      const tier = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        tieredPricing: {
          ...prev.tieredPricing,
          [tier]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Update Item' : 'Add New Item'}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item ID / SKU</label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => handleFormChange('id', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Image URL</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => handleFormChange('image', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {formData.image && (
                <div className="mt-2">
                  <img 
                    src={formData.image} 
                    alt="Product preview"
                    className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sub Category</label>
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) => handleFormChange('subcategory', e.target.value)}
                placeholder="e.g., Portland Cement, TMT Bars"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
              <input
                type="text"
                value={formData.grade}
                onChange={(e) => handleFormChange('grade', e.target.value)}
                placeholder="e.g., OPC 53, Fe 500"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => handleFormChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                <option value="Cement">Cement</option>
                <option value="Steel">Steel</option>
                <option value="Concrete Mix">Concrete Mix</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity in Stock</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleFormChange('quantity', e.target.value)}
                placeholder={getUnitPlaceholder(formData.category)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => handleFormChange('unit', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Unit</option>
                <option value="bags">Bags</option>
                <option value="tons">Tons</option>
                <option value="cubic meters">Cubic Meters</option>
                <option value="kg">Kilograms</option>
                <option value="pieces">Pieces</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price (₹)</label>
              <input
                type="number"
                value={formData.unitPrice}
                onChange={(e) => handleFormChange('unitPrice', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount Code</label>
              <input
                type="text"
                value={formData.discountCode}
                onChange={(e) => handleFormChange('discountCode', e.target.value)}
                placeholder="e.g., SAVE10, BULK20"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount Percentage</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.discountPercentage}
                onChange={(e) => handleFormChange('discountPercentage', e.target.value)}
                placeholder="e.g., 10.5"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => handleFormChange('supplier', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleFormChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Details</label>
                <textarea
                  value={formData.details}
                  onChange={(e) => handleFormChange('details', e.target.value)}
                  placeholder="Detailed product information..."
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Specification</label>
                <textarea
                  value={formData.specification}
                  onChange={(e) => handleFormChange('specification', e.target.value)}
                  placeholder="Technical specifications..."
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Information</label>
                <textarea
                  value={formData.deliveryInfo}
                  onChange={(e) => handleFormChange('deliveryInfo', e.target.value)}
                  placeholder="Delivery terms, lead time, special requirements..."
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tiered Pricing (₹)</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">0-50K</label>
                <input
                  type="number"
                  value={formData.tieredPricing['0-50K']}
                  onChange={(e) => handleFormChange('tieredPricing.0-50K', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">50-100K</label>
                <input
                  type="number"
                  value={formData.tieredPricing['50-100K']}
                  onChange={(e) => handleFormChange('tieredPricing.50-100K', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">100-150K</label>
                <input
                  type="number"
                  value={formData.tieredPricing['100-150K']}
                  onChange={(e) => handleFormChange('tieredPricing.100-150K', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">150-200K</label>
                <input
                  type="number"
                  value={formData.tieredPricing['150-200K']}
                  onChange={(e) => handleFormChange('tieredPricing.150-200K', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">&gt;200K</label>
                <input
                  type="number"
                  value={formData.tieredPricing['>200K']}
                  onChange={(e) => handleFormChange('tieredPricing.>200K', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isEditMode ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InventoryModal
