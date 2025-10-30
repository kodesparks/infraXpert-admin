import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Package, 
  CheckCircle, 
  Clock, 
  Truck,
  AlertCircle,
  Loader2 
} from 'lucide-react';
import orderService from '@/services/orderService';

const OrderStats = () => {
  const [stats, setStats] = useState({
    orders: null,
    payments: null,
    deliveries: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Only fetch available stats APIs
      const [paymentStats, deliveryStats] = await Promise.all([
        orderService.getPaymentStats(),
        orderService.getDeliveryStats()
      ]);

      setStats({
        orders: null, // Order stats API not available
        payments: paymentStats.stats,
        deliveries: deliveryStats.stats
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading statistics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatNumber(stats.orders?.totalOrders || 0)}
                </p>
                {!stats.orders && (
                  <p className="text-xs text-gray-500 mt-1">API not available</p>
                )}
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats.orders?.totalRevenue || 0)}
                </p>
                {!stats.orders && (
                  <p className="text-xs text-gray-500 mt-1">API not available</p>
                )}
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Payments */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Payments</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatNumber(stats.payments?.completedPayments || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(stats.payments?.totalAmount || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Deliveries */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatNumber(stats.deliveries?.deliveredCount || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  of {formatNumber(stats.deliveries?.totalDeliveries || 0)} total
                </p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Order Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.orders?.statusBreakdown ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {stats.orders.statusBreakdown.map((status) => (
                <div key={status._id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getStatusBadgeColor(status._id)}>
                      {orderService.getStatusDisplayName(status._id)}
                    </Badge>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{status.count}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {formatCurrency(status.totalAmount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Order status breakdown not available</p>
              <p className="text-sm text-gray-400 mt-1">API endpoint not implemented</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Method Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.payments?.paymentMethodBreakdown?.map((method) => (
                <div key={method._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {method._id.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-600">{method.count} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(method.totalAmount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Delivery Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.deliveries?.statusBreakdown?.map((status) => (
                <div key={status._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${getDeliveryStatusColor(status._id)}`}>
                      {getDeliveryIcon(status._id)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {status._id.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-600">
                        {((status.count / stats.deliveries.totalDeliveries) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{status.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-xl font-bold text-gray-900">{stats.payments?.pendingPayments || 0}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">In Transit</p>
              <p className="text-xl font-bold text-gray-900">{stats.deliveries?.inTransitCount || 0}</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Package className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Pending Delivery</p>
              <p className="text-xl font-bold text-gray-900">{stats.deliveries?.pendingCount || 0}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xl font-bold text-gray-900">{stats.deliveries?.deliveredCount || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions
const getStatusBadgeColor = (status) => {
  const colors = {
    pending: 'bg-gray-100 text-gray-800',
    vendor_accepted: 'bg-blue-100 text-blue-800',
    payment_done: 'bg-purple-100 text-purple-800',
    order_confirmed: 'bg-orange-100 text-orange-800',
    truck_loading: 'bg-yellow-100 text-yellow-800',
    in_transit: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-cyan-100 text-cyan-800',
    out_for_delivery: 'bg-teal-100 text-teal-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getDeliveryStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100',
    in_transit: 'bg-blue-100',
    out_for_delivery: 'bg-indigo-100',
    delivered: 'bg-green-100'
  };
  return colors[status] || 'bg-gray-100';
};

const getDeliveryIcon = (status) => {
  const iconClass = "w-5 h-5";
  switch (status) {
    case 'pending':
      return <Clock className={`${iconClass} text-yellow-600`} />;
    case 'in_transit':
      return <Truck className={`${iconClass} text-blue-600`} />;
    case 'out_for_delivery':
      return <Package className={`${iconClass} text-indigo-600`} />;
    case 'delivered':
      return <CheckCircle className={`${iconClass} text-green-600`} />;
    default:
      return <Package className={`${iconClass} text-gray-600`} />;
  }
};

export default OrderStats;

