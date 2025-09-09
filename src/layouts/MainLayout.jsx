import { Outlet, Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, ChevronRight } from 'lucide-react'

const MainLayout = () => {
  const location = useLocation()
  
  // Generate breadcrumb from pathname
  const generateBreadcrumb = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs = []
    
    // Always start with home
    breadcrumbs.push({
      name: 'InfraXpert Admin',
      path: '/',
      isLast: pathSegments.length === 0
    })
    
    // Add path segments
    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/')
      const isLast = index === pathSegments.length - 1
      
      // Convert segment to readable name
      let name = segment
      if (segment === 'orders') name = 'Last 7 Days Orders'
      if (segment === 'generate-lead') name = 'Generate Lead'
      if (segment === 'inventory') name = 'Inventory Management'
      if (segment === 'users') name = 'Users'
      if (segment === 'reports') name = 'Reports'
      
      breadcrumbs.push({
        name: name,
        path: path,
        isLast: isLast
      })
    })
    
    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumb()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Breadcrumb Navigation */}
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                  {breadcrumb.isLast ? (
                    <span className="text-gray-600">{breadcrumb.name}</span>
                  ) : (
                    <Link 
                      to={breadcrumb.path}
                      className="text-gray-600 hover:text-gray-900 cursor-pointer"
                    >
                      {breadcrumb.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/orders">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  Orders
                </Button>
              </Link>
              <Link to="/inventory">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  Inventory
                </Button>
              </Link>
              <Link to="/users">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  Users
                </Button>
              </Link>
              <Link to="/reports">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  Reports
                </Button>
              </Link>
              <Avatar className="w-8 h-8">
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
