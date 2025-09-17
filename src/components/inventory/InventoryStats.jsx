import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Tag, Truck, Percent, TrendingUp, BarChart3 } from 'lucide-react'

const InventoryStats = ({ stats }) => {
  if (!stats) return null

  const { totalItems, totalPrices, totalShipPrices, activePromos, categoryBreakdown } = stats

  const statCards = [
    {
      title: 'Total Items',
      value: totalItems,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Inventory items'
    },
    {
      title: 'Total Prices',
      value: totalPrices,
      icon: Tag,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Items with pricing'
    },
    {
      title: 'Shipping Prices',
      value: totalShipPrices,
      icon: Truck,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Items with shipping'
    },
    {
      title: 'Active Promos',
      value: activePromos,
      icon: Percent,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Running promotions'
    }
  ]

  const getCategoryIcon = (category) => {
    const icons = {
      'Cement': Package,
      'Iron': BarChart3,
      'Concrete Mixer': Truck
    }
    return icons[category] || Package
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Cement': 'bg-blue-100 text-blue-800',
      'Iron': 'bg-gray-100 text-gray-800',
      'Concrete Mixer': 'bg-orange-100 text-orange-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryBreakdown.map((category, index) => {
              const Icon = getCategoryIcon(category._id)
              const percentage = totalItems > 0 ? Math.round((category.count / totalItems) * 100) : 0
              
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full">
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{category._id}</div>
                      <div className="text-sm text-gray-500">{category.count} items</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{percentage}%</div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <Badge className={getCategoryColor(category._id)}>
                      {category.count}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Pricing Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Items with Pricing</span>
                <span className="text-sm font-bold text-green-600">{totalPrices}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${totalItems > 0 ? (totalPrices / totalItems) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                {totalItems > 0 ? Math.round((totalPrices / totalItems) * 100) : 0}% of items have pricing
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Items with Shipping</span>
                <span className="text-sm font-bold text-orange-600">{totalShipPrices}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full" 
                  style={{ width: `${totalItems > 0 ? (totalShipPrices / totalItems) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                {totalItems > 0 ? Math.round((totalShipPrices / totalItems) * 100) : 0}% of items have shipping
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default InventoryStats
