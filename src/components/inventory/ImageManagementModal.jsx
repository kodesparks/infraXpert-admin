import { useState, useEffect } from 'react'
import { X, Upload, Image as ImageIcon, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import inventoryService from '@/services/inventoryService'

const ImageManagementModal = ({ 
  isOpen, 
  onClose, 
  item 
}) => {
  const [images, setImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  // Load existing images when modal opens
  useEffect(() => {
    if (isOpen && item?._id) {
      loadImages()
    }
  }, [isOpen, item])

  const loadImages = async () => {
    try {
      setLoading(true)
      const response = await inventoryService.getImages(item._id)
      setImages(response.images || [])
    } catch (error) {
      console.error('Error loading images:', error)
      setError('Failed to load images')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    setNewImages(prev => [...prev, ...files])
    setError('')
  }

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async () => {
    if (newImages.length === 0) return

    try {
      setUploading(true)
      setError('')
      
      const response = await inventoryService.uploadImages(item._id, newImages)
      
      // Replace the images list with the complete updated list from API
      setImages(response.inventory.images)
      setNewImages([])
      
      // Show success message
      console.log(`Successfully uploaded ${response.addedImages} images`)
    } catch (error) {
      console.error('Error uploading images:', error)
      setError('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const setPrimaryImage = async (imageKey) => {
    try {
      const response = await inventoryService.setPrimaryImage(item._id, imageKey)
      
      // Update local state with the complete updated images array from API
      setImages(response.inventory.images)
    } catch (error) {
      console.error('Error setting primary image:', error)
      setError('Failed to set primary image')
    }
  }

  const removeImage = async (imageKey) => {
    try {
      const response = await inventoryService.removeImage(item._id, imageKey)
      
      // Update local state with the complete updated images array from API
      setImages(response.inventory.images)
    } catch (error) {
      console.error('Error removing image:', error)
      setError('Failed to remove image')
    }
  }

  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Manage Images</h2>
            <p className="text-sm text-gray-600 mt-1">{item.itemDescription}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Upload New Images */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New Images</h3>
            <div className="space-y-4">
              <div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maximum 10 files, 5MB each. Only image files allowed.
                </p>
              </div>

              {/* New Images Preview */}
              {newImages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">New Images to Upload</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {newImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={uploadImages}
                    disabled={uploading}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Uploading...' : `Upload ${newImages.length} Image${newImages.length !== 1 ? 's' : ''}`}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Existing Images */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Existing Images</h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={image.originalName}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    
                    {/* Primary Badge */}
                    {image.isPrimary && (
                      <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Primary
                      </Badge>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        {!image.isPrimary && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setPrimaryImage(image.key)}
                            className="h-8 w-8 p-0"
                            title="Set as Primary"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this image?')) {
                              removeImage(image.key)
                            }
                          }}
                          className="h-8 w-8 p-0"
                          title="Delete Image"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Image Info */}
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 truncate">{image.originalName}</p>
                      <p className="text-xs text-gray-500">
                        {(image.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No images uploaded yet</p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageManagementModal
