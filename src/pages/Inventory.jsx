import { useState } from 'react'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import InventoryModal from '@/components/InventoryModal'

const Inventory = () => {
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all'
  })

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: '',
    quantity: '',
    unit: '',
    unitPrice: '',
    discount: '',
    supplier: '',
    status: 'In Stock',
    subcategory: '',
    grade: '',
    details: '',
    specification: '',
    deliveryInfo: '',
    image: '',
    tieredPricing: {
      '0-50K': '',
      '50-100K': '',
      '100-150K': '',
      '150-200K': '',
      '>200K': ''
    }
  })

  // Sample inventory data
  const inventoryItems = [
    {
      id: 'SKU001',
      name: 'Ultratech Cement',
      category: 'Cement',
      quantity: 150,
      unit: 'bags',
      unitPrice: 450,
      discount: 1,
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=100&h=100&fit=crop&crop=center',
      tieredPricing: {
        '0-50K': 3,
        '50-100K': 4,
        '100-150K': 5,
        '150-200K': 6,
        '>200K': 7
      },
      supplier: 'Cement Suppliers Ltd',
      lastUpdated: '1/15/2024',
      status: 'In Stock'
    },
    {
      id: 'SKU002',
      name: 'TMT Steel Bars 12mm',
      category: 'Steel',
      quantity: 5,
      unit: 'tons',
      unitPrice: 65000,
      discount: 2,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&crop=center',
      tieredPricing: {
        '0-50K': 62000,
        '50-100K': 61000,
        '100-150K': 60000,
        '150-200K': 59000,
        '>200K': 58000
      },
      supplier: 'Steel World Corp',
      lastUpdated: '1/14/2024',
      status: 'Low Stock'
    },
    {
      id: 'SKU003',
      name: 'Ready-Mix Concrete M25',
      category: 'Concrete Mix',
      quantity: 0,
      unit: 'cubic meters',
      unitPrice: 4500,
      discount: 0.5,
      image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=100&h=100&fit=crop&crop=center',
      tieredPricing: {
        '0-50K': 4500,
        '50-100K': 4400,
        '100-150K': 4300,
        '150-200K': 4200,
        '>200K': 4100
      },
      supplier: 'Concrete Solutions',
      lastUpdated: '1/10/2024',
      status: 'Out of Stock'
    },
    {
      id: 'SKU004',
      name: 'Construction Sand',
      category: 'Other',
      quantity: 25,
      unit: 'tons',
      unitPrice: 1200,
      discount: 0,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop&crop=center',
      tieredPricing: {
        '0-50K': 1200,
        '50-100K': 1180,
        '100-150K': 1160,
        '150-200K': 1140,
        '>200K': 1120
      },
      supplier: 'Sand & Gravel Co',
      lastUpdated: '1/12/2024',
      status: 'In Stock'
    }
  ]

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFormChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleAddItem = () => {
    setFormData({
      id: '',
      name: '',
      category: '',
      quantity: '',
      unit: '',
      unitPrice: '',
      discount: '',
      supplier: '',
      status: 'In Stock',
      subcategory: '',
      grade: '',
      details: '',
      specification: '',
      deliveryInfo: '',
      image: '',
      tieredPricing: {
        '0-50K': '',
        '50-100K': '',
        '100-150K': '',
        '150-200K': '',
        '>200K': ''
      }
    })
    setShowAddModal(true)
  }

  const handleEditItem = (item) => {
    setFormData({
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      discount: item.discount,
      supplier: item.supplier,
      status: item.status,
      subcategory: item.subcategory || '',
      grade: item.grade || '',
      details: item.details || '',
      specification: item.specification || '',
      deliveryInfo: item.deliveryInfo || '',
      tieredPricing: {
        '0-50K': item.tieredPricing['0-50K'],
        '50-100K': item.tieredPricing['50-100K'],
        '100-150K': item.tieredPricing['100-150K'],
        '150-200K': item.tieredPricing['150-200K'],
        '>200K': item.tieredPricing['>200K']
      }
    })
    setEditingItem(item)
    setShowEditModal(true)
  }

  const handleSubmit = (formData) => {
    // Here you would typically save to your backend
    console.log('Form submitted:', formData)
    setShowAddModal(false)
    setShowEditModal(false)
    setEditingItem(null)
  }

  const closeModals = () => {
    setShowAddModal(false)
    setShowEditModal(false)
    setEditingItem(null)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'In Stock': 'bg-green-100 text-green-800',
      'Low Stock': 'bg-orange-100 text-orange-800', 
      'Out of Stock': 'bg-red-100 text-red-800'
    }
    
    const className = statusConfig[status] || 'bg-gray-100 text-gray-800'
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${className}`}>
        {status}
      </span>
    )
  }

  const getCategoryBadge = (category) => {
    return (
      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
        {category}
      </span>
    )
  }

  // Filter inventory items based on current filters
  const filteredItems = inventoryItems.filter(item => {
    if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !item.id.toLowerCase().includes(filters.search.toLowerCase()) &&
        !item.category.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.category !== 'all' && item.category !== filters.category) return false
    if (filters.status !== 'all' && item.status !== filters.status) return false
    return true
  })

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-1">Manage your construction materials efficiently</p>
          </div>
          <button 
            onClick={handleAddItem}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap cursor-pointer font-medium"
          >
            <Plus className="h-4 w-4 mr-2 inline" />
            Add New Item
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Item Name, SKU, or Category..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select 
              value={filters.category} 
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Cement">Cement</option>
              <option value="Steel">Steel</option>
              <option value="Concrete Mix">Concrete Mix</option>
              <option value="Other">Other</option>
            </select>
            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Stock Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item ID / SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity in Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price (₹)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount (%)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">0-50K</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">50-100K</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">100-150K</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">150-200K</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">&gt;200K</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{item.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="font-medium">{item.quantity}</span>
                      <span className="text-gray-500 ml-1">{item.unit}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{item.unitPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.discount}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{item.tieredPricing['0-50K'].toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{item.tieredPricing['50-100K'].toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{item.tieredPricing['100-150K'].toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{item.tieredPricing['150-200K'].toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{item.tieredPricing['>200K'].toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.supplier}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.lastUpdated}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEditItem(item)}
                          className="text-blue-600 hover:text-blue-900 whitespace-nowrap cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 whitespace-nowrap cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No inventory items found matching the current filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Inventory Modal */}
      <InventoryModal
        isOpen={showAddModal || showEditModal}
        onClose={closeModals}
        onSubmit={handleSubmit}
        formData={formData}
        onFormChange={handleFormChange}
        isEditMode={showEditModal}
        editingItem={editingItem}
      />
    </div>
  )
}

export default Inventory