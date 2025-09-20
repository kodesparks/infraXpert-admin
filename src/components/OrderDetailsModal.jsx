import { useState, useEffect } from "react";
import { X, Clock, CheckCircle, Truck, MapPin, Package } from "lucide-react";

const OrderDetailsModal = ({ isOpen, onClose, order }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableData, setEditableData] = useState({
    deliveryAddress: "123 Construction Site, Mumbai",
    expectedDeliveryDate: "",
    status: "",
    remarks: "",
    driverNumber: "",
    truckNumber: "",
  });

  useEffect(() => {
    if (order) {
      setEditableData({
        deliveryAddress: "123 Construction Site, Mumbai",
        expectedDeliveryDate: order.deliveryDate,
        status: order.status,
        remarks: "",
        driverNumber: order.driverNumber || "",
        truckNumber: order.truckNumber || order.vehicleNumber || "",
      });
      setIsEditMode(false); // Reset edit mode when order changes
    }
  }, [order]);

  if (!isOpen || !order) return null;

  // Check if order is within 48 hours
  const isWithin48Hours = () => {
    const orderDate = new Date(order.orderDate);
    const currentDate = new Date();
    const diffInHours = (currentDate - orderDate) / (1000 * 60 * 60);
    return diffInHours <= 48;
  };                              

  const canEdit = isWithin48Hours();

  const handleEditMode = () => {
    setIsEditMode(true);
  };

  const handleSaveChanges = () => {
    // Here you would typically save to your backend
    console.log("Saving changes:", editableData);
    setIsEditMode(false);
    // You could also show a success message here
  };

  const handleCancelEdit = () => {
    // Reset to original values
    setEditableData({
      deliveryAddress: "123 Construction Site, Mumbai",
      expectedDeliveryDate: order.deliveryDate,
      status: order.status,
      remarks: "",
      driverNumber: order.driverNumber || "",
      truckNumber: order.truckNumber || order.vehicleNumber || "",
    });
    setIsEditMode(false);
  };

  const handleInputChange = (field, value) => {
    setEditableData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Order timeline data
  const getOrderTimeline = () => {
    const timeline = [
      {
        id: 'order_placed',
        title: 'Order Placed',
        description: 'Order has been confirmed and placed',
        timestamp: order?.orderDate || '2024-01-15',
        status: 'completed',
        icon: CheckCircle
      },
      {
        id: 'processing',
        title: 'Processing',
        description: 'Order is being prepared for shipment',
        timestamp: order?.orderDate || '2024-01-15',
        status: editableData.status === 'confirmed' ? 'current' : 'completed',
        icon: Package
      },
      {
        id: 'truck_load',
        title: 'Truck Loading',
        description: 'Items are being loaded onto the truck',
        timestamp: editableData.status === 'truck_load' ? new Date().toISOString().split('T')[0] : null,
        status: editableData.status === 'truck_load' ? 'current' : 
                (['intransport', 'delivered'].includes(editableData.status) ? 'completed' : 'pending'),
        icon: Truck
      },
      {
        id: 'in_transit',
        title: 'In Transit',
        description: 'Order is on the way to destination',
        timestamp: editableData.status === 'intransport' ? new Date().toISOString().split('T')[0] : null,
        status: editableData.status === 'intransport' ? 'current' : 
                (editableData.status === 'delivered' ? 'completed' : 'pending'),
        icon: MapPin
      },
      {
        id: 'delivered',
        title: 'Delivered',
        description: 'Order has been delivered successfully',
        timestamp: editableData.status === 'delivered' ? new Date().toISOString().split('T')[0] : null,
        status: editableData.status === 'delivered' ? 'completed' : 'pending',
        icon: CheckCircle
      }
    ];

    // Add cancelled status if order is cancelled
    if (editableData.status === 'cancelled') {
      timeline.push({
        id: 'cancelled',
        title: 'Order Cancelled',
        description: 'Order has been cancelled',
        timestamp: new Date().toISOString().split('T')[0],
        status: 'cancelled',
        icon: X
      });
    }

    return timeline;
  };

  const getTimelineIcon = (status, IconComponent) => {
    const baseClasses = "w-5 h-5";
    
    switch (status) {
      case 'completed':
        return <CheckCircle className={`${baseClasses} text-green-600`} />;
      case 'current':
        return <IconComponent className={`${baseClasses} text-blue-600`} />;
      case 'cancelled':
        return <X className={`${baseClasses} text-red-600`} />;
      default:
        return <Clock className={`${baseClasses} text-gray-400`} />;
    }
  };

  const getTimelineStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'current':
        return 'border-blue-500 bg-blue-50';
      case 'cancelled':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      delivered: "bg-green-100 text-green-800",
      truck_load: "bg-blue-100 text-blue-800",
      confirmed: "bg-orange-100 text-orange-800",
      intransport: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    };

    const className = statusConfig[status] || "bg-gray-100 text-gray-800";

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${className}`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    return (
      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
        {category}
      </span>
    );
  };

  const getPaymentTypeBadge = (paymentType) => {
    return (
      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
        {paymentType}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    return (
      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
        {status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-semibold text-gray-900">
              Order Details - {order.id}
            </h3>
            {canEdit && (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Editable
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Order Timeline */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Order Timeline</h4>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-4">
                {getOrderTimeline().map((step, index) => {
                  const IconComponent = step.icon;
                  return (
                    <div key={step.id} className="relative flex items-start">
                      <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${getTimelineStatusColor(step.status)}`}>
                        {getTimelineIcon(step.status, IconComponent)}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className={`text-sm font-medium ${
                            step.status === 'completed' ? 'text-green-900' :
                            step.status === 'current' ? 'text-blue-900' :
                            step.status === 'cancelled' ? 'text-red-900' : 'text-gray-500'
                          }`}>
                            {step.title}
                          </h5>
                          {step.timestamp && (
                            <span className="text-xs text-gray-500">
                              {step.timestamp}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${
                          step.status === 'completed' ? 'text-green-700' :
                          step.status === 'current' ? 'text-blue-700' :
                          step.status === 'cancelled' ? 'text-red-700' : 'text-gray-500'
                        }`}>
                          {step.description}
                        </p>
                        {step.status === 'current' && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              In Progress
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Order Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Lead ID:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Invoice Number:
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.invoice}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sub Invoice:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.subInvoice}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Brand:</span>
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                      {order.brand}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Category:</span>
                    {getCategoryBadge(order.category)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sub Category:</span>
                    <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                      {order.subCategory}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Grade:</span>
                    <span className="px-2 py-1 text-xs font-medium bg-teal-100 text-teal-800 rounded-full">
                      {order.grade}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.quantity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Price:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.price}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Order Date:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.orderDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <select
                      value={editableData.status}
                      onChange={(e) =>
                        handleInputChange("status", e.target.value)
                      }
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="truck_load">Truck Load</option>
                      <option value="intransport">In Transport</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Customer Name:
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.customerName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Receiver Contact:
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      +91 8765432109
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Delivery Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">
                      Delivery Address:
                    </span>
                    {isEditMode && canEdit ? (
                      <textarea
                        value={editableData.deliveryAddress}
                        onChange={(e) =>
                          handleInputChange("deliveryAddress", e.target.value)
                        }
                        className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="2"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {editableData.deliveryAddress}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Expected Delivery Date:
                    </span>
                    {isEditMode && canEdit ? (
                      <input
                        type="date"
                        value={editableData.expectedDeliveryDate}
                        onChange={(e) =>
                          handleInputChange(
                            "expectedDeliveryDate",
                            e.target.value
                          )
                        }
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900">
                        {editableData.expectedDeliveryDate}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-sm text-gray-600">Driver Number:</span>
                    <input
                      type="tel"
                      value={editableData.driverNumber}
                      onChange={(e) => handleInputChange("driverNumber", e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-44 md:w-56"
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-sm text-gray-600">Truck Number:</span>
                    <input
                      type="text"
                      value={editableData.truckNumber}
                      onChange={(e) => handleInputChange("truckNumber", e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-44 md:w-56"
                      placeholder="e.g., MH-01-AB-1234"
                    />
                  </div>
                  {editableData.status === "intransport" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Driver Name:
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          Rajesh Kumar
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Driver Number:
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          +91 9876543210
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Vehicle Number:
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          MH-01-AB-1234
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Payment Details
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Transaction ID:
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      TXN-789123
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Payment Type:</span>
                    {getPaymentTypeBadge("RTGS")}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.price}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Payment Status:
                    </span>
                    {getPaymentStatusBadge("completed")}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Remarks
                </h4>
                <div>
                  <textarea
                    value={editableData.remarks}
                    onChange={(e) =>
                      handleInputChange("remarks", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                    placeholder="Enter any remarks or notes about this order..."
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => {
                        console.log("Saving remarks:", editableData.remarks);
                        // Here you would typically save to your backend
                        alert("Remarks saved successfully!");
                      }}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                    >
                      Save Remarks
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 whitespace-nowrap cursor-pointer"
            >
              Cancel
            </button>
            
            <div className="flex space-x-3">
              {isEditMode ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 whitespace-nowrap cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap cursor-pointer"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  {canEdit ? (
                    <button
                      onClick={handleEditMode}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap cursor-pointer"
                    >
                      Update Order
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed whitespace-nowrap"
                      title="Order is older than 48 hours and cannot be updated"
                    >
                      Update Order
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
