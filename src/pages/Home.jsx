import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Building2, 
  Hammer, 
  Plus, 
  FileText, 
  Users, 
  BarChart3, 
  Package,
  CheckCircle,
  AlertCircle,
  Pickaxe,
  Calendar
} from 'lucide-react'
const Home = () => {
  // Date range state
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  })

  // Sample data with dates (in a real app, this would come from your backend)
  const sampleOrders = {
    cement: [
      { id: 1, status: 'placed', date: '2024-01-15', count: 45 },
      { id: 2, status: 'confirmed', date: '2024-01-14', count: 42 },
      { id: 3, status: 'delivered', date: '2024-01-13', count: 38 },
      { id: 4, status: 'placed', date: '2024-01-12', count: 50 },
      { id: 5, status: 'confirmed', date: '2024-01-11', count: 48 },
      { id: 6, status: 'delivered', date: '2024-01-10', count: 40 }
    ],
    steel: [
      { id: 1, status: 'placed', date: '2024-01-15', count: 25 },
      { id: 2, status: 'confirmed', date: '2024-01-14', count: 22 },
      { id: 3, status: 'delivered', date: '2024-01-13', count: 20 },
      { id: 4, status: 'placed', date: '2024-01-12', count: 28 },
      { id: 5, status: 'confirmed', date: '2024-01-11', count: 26 },
      { id: 6, status: 'delivered', date: '2024-01-10', count: 23 }
    ],
    concrete: [
      { id: 1, status: 'placed', date: '2024-01-15', count: 35 },
      { id: 2, status: 'confirmed', date: '2024-01-14', count: 32 },
      { id: 3, status: 'delivered', date: '2024-01-13', count: 30 },
      { id: 4, status: 'placed', date: '2024-01-12', count: 38 },
      { id: 5, status: 'confirmed', date: '2024-01-11', count: 36 },
      { id: 6, status: 'delivered', date: '2024-01-10', count: 33 }
    ]
  }

  // Filter data based on date range
  const getFilteredData = (category) => {
    if (!dateRange.from || !dateRange.to) {
      // If no date range selected, return total counts
      return {
        placed: sampleOrders[category].reduce((sum, order) => sum + (order.status === 'placed' ? order.count : 0), 0),
        confirmed: sampleOrders[category].reduce((sum, order) => sum + (order.status === 'confirmed' ? order.count : 0), 0),
        delivered: sampleOrders[category].reduce((sum, order) => sum + (order.status === 'delivered' ? order.count : 0), 0)
      }
    }

    const filtered = sampleOrders[category].filter(order => 
      order.date >= dateRange.from && order.date <= dateRange.to
    )

    return {
      placed: filtered.reduce((sum, order) => sum + (order.status === 'placed' ? order.count : 0), 0),
      confirmed: filtered.reduce((sum, order) => sum + (order.status === 'confirmed' ? order.count : 0), 0),
      delivered: filtered.reduce((sum, order) => sum + (order.status === 'delivered' ? order.count : 0), 0)
    }
  }

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const clearDateRange = () => {
    setDateRange({ from: '', to: '' })
  }

  return (
    <div className="p-6">
      {/* Date Range Filter */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Date Range Filter
              </CardTitle>
              <button
                onClick={clearDateRange}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear Filter
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => handleDateChange('from', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => handleDateChange('to', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  {dateRange.from && dateRange.to ? (
                    <span>Showing data from {dateRange.from} to {dateRange.to}</span>
                  ) : (
                    <span>Showing all data</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Performance Indicators */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Key Performance Indicators
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cement Orders Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">
                  Cement Orders
                </CardTitle>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Building2 className="text-white w-6 h-6" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{getFilteredData('cement').placed}</div>
                  <div className="text-sm text-gray-500">Placed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{getFilteredData('cement').confirmed}</div>
                  <div className="text-sm text-gray-500">Confirmed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{getFilteredData('cement').delivered}</div>
                  <div className="text-sm text-gray-500">Delivered</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Steel Orders Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">
                  Steel Orders
                </CardTitle>
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Hammer className="text-white w-6 h-6" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{getFilteredData('steel').placed}</div>
                  <div className="text-sm text-gray-500">Placed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{getFilteredData('steel').confirmed}</div>
                  <div className="text-sm text-gray-500">Confirmed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{getFilteredData('steel').delivered}</div>
                  <div className="text-sm text-gray-500">Delivered</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Concrete Orders Card */}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">
                  Concrete Orders
                </CardTitle>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Pickaxe className="text-white w-6 h-6" />
                  </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{getFilteredData('concrete').placed}</div>
                  <div className="text-sm text-gray-500">Placed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{getFilteredData('concrete').confirmed}</div>
                  <div className="text-sm text-gray-500">Confirmed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{getFilteredData('concrete').delivered}</div>
                  <div className="text-sm text-gray-500">Delivered</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/orders/generate-lead">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                  <Plus className="text-white w-6 h-6" />
                </div>
                <h3 className="font-medium text-gray-900">Generate Lead</h3>
              </CardContent>
            </Card>
          </Link>

          <Link to="/orders">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="text-white w-6 h-6" />
                </div>
                <h3 className="font-medium text-gray-900">View Orders</h3>
              </CardContent>
            </Card>
          </Link>

          <Link to="/users">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-4">
                  <Users className="text-white w-6 h-6" />
                </div>
                <h3 className="font-medium text-gray-900">User Management</h3>
              </CardContent>
            </Card>
          </Link>

          <Link to="/reports">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="text-white w-6 h-6" />
                </div>
                <h3 className="font-medium text-gray-900">Reports</h3>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Activity and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  Cement order #INV-001234 delivered
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  2 hours ago
                </span>
              </div>
              <Separator />
              <div className="flex items-center space-x-3">
                <Package className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">
                  Steel order #INV-001235 confirmed
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  4 hours ago
                </span>
              </div>
              <Separator />
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-600">
                  New lead generated for cement supply
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  6 hours ago
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Server Status</span>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Online
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Connected
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Gateway</span>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Home
