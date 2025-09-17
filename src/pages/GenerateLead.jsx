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
    subcategory: '',
    grade: '',
    quantity: '',
    unit: '',
    estimatedPrice: '',
    customerName: '',
    customerContact: '',
    preferredDeliveryDate: '',
    deliveryAddress: '',
    deliveryPincode: '',
    receiverPhoneNumber: '',
    paymentType: 'RTGS',
    notes: '',
    remarks: ''
  })

  const [charCount, setCharCount] = useState(0)

  const getQuantityPlaceholder = (category) => {
    switch (category) {
      case 'cement':
        return 'e.g., 500 bags'
      case 'steel':
        return 'e.g., 2 tons'
      case 'concrete_mix':
        return 'e.g., 10 cubic meters'
      default:
        return 'e.g., 500 bags'
    }
  }

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
                    <SelectItem value="concrete_mix">Concrete Mix</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sub Category */}
              <div>
                <Label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-2">
                  Sub Category
                </Label>
                <Input
                  id="subcategory"
                  placeholder="e.g., Portland Cement, TMT Bars"
                  value={formData.subcategory}
                  onChange={(e) => handleInputChange('subcategory', e.target.value)}
                />
              </div>

              {/* Grade */}
              <div>
                <Label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                  Grade
                </Label>
                <Input
                  id="grade"
                  placeholder="e.g., OPC 53, Fe 500"
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                />
              </div>

              {/* Quantity */}
              <div>
                <Label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  placeholder={getQuantityPlaceholder(formData.category)}
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  required
                />
              </div>

              {/* Unit */}
              <div>
                <Label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </Label>
                <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bags">Bags</SelectItem>
                    <SelectItem value="tons">Tons</SelectItem>
                    <SelectItem value="cubic meters">Cubic Meters</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                  </SelectContent>
                </Select>
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

              {/* Delivery Pincode */}
              <div>
                <Label htmlFor="deliveryPincode" className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Pincode
                </Label>
                <Input
                  id="deliveryPincode"
                  type="text"
                  placeholder="e.g., 110001"
                  value={formData.deliveryPincode}
                  onChange={(e) => handleInputChange('deliveryPincode', e.target.value)}
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                />
              </div>

              {/* Receiver Phone Number */}
              <div>
                <Label htmlFor="receiverPhoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Receiver Phone Number
                </Label>
                <Input
                  id="receiverPhoneNumber"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.receiverPhoneNumber}
                  onChange={(e) => handleInputChange('receiverPhoneNumber', e.target.value)}
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
                    <SelectItem value="BankTransfer">Bank Transfer</SelectItem>
                    <SelectItem value="NetBanking">Net Banking</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="CreditCard">Credit Card</SelectItem>
                    <SelectItem value="DebitCard">Debit Card</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="DemandDraft">Demand Draft</SelectItem>
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

              {/* Remarks */}
              <div className="md:col-span-2">
                <Label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </Label>
                <Textarea
                  id="remarks"
                  placeholder="Add any remarks or special instructions that can be edited at any time"
                  rows={3}
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Editable field for ongoing updates and remarks</p>
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
