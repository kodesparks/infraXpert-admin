import { useState, useEffect } from "react";
import { X, Clock, CheckCircle, Truck, MapPin, Package, DollarSign, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import orderService from "@/services/orderService";

const OrderDetailsModal = ({ isOpen, onClose, order, onOrderUpdate }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // details, payment, delivery, status

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paidAmount: '',
    paymentMethod: 'bank_transfer',
    transactionId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  // Delivery modal state
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    deliveryStatus: '',
    trackingNumber: '',
    courierService: '',
    expectedDeliveryDate: '',
    remarks: ''
  });

  // Status update state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusData, setStatusData] = useState({
    orderStatus: '',
    remarks: ''
  });

  // Cancel order state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelData, setCancelData] = useState({
    reason: '',
    remarks: ''
  });

  useEffect(() => {
    if (isOpen && order) {
      fetchOrderDetails();
    }
  }, [isOpen, order]);

  const fetchOrderDetails = async () => {
    if (!order || !order.leadId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getOrderById(order.leadId);
      setOrderDetails(response);

      // Set initial payment amount
      if (response.order && !paymentData.paidAmount) {
        setPaymentData(prev => ({
          ...prev,
          paidAmount: response.order.totalAmount
        }));
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaymentDone = async () => {
    try {
      setActionLoading(true);
      await orderService.markPaymentDone(order.leadId, paymentData);
      alert('Payment marked as done successfully!');
      setShowPaymentModal(false);
      await fetchOrderDetails();
      if (onOrderUpdate) onOrderUpdate();
    } catch (err) {
      console.error('Error marking payment:', err);
      alert(err.response?.data?.message || 'Failed to mark payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!window.confirm('Are you sure you want to confirm this order?')) return;

    try {
      setActionLoading(true);
      await orderService.confirmOrder(order.leadId, {
        remarks: 'Order confirmed by admin after payment verification'
      });
      alert('Order confirmed successfully!');
      await fetchOrderDetails();
      if (onOrderUpdate) onOrderUpdate();
    } catch (err) {
      console.error('Error confirming order:', err);
      alert(err.response?.data?.message || 'Failed to confirm order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setActionLoading(true);
      await orderService.updateOrderStatus(order.leadId, statusData);
      alert('Order status updated successfully!');
      setShowStatusModal(false);
      await fetchOrderDetails();
      if (onOrderUpdate) onOrderUpdate();
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateDelivery = async () => {
    try {
      setActionLoading(true);
      await orderService.updateDelivery(order.leadId, deliveryData);
      alert('Delivery information updated successfully!');
      setShowDeliveryModal(false);
      await fetchOrderDetails();
      if (onOrderUpdate) onOrderUpdate();
    } catch (err) {
      console.error('Error updating delivery:', err);
      alert(err.response?.data?.message || 'Failed to update delivery');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!window.confirm('Are you sure you want to mark this order as delivered?')) return;

    try {
      setActionLoading(true);
      await orderService.markAsDelivered(order.leadId, {
        deliveredDate: new Date().toISOString(),
        receivedBy: 'Customer',
        remarks: 'Order delivered successfully'
      });
      alert('Order marked as delivered successfully!');
      await fetchOrderDetails();
      if (onOrderUpdate) onOrderUpdate();
    } catch (err) {
      console.error('Error marking as delivered:', err);
      alert(err.response?.data?.message || 'Failed to mark as delivered');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelData.reason) {
      alert('Please provide a cancellation reason');
      return;
    }

    try {
      setActionLoading(true);
      await orderService.cancelOrder(order.leadId, cancelData);
      alert('Order cancelled successfully!');
      setShowCancelModal(false);
      await fetchOrderDetails();
      if (onOrderUpdate) onOrderUpdate();
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { className: 'bg-gray-100 text-gray-800' },
      vendor_accepted: { className: 'bg-blue-100 text-blue-800' },
      payment_done: { className: 'bg-purple-100 text-purple-800' },
      order_confirmed: { className: 'bg-orange-100 text-orange-800' },
      truck_loading: { className: 'bg-yellow-100 text-yellow-800' },
      in_transit: { className: 'bg-indigo-100 text-indigo-800' },
      shipped: { className: 'bg-cyan-100 text-cyan-800' },
      out_for_delivery: { className: 'bg-teal-100 text-teal-800' },
      delivered: { className: 'bg-green-100 text-green-800' },
      cancelled: { className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status] || { className: 'bg-gray-100 text-gray-800' };

    return (
      <Badge className={config.className}>
        {orderService.getStatusDisplayName(status)}
      </Badge>
    );
  };

  if (!isOpen || !order) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
            <div>
            <h3 className="text-xl font-semibold text-gray-900">
                Order Details - {orderDetails?.order?.formattedLeadId || order.formattedLeadId || order.leadId}
            </h3>
              <div className="flex items-center gap-2 mt-2">
                {orderDetails?.order?.orderStatus && getStatusBadge(orderDetails.order.orderStatus)}
                {orderDetails?.paymentInfo?.paymentStatus && (
                  <Badge className={orderDetails.paymentInfo.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    Payment: {orderDetails.paymentInfo.paymentStatus}
                  </Badge>
                )}
              </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading order details...</span>
                      </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
                        </div>
          ) : (
            <div className="p-6">
              {/* Tabs */}
              <div className="flex space-x-4 mb-6 border-b">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2 px-4 font-medium ${activeTab === 'details' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                >
                  Order Details
                </button>
                <button
                  onClick={() => setActiveTab('payment')}
                  className={`pb-2 px-4 font-medium ${activeTab === 'payment' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                >
                  Payment Info
                </button>
                <button
                  onClick={() => setActiveTab('status')}
                  className={`pb-2 px-4 font-medium ${activeTab === 'status' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                >
                  Status History
                </button>
          </div>

              {/* Tab Content */}
              {activeTab === 'details' && (
                <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Order Information */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900">Order Information</h4>
                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Lead ID:</span>
                          <span className="text-sm font-medium text-gray-900">{orderDetails?.order?.formattedLeadId}</span>
                  </div>
                  <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Invoice Number:</span>
                          <span className="text-sm font-medium text-gray-900">{orderDetails?.order?.invcNum}</span>
                  </div>
                  <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Order Date:</span>
                          <span className="text-sm font-medium text-gray-900">{formatDate(orderDetails?.order?.orderDate)}</span>
                  </div>
                  <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Quantity:</span>
                          <span className="text-sm font-medium text-gray-900">{orderDetails?.order?.totalQty}</span>
                  </div>
                  <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Amount:</span>
                          <span className="text-sm font-bold text-gray-900">{formatCurrency(orderDetails?.order?.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          {orderDetails?.order?.orderStatus && getStatusBadge(orderDetails.order.orderStatus)}
                  </div>
                  </div>
                  </div>

                    {/* Customer Information */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900">Customer Information</h4>
                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Name:</span>
                          <span className="text-sm font-medium text-gray-900">{orderDetails?.order?.custUserId?.name}</span>
                  </div>
                  <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Email:</span>
                          <span className="text-sm font-medium text-gray-900">{orderDetails?.order?.custUserId?.email}</span>
                  </div>
                  <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Phone:</span>
                          <span className="text-sm font-medium text-gray-900">{orderDetails?.order?.custUserId?.phone}</span>
                </div>
              </div>

                      <h4 className="text-lg font-medium text-gray-900 mt-4">Vendor Information</h4>
                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Name:</span>
                          <span className="text-sm font-medium text-gray-900">{orderDetails?.order?.vendorId?.name}</span>
                        </div>
                  <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Email:</span>
                          <span className="text-sm font-medium text-gray-900">{orderDetails?.order?.vendorId?.email}</span>
                  </div>
                  <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Company:</span>
                          <span className="text-sm font-medium text-gray-900">{orderDetails?.order?.vendorId?.companyName}</span>
                  </div>
                </div>
              </div>
            </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Order Items</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orderDetails?.order?.items?.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {item.itemCode?.itemDescription}
                                {item.itemCode?.primaryImage && (
                                  <img src={item.itemCode.primaryImage} alt="" className="w-12 h-12 object-cover rounded mt-1" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                <Badge className="bg-blue-100 text-blue-800">{item.itemCode?.category}</Badge>
                              </td>
                              <td className="px-4 py-3 text-sm text-right text-gray-900">{item.qty}</td>
                              <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(item.unitPrice)}</td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{formatCurrency(item.totalCost)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Delivery Address</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-900">{orderDetails?.order?.deliveryAddress}</p>
                      <p className="text-sm text-gray-600 mt-1">Pincode: {orderDetails?.order?.deliveryPincode}</p>
                      {orderDetails?.order?.deliveryExpectedDate && (
                        <p className="text-sm text-gray-600 mt-1">Expected Delivery: {formatDate(orderDetails.order.deliveryExpectedDate)}</p>
                    )}
                  </div>
                  </div>
                  </div>
              )}

              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Amount:</span>
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(orderDetails?.paymentInfo?.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Paid Amount:</span>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(orderDetails?.paymentInfo?.paidAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Payment Status:</span>
                        <Badge className={orderDetails?.paymentInfo?.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {orderDetails?.paymentInfo?.paymentStatus || 'Pending'}
                        </Badge>
                      </div>
                      {orderDetails?.paymentInfo?.paymentMethod && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Payment Method:</span>
                          <span className="text-sm font-medium text-gray-900">{orderDetails.paymentInfo.paymentMethod}</span>
                        </div>
                      )}
                      {orderDetails?.paymentInfo?.transactionId && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Transaction ID:</span>
                          <span className="text-sm font-medium text-gray-900">{orderDetails.paymentInfo.transactionId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {orderDetails?.paymentInfo?.paymentStatus !== 'completed' && orderDetails?.order?.orderStatus === 'vendor_accepted' && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-yellow-900">Payment Pending</h5>
                          <p className="text-sm text-yellow-700 mt-1">
                            Customer needs to complete payment. Once payment is received, mark it as done below.
                          </p>
                          <Button
                            onClick={() => setShowPaymentModal(true)}
                            className="mt-3 bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <DollarSign className="w-4 h-4 mr-2" />
                            Mark Payment Done
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'status' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Status History</h4>
                    <div className="space-y-4">
                      {orderDetails?.statusHistory?.map((history, index) => (
                        <div key={index} className="flex items-start border-l-2 border-blue-500 pl-4 py-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(history.orderStatus)}
                              <span className="text-xs text-gray-500">{formatDate(history.updateDate)}</span>
                            </div>
                            {history.remarks && (
                              <p className="text-sm text-gray-600 mt-1">{history.remarks}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t flex items-center justify-between">
                <div className="flex gap-3">
                  {orderDetails?.order?.orderStatus === 'payment_done' && (
                    <Button
                      onClick={handleConfirmOrder}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={actionLoading}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Order
                    </Button>
                  )}
                  {orderDetails?.order?.orderStatus !== 'delivered' && orderDetails?.order?.orderStatus !== 'cancelled' && (
                    <>
                      <Button
                        onClick={() => setShowStatusModal(true)}
                        variant="outline"
                      >
                        Update Status
                      </Button>
                      <Button
                        onClick={() => setShowCancelModal(true)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Cancel Order
                      </Button>
                    </>
                  )}
                </div>
                <Button onClick={onClose} variant="outline">
                  Close
                </Button>
              </div>
            </div>
                  )}
                </div>
              </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Mark Payment as Done</h3>
            <div className="space-y-4">
              <div>
                <Label>Paid Amount</Label>
                <Input
                  type="number"
                  value={paymentData.paidAmount}
                  onChange={(e) => setPaymentData({ ...paymentData, paidAmount: e.target.value })}
                />
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select value={paymentData.paymentMethod} onValueChange={(value) => setPaymentData({ ...paymentData, paymentMethod: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Transaction ID</Label>
                <Input
                  type="text"
                  value={paymentData.transactionId}
                  onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })}
                />
              </div>
              <div>
                <Label>Payment Date</Label>
                <Input
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Remarks</Label>
                <Textarea
                  value={paymentData.remarks}
                  onChange={(e) => setPaymentData({ ...paymentData, remarks: e.target.value })}
                  rows={3}
                />
                  </div>
                  </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleMarkPaymentDone} className="flex-1 bg-green-600 hover:bg-green-700" disabled={actionLoading}>
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Confirm Payment
              </Button>
              <Button onClick={() => setShowPaymentModal(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
                  </div>
                  </div>
                </div>
      )}

      {/* Delivery Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Update Delivery Information</h3>
            <div className="space-y-4">
              <div>
                <Label>Delivery Status</Label>
                <Select value={deliveryData.deliveryStatus} onValueChange={(value) => setDeliveryData({ ...deliveryData, deliveryStatus: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tracking Number</Label>
                <Input
                  type="text"
                  value={deliveryData.trackingNumber}
                  onChange={(e) => setDeliveryData({ ...deliveryData, trackingNumber: e.target.value })}
                />
              </div>
                <div>
                <Label>Courier Service</Label>
                <Input
                  type="text"
                  value={deliveryData.courierService}
                  onChange={(e) => setDeliveryData({ ...deliveryData, courierService: e.target.value })}
                  placeholder="e.g., Blue Dart, DTDC"
                />
                  </div>
              <div>
                <Label>Expected Delivery Date</Label>
                <Input
                  type="date"
                  value={deliveryData.expectedDeliveryDate}
                  onChange={(e) => setDeliveryData({ ...deliveryData, expectedDeliveryDate: e.target.value })}
                />
                </div>
              <div>
                <Label>Remarks</Label>
                <Textarea
                  value={deliveryData.remarks}
                  onChange={(e) => setDeliveryData({ ...deliveryData, remarks: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleUpdateDelivery} className="flex-1" disabled={actionLoading}>
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Truck className="w-4 h-4 mr-2" />}
                Update Delivery
              </Button>
              <Button onClick={() => setShowDeliveryModal(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Update Order Status</h3>
            <div className="space-y-4">
              <div>
                <Label>New Status</Label>
                <Select value={statusData.orderStatus} onValueChange={(value) => setStatusData({ ...statusData, orderStatus: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderService.getAllowedStatuses().map(status => (
                      <SelectItem key={status} value={status}>
                        {orderService.getStatusDisplayName(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Remarks</Label>
                <Textarea
                  value={statusData.remarks}
                  onChange={(e) => setStatusData({ ...statusData, remarks: e.target.value })}
                  rows={3}
                  placeholder="Enter reason for status change"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleUpdateStatus} className="flex-1" disabled={actionLoading}>
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Update Status
              </Button>
              <Button onClick={() => setShowStatusModal(false)} variant="outline" className="flex-1">
              Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Cancel Order</h3>
            <div className="space-y-4">
              <div>
                <Label>Cancellation Reason *</Label>
                <Input
                  type="text"
                  value={cancelData.reason}
                  onChange={(e) => setCancelData({ ...cancelData, reason: e.target.value })}
                  placeholder="e.g., Customer requested cancellation"
                />
              </div>
              <div>
                <Label>Additional Remarks</Label>
                <Textarea
                  value={cancelData.remarks}
                  onChange={(e) => setCancelData({ ...cancelData, remarks: e.target.value })}
                  rows={3}
                  placeholder="Any additional details..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleCancelOrder} className="flex-1 bg-red-600 hover:bg-red-700" disabled={actionLoading}>
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />}
                Cancel Order
              </Button>
              <Button onClick={() => setShowCancelModal(false)} variant="outline" className="flex-1">
                Go Back
              </Button>
        </div>
      </div>
    </div>
      )}
    </>
  );
};

export default OrderDetailsModal;
