import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Trash2, Eye, UserCheck, UserX, Shield } from 'lucide-react'
import userService from '@/services/userService'

const UserTable = ({ 
  users, 
  onEdit, 
  onDelete, 
  onView, 
  onStatusChange,
  onRoleChange,
  currentUserRole 
}) => {
  const [loading, setLoading] = useState({})

  const getRoleBadge = (role) => {
    const roleColors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      employee: 'bg-green-100 text-green-800',
      vendor: 'bg-purple-100 text-purple-800',
      customer: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <Badge className={roleColors[role] || 'bg-gray-100 text-gray-800'}>
        {role?.charAt(0).toUpperCase() + role?.slice(1)}
      </Badge>
    )
  }

  const getStatusBadge = (isActive) => {
    return (
      <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    )
  }

  const getVerificationBadge = (isPhoneVerified, isEmailVerified) => {
    if (isPhoneVerified && isEmailVerified) {
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>
    } else if (isPhoneVerified || isEmailVerified) {
      return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">Unverified</Badge>
    }
  }

  const handleStatusChange = async (userId, currentStatus) => {
    setLoading(prev => ({ ...prev, [userId]: true }))
    try {
      await onStatusChange(userId, !currentStatus)
    } catch (error) {
      console.error('Error changing user status:', error)
    } finally {
      setLoading(prev => ({ ...prev, [userId]: false }))
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    setLoading(prev => ({ ...prev, [`role_${userId}`]: true }))
    try {
      await onRoleChange(userId, newRole)
    } catch (error) {
      console.error('Error changing user role:', error)
    } finally {
      setLoading(prev => ({ ...prev, [`role_${userId}`]: false }))
    }
  }

  const canManageUser = (userRole) => {
    if (currentUserRole === 'admin') return true
    if (currentUserRole === 'manager' && ['employee', 'vendor', 'customer'].includes(userRole)) return true
    return false
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id} className="hover:bg-gray-50">
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(user.role)}
                    {canManageUser(user.role) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newRole = prompt('Enter new role:', user.role)
                          if (newRole && newRole !== user.role) {
                            handleRoleChange(user._id, newRole)
                          }
                        }}
                        disabled={loading[`role_${user._id}`]}
                        className="h-6 w-6 p-0"
                      >
                        <Shield className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    <div>{user.phone || '-'}</div>
                    <div className="text-gray-500">{user.address ? `${user.address.substring(0, 30)}...` : '-'}</div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    <div>{user.employeeId || '-'}</div>
                    {user.companyName && (
                      <div className="text-gray-500">{user.companyName}</div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(user.isActive)}
                    {canManageUser(user.role) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusChange(user._id, user.isActive)}
                        disabled={loading[user._id]}
                        className="h-6 w-6 p-0"
                      >
                        {user.isActive ? (
                          <UserX className="h-3 w-3 text-red-600" />
                        ) : (
                          <UserCheck className="h-3 w-3 text-green-600" />
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  {getVerificationBadge(user.isPhoneVerified, user.isEmailVerified)}
                </TableCell>
                
                <TableCell>
                  <div className="text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(user)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {canManageUser(user.role) && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(user)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this user?')) {
                              onDelete(user._id)
                            }
                          }}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default UserTable
