import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, UserCheck, UserX, Shield, Building, User as UserIcon } from 'lucide-react'

const UserStats = ({ stats }) => {
  if (!stats) return null

  const { totalUsers, activeUsers, inactiveUsers, roleBreakdown, verifiedUsers, unverifiedUsers } = stats

  const statCards = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Users',
      value: activeUsers,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Inactive Users',
      value: inactiveUsers,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Verified Users',
      value: verifiedUsers,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  const getRoleIcon = (role) => {
    const icons = {
      admin: Shield,
      manager: Building,
      employee: UserIcon,
      vendor: Building,
      customer: Users
    }
    return icons[role] || UserIcon
  }

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      employee: 'bg-green-100 text-green-800',
      vendor: 'bg-purple-100 text-purple-800',
      customer: 'bg-gray-100 text-gray-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
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
                {stat.title === 'Active Users' && (
                  <p className="text-xs text-gray-500 mt-1">
                    {totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}% of total users
                  </p>
                )}
                {stat.title === 'Verified Users' && (
                  <p className="text-xs text-gray-500 mt-1">
                    {totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0}% verification rate
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Role Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(roleBreakdown).map(([role, count]) => {
              const Icon = getRoleIcon(role)
              const percentage = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0
              
              return (
                <div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full">
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 capitalize">{role}</div>
                      <div className="text-sm text-gray-500">{count} users</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getRoleColor(role)}>
                      {percentage}%
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Verified Users</span>
                <span className="text-sm font-bold text-green-600">{verifiedUsers}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Unverified Users</span>
                <span className="text-sm font-bold text-red-600">{unverifiedUsers}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{ width: `${totalUsers > 0 ? (unverifiedUsers / totalUsers) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UserStats
