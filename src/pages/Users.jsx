import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const Users = () => {
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">User Management</CardTitle>
            <p className="text-gray-600">Manage users and permissions</p>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Users Page</h3>
              <p className="text-gray-500">This page will contain user management features.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Users
