import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import Home from '@/pages/Home'
import Orders from '@/pages/Orders'
import Users from '@/pages/Users'
import Reports from '@/pages/Reports'
import GenerateLead from '@/pages/GenerateLead'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/generate-lead" element={<GenerateLead />} />
          <Route path="users" element={<Users />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
