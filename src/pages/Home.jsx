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
  Pickaxe
} from 'lucide-react'
const Home = () => {
  return (
    <div className="p-6">
      {/* Key Performance Indicators */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Key Performance Indicators
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div className="text-2xl font-bold text-blue-600">145</div>
                  <div className="text-sm text-gray-500">Placed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">132</div>
                  <div className="text-sm text-gray-500">Confirmed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">118</div>
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
                  <div className="text-2xl font-bold text-blue-600">89</div>
                  <div className="text-sm text-gray-500">Placed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">78</div>
                  <div className="text-sm text-gray-500">Confirmed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">71</div>
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
                  <div className="text-2xl font-bold text-blue-600">145</div>
                  <div className="text-sm text-gray-500">Placed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">132</div>
                  <div className="text-sm text-gray-500">Confirmed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">118</div>
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
