import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const GenerateLead = () => {
  const [formData, setFormData] = useState({
    category: 'cement',
    quantity: '',
    estimatedPrice: '',
    customerName: '',
    customerContact: '',
    preferredDeliveryDate: '',
    deliveryAddress: '',
    paymentType: 'RTGS',
    notes: ''
  })

  const [charCount, setCharCount] = useState(0)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (field === 'notes') {
      setCharCount(value.length)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Handle form submission here
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-xl font-semibold text-gray-900">Generate New Lead</CardTitle>
            <p className="text-gray-600 mt-1">Create a new order lead for cement or steel products</p>
          </CardHeader>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <Label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cement">Cement</SelectItem>
                    <SelectItem value="steel">Steel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div>
                <Label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  placeholder="e.g., 500 bags, 2 tons"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  required
                />
              </div>

              {/* Estimated Price */}
              <div>
                <Label htmlFor="estimatedPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Price
                </Label>
                <Input
                  id="estimatedPrice"
                  placeholder="₹25,000"
                  value={formData.estimatedPrice}
                  onChange={(e) => handleInputChange('estimatedPrice', e.target.value)}
                  required
                />
              </div>

              {/* Customer Name */}
              <div>
                <Label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  required
                />
              </div>

              {/* Customer Contact */}
              <div>
                <Label htmlFor="customerContact" className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Contact
                </Label>
                <Input
                  id="customerContact"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.customerContact}
                  onChange={(e) => handleInputChange('customerContact', e.target.value)}
                  required
                />
              </div>

              {/* Preferred Delivery Date */}
              <div>
                <Label htmlFor="preferredDeliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Delivery Date
                </Label>
                <Input
                  id="preferredDeliveryDate"
                  type="date"
                  value={formData.preferredDeliveryDate}
                  onChange={(e) => handleInputChange('preferredDeliveryDate', e.target.value)}
                  required
                />
              </div>

              {/* Delivery Address */}
              <div className="md:col-span-2">
                <Label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address
                </Label>
                <Textarea
                  id="deliveryAddress"
                  placeholder="Enter complete delivery address"
                  rows={3}
                  value={formData.deliveryAddress}
                  onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                  required
                />
              </div>

              {/* Payment Type */}
              <div>
                <Label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Type
                </Label>
                <Select value={formData.paymentType} onValueChange={(value) => handleInputChange('paymentType', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RTGS">RTGS</SelectItem>
                    <SelectItem value="NEFT">NEFT</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Notes */}
              <div className="md:col-span-2">
                <Label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional requirements or notes"
                  rows={3}
                  maxLength={500}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">{charCount}/500 characters</p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 flex justify-end space-x-4">
              <Link to="/orders">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Generate Lead
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default GenerateLead
