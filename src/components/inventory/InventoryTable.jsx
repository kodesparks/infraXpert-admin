import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Trash2, Image as ImageIcon, Package, Building, RotateCcw } from 'lucide-react'
import { generateInventoryCode } from '@/utils/inventoryUtils'

const InventoryTable = ({ 
  items, 
  onEdit, 
  onDelete, 
  onReactivate,
  onManageImages,
  currentUserRole 
}) => {
  const [loading, setLoading] = useState({})

  const getCategoryBadge = (category) => {
    const categoryColors = {
      'Cement': 'bg-blue-100 text-blue-800',
      'Iron': 'bg-gray-100 text-gray-800',
      'Concrete Mixer': 'bg-orange-100 text-orange-800'
    }
    
    return (
      <Badge className={categoryColors[category] || 'bg-gray-100 text-gray-800'}>
        {category}
      </Badge>
    )
  }

  const getSubCategoryBadge = (subCategory) => {
    return (
      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
        {subCategory}
      </Badge>
    )
  }

  const getStatusBadge = (isActive) => {
    return (
      <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    )
  }

  const getGradeBadge = (grade) => {
    if (!grade) return null
    return (
      <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
        {grade}
      </Badge>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }


  const canManageItem = () => {
    return ['admin', 'manager'].includes(currentUserRole)
  }

  const handleAction = async (action, itemId) => {
    setLoading(prev => ({ ...prev, [itemId]: true }))
    try {
      await action(itemId)
    } catch (error) {
      console.error('Error performing action:', error)
    } finally {
      setLoading(prev => ({ ...prev, [itemId]: false }))
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Units</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Images</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item._id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-gray-900">{item.itemDescription}</div>
                    <div 
                      className="text-sm text-gray-500 font-mono cursor-help" 
                      title={`Inventory Code: ${generateInventoryCode(item.category, item._id)} | MongoDB ID: ${item._id}`}
                    >
                      {generateInventoryCode(item.category, item._id)}
                    </div>
                    <div className="flex items-center gap-2">
                      {getSubCategoryBadge(item.subCategory)}
                      {getGradeBadge(item.grade)}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  {getCategoryBadge(item.category)}
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.vendorId?.companyName || item.vendorId?.name}
                      </div>
                      <div className="text-xs text-gray-500">{item.vendorId?.email}</div>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{item.units}</span>
                  </div>
                </TableCell>
                
                <TableCell>
                  {getStatusBadge(item.isActive)}
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {item.images?.length || 0} image{(item.images?.length || 0) !== 1 ? 's' : ''}
                    </span>
                    {item.primaryImage && (
                      <div className="w-8 h-8 rounded border overflow-hidden">
                        <img 
                          src={item.primaryImage} 
                          alt="Primary" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm text-gray-500">
                    {formatDate(item.createdAt)}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-1">
                    {canManageItem() && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(item)}
                          className="h-8 w-8 p-0"
                          title="Edit Item"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onManageImages(item)}
                          className="h-8 w-8 p-0"
                          title="Manage Images"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                        
                        {item.isActive ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to deactivate this item? This will make it unavailable for orders.')) {
                                handleAction(() => onDelete(item._id), item._id)
                              }
                            }}
                            disabled={loading[item._id]}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                            title="Deactivate Item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to reactivate this item? This will make it available for orders again.')) {
                                handleAction(() => onReactivate(item._id), item._id)
                              }
                            }}
                            disabled={loading[item._id]}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-800"
                            title="Reactivate Item"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default InventoryTable
