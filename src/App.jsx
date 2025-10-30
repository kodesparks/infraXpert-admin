import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import MainLayout from '@/layouts/MainLayout'
import Home from '@/pages/Home'
import Orders from '@/pages/Orders'
import Inventory from '@/pages/Inventory'
import Warehouses from '@/pages/Warehouses'
import Users from '@/pages/Users'
import Reports from '@/pages/Reports'
import GenerateLead from '@/pages/GenerateLead'
import Login from '@/pages/Login'

// Component to handle authenticated routes
const AuthenticatedRoutes = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return (
    <MainLayout>
      <Routes>
        <Route index element={<Home />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/generate-lead" element={<GenerateLead />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="warehouses" element={<Warehouses />} />
        <Route path="users" element={<Users />} />
        <Route path="reports" element={<Reports />} />
      </Routes>
    </MainLayout>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/*" element={<AuthenticatedRoutes />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
