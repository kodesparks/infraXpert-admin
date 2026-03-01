import { useState, useEffect } from "react";
import { X, Clock, CheckCircle, Truck, MapPin, Package, DollarSign, AlertCircle, Loader2, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import orderService from "@/services/orderService";
import OrderConfirmation from "./ConfirmOrder";
import { states } from "./Constants";

const OrderDetailsModal = ({ isOpen, onClose, order, onOrderUpdate }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
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

  // Delivery modal state (admin sees unmasked delivery object)
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    receiverName: "",
    receiverPhone: "",
    receiverEmail: "",
    receiverAddress: "",
    deliveryStatus: '',
    driverName: '',
    driverPhone: '',
    driverLicenseNo: '',
    truckNumber: '',
    vehicleType: '',
    capacityTons: '',
    startTime: '',
    estimatedArrival: '',
    lastLocation: { lat: '', lng: '', address: '' },
    deliveryNotes: ''
  });

  // Status update state (orderStatus + optional truck details per PUT .../status API)
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);

  const [statusData, setStatusData] = useState({
    orderStatus: '',
    remarks: '',
    driverName: '',
    driverPhone: '',
    driverLicenseNo: '',
    truckNumber: '',
    vehicleType: '',
    capacityTons: '',
    deliveryNotes: '',
    items: [],
    //Shipping Details
    shippingFullName: '',
    shippingPhoneNumber: '',
    shippingMail: '',
    shippingDeliveryAddress:'',
    shippingState: '',
    shippingPincode: ''
  });

  // Cancel order state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelData, setCancelData] = useState({
    reason: '',
    remarks: ''
  });

  // PDF download state (po | quote | so | invoice)
  const [pdfDownloading, setPdfDownloading] = useState(null);

  useEffect(() => {
    if (isOpen && order) {
      fetchOrderDetails();
    }
  }, [isOpen, order]);

  // When opening status modal, reset status/remarks and pre-fill optional truck fields from deliveryInfo
  useEffect(() => {
    if (showStatusModal) {
      const d = orderDetails?.order?.delivery || orderDetails?.deliveryInfo || {};
      setStatusData({
        orderStatus: '',
        remarks: '',
        driverName: d.driverName || '',
        driverPhone: d.driverPhone || '',
        driverLicenseNo: d.driverLicenseNo || '',
        truckNumber: d.truckNumber || '',
        vehicleType: d.vehicleType || '',
        capacityTons: d.capacityTons ?? '',
        deliveryNotes: d.deliveryNotes || '',
        items: orderDetails.order.items.map(item => ({
          itemCode: item.itemCode._id,
          name: item.itemCode.itemDescription,
          qty: item.qty,
          unitPrice: item.unitPrice || '',
          loadingCharges: item.loadingCharges || ''
        })),
        shippingFullName: '',
        shippingPhoneNumber: '',
        shippingMail: '',
        shippingDeliveryAddress:'',
        shippingState: '',
        shippingPincode: ''
      });
    }
  }, [showStatusModal]);

  const fetchOrderDetails = async () => {
    if (!order || !order.leadId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getOrderById(order.leadId);
      setOrderDetails(response);

      // Prime delivery modal data from response (admin gets unmasked order.delivery)
      const d = response?.order?.delivery || {};
      setDeliveryData(prev => ({
        ...prev,
        deliveryStatus: d.deliveryStatus || response?.deliveryInfo?.deliveryStatus || response?.order?.orderStatus || '',
        driverName: d.driverName || '',
        driverPhone: d.driverPhone || '',
        driverLicenseNo: d.driverLicenseNo || '',
        truckNumber: d.truckNumber || '',
        vehicleType: d.vehicleType || '',
        capacityTons: d.capacityTons ?? '',
        startTime: d.startTime ? new Date(d.startTime).toISOString().slice(0, 16) : '',
        estimatedArrival: d.estimatedArrival ? new Date(d.estimatedArrival).toISOString().slice(0, 16) : '',
        lastLocation: {
          lat: d.lastLocation?.lat ?? '',
          lng: d.lastLocation?.lng ?? '',
          address: d.lastLocation?.address || ''
        },
        deliveryNotes: d.deliveryNotes || ''
      }));

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

  const handleConfirmOrder = async (data) => {
    if (!window.confirm('Are you sure you want to confirm this order?')) return;

    try {
      setActionLoading(true);
      await orderService.confirmOrder(order.leadId, {
        ...data,
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
    if (!statusData.orderStatus) {
      alert('Please select a new status');
      return;
    }
    if (statusData.orderStatus === 'vendor_accepted') {


      for (const item of statusData.items) {
        const unitPrice = Number(item.unitPrice);
        const loadingCharges = Number(item.loadingCharges);

        if (!unitPrice || isNaN(unitPrice) || unitPrice <= 0) {
          alert(`Please enter valid unit price for ${item.name}`);
          return;
        }

        if (isNaN(loadingCharges) || loadingCharges < 0) {
          alert(`Please enter valid loading charges for ${item.name}`);
          return;
        }
      }

      if (!statusData.shippingFullName?.trim()) {
        alert("Shipping details: name is required");
        return;
      }

      // Phone
      const phone = statusData.shippingPhoneNumber?.trim();
      if (!phone || !/^\+?[0-9]{10,15}$/.test(phone)) {
        alert("Shipping details: Enter valid phone number");
        return;
      }

      // Address
      if (!statusData.shippingDeliveryAddress?.trim()) {
        alert("Shipping details: Delivery address is required");
        return;
      }

      // State
      if (!statusData.shippingState) {
        alert("Shipping details: Please select state");
        return;
      }

      // Pincode
      if (!/^[0-9]{6}$/.test(statusData.shippingPincode)) {
        alert("Shipping details: Enter valid 6-digit pincode");
        return;
      }

      // Email (optional but validate if given)
      if (
        !statusData.shippingMail ||
        !/^\S+@\S+\.\S+$/.test(statusData.shippingMail)
      ) {
        alert("Shipping details: Enter valid email");
        return;
      }
    }

    try {
      setActionLoading(true);
      const payload = {
        orderStatus: statusData.orderStatus,
        ...(statusData.remarks && { remarks: statusData.remarks }),

        ...(statusData.orderStatus === 'vendor_accepted' && {          
          items: statusData.items.map(item => ({
            qty: item.qty,
            itemCode: item.itemCode,
            unitPrice: Number(item.unitPrice),
            loadingCharges: Number(item.loadingCharges || 0)
          }))
        }),
        
        ...(statusData.shippingFullName && {receiverName: statusData.shippingFullName}),
        ...(statusData.shippingPhoneNumber && {receiverMobileNum: statusData.shippingPhoneNumber}),
        ...(statusData.shippingMail && {email: statusData.shippingMail}),
        ...(statusData.shippingPincode && {deliveryPincode: statusData.shippingPincode}),
        ...(statusData.shippingState && {deliveryState: statusData.shippingState}),
        ...(statusData.shippingDeliveryAddress && {deliveryAddress: statusData.shippingDeliveryAddress}),
      };
      const truckFields = ['driverName', 'driverPhone', 'driverLicenseNo', 'truckNumber', 'vehicleType', 'deliveryNotes'];
      truckFields.forEach(key => {
        if (statusData[key]) payload[key] = statusData[key];
      });
      if (statusData.capacityTons !== '' && !Number.isNaN(parseFloat(statusData.capacityTons))) {
        payload.capacityTons = parseFloat(statusData.capacityTons);
      }
      await orderService.updateOrderStatus(order.leadId, payload);
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

      // if (!deliveryData.receiverAddress?.trim()) {
      //   alert('Receiver address is required');
      //   setActionLoading(false);
      //   return;
      // }

      // 🔹 Driver Phone Validation
      if (deliveryData.driverPhone) {
        const phone = String(deliveryData.driverPhone).trim();
        const phoneOk =
          /^\+?[0-9]{10,15}$/.test(phone) || /^[0-9]{10}$/.test(phone);

        if (!phoneOk) {
          alert('Driver phone must be 10 digits or E.164');
          setActionLoading(false);
          return;
        }
      }

      // 🔹 Truck Required Validation
      const reqTruck = ['truck_loading', 'in_transit', 'out_for_delivery', 'delivered'];
      if (reqTruck.includes(deliveryData.deliveryStatus) && !deliveryData.truckNumber) {
        alert('Truck number is required for this status');
        setActionLoading(false);
        return;
      }

      // 🔹 Location Validation
      const hasLat = deliveryData.lastLocation?.lat !== '' && deliveryData.lastLocation?.lat !== null && deliveryData.lastLocation?.lat !== undefined;
      const hasLng = deliveryData.lastLocation?.lng !== '' && deliveryData.lastLocation?.lng !== null && deliveryData.lastLocation?.lng !== undefined;

      if ((hasLat && !hasLng) || (!hasLat && hasLng)) {
        alert('Provide both latitude and longitude');
        setActionLoading(false);
        return;
      }

      // 🔹 Build Payload
      const payload = {};
      const assignIf = (key, val) => {
        if (val !== '' && val !== null && val !== undefined) {
          payload[key] = val;
        }
      };

      // ✅ Existing Fields
      assignIf('deliveryStatus', deliveryData.deliveryStatus);
      assignIf('driverName', deliveryData.driverName);
      assignIf('driverPhone', deliveryData.driverPhone);
      assignIf('driverLicenseNo', deliveryData.driverLicenseNo);
      assignIf('truckNumber', deliveryData.truckNumber);
      assignIf('vehicleType', deliveryData.vehicleType);

      if (deliveryData.capacityTons !== '' && !Number.isNaN(parseFloat(deliveryData.capacityTons))) {
        payload.capacityTons = parseFloat(deliveryData.capacityTons);
      }

      if (deliveryData.startTime) {
        payload.startTime = new Date(deliveryData.startTime).toISOString();
      }

      if (deliveryData.estimatedArrival) {
        payload.estimatedArrival = new Date(deliveryData.estimatedArrival).toISOString();
      }

      if (hasLat && hasLng || deliveryData.lastLocation?.address) {
        payload.lastLocation = {};

        if (hasLat) payload.lastLocation.lat = parseFloat(deliveryData.lastLocation.lat);
        if (hasLng) payload.lastLocation.lng = parseFloat(deliveryData.lastLocation.lng);
        if (deliveryData.lastLocation.address) {
          payload.lastLocation.address = deliveryData.lastLocation.address;
        }
      }

      assignIf('deliveryNotes', deliveryData.deliveryNotes);

      // 🔹 API Call
      await orderService.updateDelivery(order.leadId, payload);

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
      order_placed: { className: 'bg-blue-100 text-blue-800' },
      vendor_accepted: { className: 'bg-green-100 text-green-800' },
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative z-[101]">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Order Details - {orderDetails?.order?.formattedLeadId || orderDetails?.order?.leadId || order.formattedLeadId || order.leadId}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                {orderDetails?.order?.orderStatus && getStatusBadge(orderDetails.order.orderStatus)}
                <Badge className={orderDetails?.paymentInfo?.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  Payment: {orderDetails?.paymentInfo?.paymentStatus || 'Pending'}
                </Badge>
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
                  onClick={() => setActiveTab('confirmOrder')}
                  className={`pb-2 px-4 font-medium ${activeTab === 'confirmOrder' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                >
                  Order Confirmation
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
                    {/* <div className="space-y-4">
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
                          <span className="text-sm font-medium text-gray-900">{formatDate(orderDetails?.order?.createdAt || orderDetails?.order?.orderDate)}</span>
                  </div>
                  <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Quantity:</span>
                          <span className="text-sm font-medium text-gray-900">{orderDetails?.order?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || orderDetails?.order?.totalQty}</span>
                        </div>
                        {orderDetails?.order?.deliveryCharges && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Delivery Charges:</span>
                            <span className="text-sm font-medium text-gray-900">{formatCurrency(orderDetails.order.deliveryCharges)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Amount:</span>
                          <span className="text-sm font-bold text-gray-900">{formatCurrency(orderDetails?.order?.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          {orderDetails?.order?.orderStatus && getStatusBadge(orderDetails.order.orderStatus)}
                  </div>
                  </div>
                  </div> */}

                    {/* Customer Information */}
                    <div className="space-y-6">
                      <h4 className="text-lg font-medium text-gray-900">Customer Information</h4>
                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Name:</span>
                          <span className="text-sm font-medium text-gray-900">{orderDetails?.order?.customer?.name || orderDetails?.order?.custUserId?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Email:</span>
                          <span className="text-sm font-medium text-gray-900">{orderDetails?.order?.customer?.email || orderDetails?.order?.custUserId?.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Phone:</span>
                          <span className="text-sm font-medium text-gray-900">{orderDetails?.order?.customer?.phone || orderDetails?.order?.custUserId?.phone}</span>
                        </div>
                      </div>

                      <h4 className="text-lg font-medium text-gray-900 mt-4">Vendor Information</h4>
                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Name:</span>
                          <span className="text-sm font-medium text-gray-900">{orderDetails?.order?.vendor?.name || orderDetails?.order?.vendorId?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Email:</span>
                          <span className="text-sm font-medium text-gray-900">{orderDetails?.order?.vendor?.email || orderDetails?.order?.vendorId?.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Company:</span>
                          <span className="text-sm font-medium text-gray-900">{orderDetails?.order?.vendor?.companyName || orderDetails?.order?.vendorId?.companyName}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mt-4">Delivery / Truck details</h4>
                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        {(() => {
                          const d = orderDetails?.order?.delivery || orderDetails?.deliveryInfo;
                          const hasDelivery = d && (d.driverName || d.driverPhone || d.truckNumber || d.vehicleType || d.deliveryStatus);
                          if (!hasDelivery) {
                            return (
                              <p className="text-sm text-gray-500">Not set. Use &quot;Update Status&quot; or &quot;Update Delivery&quot; to add truck details.</p>
                            );
                          }
                          return (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Delivery Status:</span>
                                <span className="text-sm font-medium text-gray-900">{d.deliveryStatus || orderDetails?.order?.orderStatus || '—'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Driver:</span>
                                <span className="text-sm font-medium text-gray-900">{d.driverName || '—'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Driver Phone:</span>
                                <span className="text-sm font-medium text-gray-900">{d.driverPhone || '—'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">License No:</span>
                                <span className="text-sm font-medium text-gray-900">{d.driverLicenseNo || '—'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Truck Number:</span>
                                <span className="text-sm font-medium text-gray-900">{d.truckNumber || '—'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Vehicle Type:</span>
                                <span className="text-sm font-medium text-gray-900">{d.vehicleType || '—'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Capacity (Tons):</span>
                                <span className="text-sm font-medium text-gray-900">{(d.capacityTons ?? '—').toString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Start Time:</span>
                                <span className="text-sm font-medium text-gray-900">{d.startTime ? formatDate(d.startTime) : '—'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">ETA:</span>
                                <span className="text-sm font-medium text-gray-900">{d.estimatedArrival ? formatDate(d.estimatedArrival) : '—'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Last Location:</span>
                                <span className="text-sm font-medium text-gray-900">{d.lastLocation?.address || '—'}</span>
                              </div>
                              {d.deliveryNotes && (
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Notes:</span>
                                  <span className="text-sm font-medium text-gray-900">{d.deliveryNotes}</span>
                                </div>
                              )}
                            </>
                          );
                        })()}
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
                                {item.itemDescription || item.itemCode?.itemDescription}
                                {item.itemCode?.primaryImage && (
                                  <img src={item.itemCode.primaryImage} alt="" className="w-12 h-12 object-cover rounded mt-1" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                <Badge className="bg-blue-100 text-blue-800">{item.category || item.itemCode?.category}</Badge>
                              </td>
                              <td className="px-4 py-3 text-sm text-right text-gray-900">{item.quantity || item.qty}</td>
                              <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(item.unitPrice)}</td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{formatCurrency(item.totalPrice || item.totalCost)}</td>
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

                  {/* PDF documents by status: Quote when accepted (Quote Generated). Sales Order when Order Confirmed. Invoice when Out for Delivery / delivery stage. */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Documents (PDF)</h4>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const status = orderDetails?.order?.orderStatus || '';
                        const deliveryStage = ['in_transit', 'out_for_delivery', 'delivered'];
                        const isDeliveryStage = deliveryStage.includes(status);
                        const showQuote = ['vendor_accepted', 'order_confirmed', 'payment_done', 'truck_loading'].includes(status);
                        const showSalesOrder = ['order_confirmed', 'payment_done', 'truck_loading'].includes(status);
                        const showPurchaseOrder = ['order_confirmed', 'truck_loading'].includes(status);
                        const showInvoice = isDeliveryStage;
                        const showEwayBill = isDeliveryStage;
                        const docConfig = [
                          showQuote && { type: 'quote', label: 'Quote' },
                          showSalesOrder && { type: 'so', label: 'Sales Order' },
                          showInvoice && { type: 'invoice', label: 'Invoice' },
                          showEwayBill && { type: 'eway', label: 'E-way Bill' },
                          showPurchaseOrder && { type: 'po', label: 'Purchase Order' }
                        ].filter(Boolean);
                        return docConfig.map(({ type, label }) => (
                          <Button
                            key={type}
                            variant="outline"
                            size="sm"
                            disabled={!!pdfDownloading}
                            onClick={async () => {
                              setPdfDownloading(type);
                              try {
                                await orderService.downloadOrderPdf(order.leadId, type);
                              } catch (err) {
                                console.error('PDF download failed:', err);
                                if (err.response?.status === 404 && type === 'quote') {
                                  alert('Quote is generated when the order is confirmed.');
                                } else {
                                  alert(err.response?.data?.message || `Failed to download ${label} PDF`);
                                }
                              } finally {
                                setPdfDownloading(null);
                              }
                            }}
                          >
                            {pdfDownloading === type ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <FileDown className="w-4 h-4 mr-2" />
                            )}
                            {label}
                          </Button>
                        ));
                      })()}
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
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(orderDetails?.paymentInfo?.totalAmount || orderDetails?.order?.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Paid Amount:</span>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(orderDetails?.paymentInfo?.paidAmount || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Customer Paid Amount:</span>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(orderDetails?.order?.customerPaymentDetails?.paidAmount || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Payment Status:</span>
                        <Badge className={orderDetails?.paymentInfo?.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {orderDetails?.paymentInfo?.paymentStatus || 'Pending'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">UTR Number:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {orderDetails?.order?.customerPaymentDetails?.utrNum || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Account Number:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {orderDetails?.order?.customerPaymentDetails?.accNum || '-'}
                        </span>
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
                      {!orderDetails?.paymentInfo && (
                        <div className="text-center py-4 text-gray-500">
                          <p>No payment information available yet.</p>
                          <p className="text-sm mt-1">Payment details will appear here once payment is processed.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {orderDetails?.paymentInfo?.paymentStatus !== 'completed' && (orderDetails?.order?.orderStatus === 'vendor_accepted' || orderDetails?.order?.orderStatus === 'order_placed') && (
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
              {activeTab === 'confirmOrder' && (
                <OrderConfirmation order={orderDetails?.order} handleConfirmOrder={handleConfirmOrder} />
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
                      onClick={() => { setActiveTab('confirmOrder') }}
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
                        onClick={() => setShowDeliveryModal(true)}
                        variant="outline"
                      >
                        <Truck className="w-4 h-4 mr-2" />
                        Update Delivery / Truck
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative z-[111]">
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
                  <SelectContent className="z-[120]">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110] p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative z-[111] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Update Delivery Information</h3>

            <div className="space-y-4">
              {/* 🔹 Existing Delivery Section */}
              <div>
                <Label>Delivery Status</Label>
                <Select
                  value={deliveryData.deliveryStatus}
                  onValueChange={(value) =>
                    setDeliveryData({ ...deliveryData, deliveryStatus: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="z-[120]">
                    <SelectItem value="order_confirmed">Order Confirmed</SelectItem>
                    <SelectItem value="truck_loading">Truck Loading</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Driver Name</Label>
                  <Input value={deliveryData.driverName} onChange={e => setDeliveryData({ ...deliveryData, driverName: e.target.value })} />
                </div>

                <div>
                  <Label>Driver Phone</Label>
                  <Input value={deliveryData.driverPhone} onChange={e => setDeliveryData({ ...deliveryData, driverPhone: e.target.value })} />
                </div>

                <div>
                  <Label>Driver License No</Label>
                  <Input value={deliveryData.driverLicenseNo} onChange={e => setDeliveryData({ ...deliveryData, driverLicenseNo: e.target.value })} />
                </div>

                <div>
                  <Label>Truck Number</Label>
                  <Input value={deliveryData.truckNumber} onChange={e => setDeliveryData({ ...deliveryData, truckNumber: e.target.value })} />
                </div>

                <div>
                  <Label>Vehicle Type</Label>
                  <Input value={deliveryData.vehicleType} onChange={e => setDeliveryData({ ...deliveryData, vehicleType: e.target.value })} />
                </div>

                <div>
                  <Label>Capacity (Tons)</Label>
                  <Input type="number" value={deliveryData.capacityTons} onChange={e => setDeliveryData({ ...deliveryData, capacityTons: e.target.value })} />
                </div>

                <div>
                  <Label>Start Time</Label>
                  <Input type="datetime-local" value={deliveryData.startTime} onChange={e => setDeliveryData({ ...deliveryData, startTime: e.target.value })} />
                </div>

                <div>
                  <Label>Estimated Arrival</Label>
                  <Input type="datetime-local" value={deliveryData.estimatedArrival} onChange={e => setDeliveryData({ ...deliveryData, estimatedArrival: e.target.value })} />
                </div>

                <div>
                  <Label>Last Location Latitude</Label>
                  <Input type="number" value={deliveryData.lastLocation.lat} onChange={e => setDeliveryData({ ...deliveryData, lastLocation: { ...deliveryData.lastLocation, lat: e.target.value } })} />
                </div>

                <div>
                  <Label>Last Location Longitude</Label>
                  <Input type="number" value={deliveryData.lastLocation.lng} onChange={e => setDeliveryData({ ...deliveryData, lastLocation: { ...deliveryData.lastLocation, lng: e.target.value } })} />
                </div>

                <div className="md:col-span-2">
                  <Label>Last Location Address</Label>
                  <Input value={deliveryData.lastLocation.address} onChange={e => setDeliveryData({ ...deliveryData, lastLocation: { ...deliveryData.lastLocation, address: e.target.value } })} />
                </div>

                <div className="md:col-span-2">
                  <Label>Delivery Notes</Label>
                  <Textarea rows={3} value={deliveryData.deliveryNotes} onChange={e => setDeliveryData({ ...deliveryData, deliveryNotes: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Buttons */}
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

      {/* Status Update Modal (with optional truck details per PUT .../status API) */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 relative z-[111]">
            <h3 className="text-lg font-semibold mb-4">Update Order Status</h3>
            <div className="space-y-4">
              <div>
                <Label>New Status</Label>
                <Select value={statusData.orderStatus} onValueChange={(value) => setStatusData({ ...statusData, orderStatus: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="z-[120]">
                    {orderService.getAllowedStatuses(orderDetails?.order?.orderStatus || 'pending').map(status => (
                      <SelectItem key={status} value={status}>
                        {orderService.getStatusDisplayName(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {statusData.orderStatus === 'vendor_accepted' && (
                <div className="mt-4 flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setIsPriceModalOpen(true)}
                    className="bg-blue-600 text-white"
                  >
                    Add Prices
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsShippingModalOpen(true)}
                    className="bg-green-600 text-white"
                  >
                    Add Shipping Details
                  </Button>
                </div>
                 
              )}
              <Separator className="my-4" />
              <div>
                <Label>Remarks</Label>
                <Textarea
                  value={statusData.remarks}
                  onChange={(e) => setStatusData({ ...statusData, remarks: e.target.value })}
                  rows={2}
                  placeholder="Enter reason for status change"
                />
              </div>
              <Separator className="my-4" />
              <p className="text-sm font-medium text-gray-700">Truck details (optional)</p>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label className="text-gray-600">Driver name</Label>
                  <Input
                    value={statusData.driverName}
                    onChange={(e) => setStatusData({ ...statusData, driverName: e.target.value })}
                    placeholder="Driver name"
                  />
                </div>
                <div>
                  <Label className="text-gray-600">Driver phone</Label>
                  <Input
                    value={statusData.driverPhone}
                    onChange={(e) => setStatusData({ ...statusData, driverPhone: e.target.value })}
                    placeholder="7–15 digits, + - space allowed"
                  />
                </div>
                <div>
                  <Label className="text-gray-600">Driver licence no.</Label>
                  <Input
                    value={statusData.driverLicenseNo}
                    onChange={(e) => setStatusData({ ...statusData, driverLicenseNo: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <Label className="text-gray-600">Truck number</Label>
                  <Input
                    value={statusData.truckNumber}
                    onChange={(e) => setStatusData({ ...statusData, truckNumber: e.target.value })}
                    placeholder="e.g. TS-01-AB-1234"
                  />
                </div>
                <div>
                  <Label className="text-gray-600">Vehicle type</Label>
                  <Select value={statusData.vehicleType || 'none'} onValueChange={(v) => setStatusData({ ...statusData, vehicleType: v === 'none' ? '' : v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="z-[120]">
                      <SelectItem value="none">—</SelectItem>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                      <SelectItem value="Regular">Regular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-600">Capacity (tons)</Label>
                  <Input
                    type="number"
                    step="any"
                    value={statusData.capacityTons}
                    onChange={(e) => setStatusData({ ...statusData, capacityTons: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <Label className="text-gray-600">Delivery notes</Label>
                  <Textarea
                    value={statusData.deliveryNotes}
                    onChange={(e) => setStatusData({ ...statusData, deliveryNotes: e.target.value })}
                    rows={2}
                    placeholder="Optional"
                  />
                </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative z-[111]">
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

      {isPriceModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-[700px] max-h-[80vh] overflow-y-auto">

            <h2 className="text-lg font-semibold mb-4">
              Enter Item Prices
            </h2>

            {statusData.items.map((item, index) => (
              <div
                key={item.itemCode}
                className="border rounded p-4 mb-4"
              >
                <p className="font-medium mb-2">
                  {item.name}
                </p>

                <div className="grid grid-cols-3 gap-4">

                  {/* ✅ Quantity */}
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={item.qty}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          const updatedItems = [...statusData.items];
                          updatedItems[index].qty = value;
                          setStatusData({
                            ...statusData,
                            items: updatedItems
                          });
                        }
                      }}
                    />
                  </div>

                  {/* ✅ Unit Price */}
                  <div>
                    <Label>Unit Price (₹)</Label>
                    <Input
                      type="text"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^(?:\d+|\d*\.\d+)?$/.test(value)) {
                          const updatedItems = [...statusData.items];
                          updatedItems[index].unitPrice = value;
                          setStatusData({
                            ...statusData,
                            items: updatedItems
                          });
                        }
                      }}
                      inputMode="decimal"
                    />
                  </div>

                  {/* ✅ Loading Charges */}
                  <div>
                    <Label>Loading Charges</Label>
                    <Input
                      type="text"
                      value={item.loadingCharges}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^(?:\d+|\d*\.\d+)?$/.test(value)) {
                          const updatedItems = [...statusData.items];
                          updatedItems[index].loadingCharges = value;
                          setStatusData({
                            ...statusData,
                            items: updatedItems
                          });
                        }
                      }}
                      inputMode="decimal"
                    />
                  </div>

                </div>
              </div>
            ))}

            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsPriceModalOpen(false)}
              >
                Cancel
              </Button>

              <Button
                onClick={() => {
                  setIsPriceModalOpen(false);
                }}
              >
                Save Prices
              </Button>
            </div>

          </div>
        </div>
      )}

      {isShippingModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto  z-[9999]">

          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">

            <h3 className="text-lg font-semibold mb-4">Shipping Details</h3>

            <div className="space-y-4">

              {/* 🔹 Receiver Info */}
              <div className="border p-4 rounded-md">
                {/* <h4 className="font-medium mb-3">Receiver Information</h4> */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <Label>Full Name </Label>
                    <Input
                      value={statusData.shippingFullName || ""}
                      onChange={e =>
                        setStatusData({ ...statusData, shippingFullName: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Phone </Label>
                    <Input
                      value={statusData.shippingPhoneNumber || ""}
                      onChange={e =>
                        setStatusData({ ...statusData, shippingPhoneNumber: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={statusData.shippingMail || ""}
                      onChange={e =>
                        setStatusData({ ...statusData, shippingMail: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label>State</Label>
                    <select
                      value={statusData.shippingState || ""}
                      onChange={e =>
                        setStatusData({ ...statusData, shippingState: e.target.value })
                      }
                      className="w-full border rounded-md p-2"
                    >
                      <option value="">Select State</option>

                      {states.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Pincode </Label>
                    <Input
                      value={statusData.shippingPincode || ""}
                      onChange={e =>
                        setStatusData({ ...statusData, shippingPincode: e.target.value })
                      }
                      maxLength={6}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Delivery Address </Label>
                    <Textarea
                      rows={2}
                      value={statusData.shippingDeliveryAddress || ""}
                      onChange={e =>
                        setStatusData({ ...statusData, shippingDeliveryAddress: e.target.value })
                      }
                    />
                  </div>

                </div>
              </div>

            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <Button onClick={() => {
                setIsShippingModalOpen(false);
              }} className="flex-1 bg-green-600 text-white">
                Save
              </Button>

              <Button
                onClick={() => setIsShippingModalOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetailsModal;
