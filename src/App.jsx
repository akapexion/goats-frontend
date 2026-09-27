import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { AOSInit } from '@/components/AOS'
import { RequireAuth } from '@/components/RequireAuth'
import { useAuth } from '@/context/AuthContext'

import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminFarmers from '@/pages/admin/AdminFarmers'
import AdminMarkets from '@/pages/admin/AdminMarkets'
import AdminCategories from '@/pages/admin/AdminCategories'
import AdminProducts from '@/pages/admin/AdminProducts'
import AdminReviews from '@/pages/admin/AdminReviews'
import AdminReports from '@/pages/admin/AdminReports'

import FarmerDashboard from '@/pages/farmer/FarmerDashboard'
import FarmerProfile from '@/pages/farmer/FarmerProfile'
import FarmerProducts from '@/pages/farmer/FarmerProducts'
import FarmerOrders from '@/pages/farmer/FarmerOrders'
import FarmerReviews from '@/pages/farmer/FarmerReviews'

import CustomerDashboard from '@/pages/customer/CustomerDashboard'
import CustomerProducts from '@/pages/customer/CustomerProducts'
import CustomerFarmers from '@/pages/customer/CustomerFarmers'
import FarmerDetail from '@/pages/customer/FarmerDetail'
import CustomerMarkets from '@/pages/customer/CustomerMarkets'
import CustomerOrders from '@/pages/customer/CustomerOrders'
import CustomerFavorites from '@/pages/customer/CustomerFavorites'
import EverythingYouNeed from './pages/EverythingYouNeed'
import HowItWorks from './pages/HowItWorks'

function AuthRedirect() {
  const { user } = useAuth()
  if (user) return <Navigate to={`/${user.role}/dashboard`} replace />
  return null
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/features" element={<EverythingYouNeed />} />
      <Route path="/about" element={<HowItWorks />} />
      <Route path="/login" element={<><AuthRedirect /><LoginPage /></>} />
      <Route path="/register" element={<><AuthRedirect /><RegisterPage /></>} />

      <Route element={<RequireAuth role="admin" />}>
        <Route path="/admin/dashboard"  element={<AdminDashboard />} />
        <Route path="/admin/users"       element={<AdminUsers />} />
        <Route path="/admin/farmers"     element={<AdminFarmers />} />
        <Route path="/admin/markets"     element={<AdminMarkets />} />
        <Route path="/admin/categories"  element={<AdminCategories />} />
        <Route path="/admin/products"    element={<AdminProducts />} />
        <Route path="/admin/reviews"     element={<AdminReviews />} />
        <Route path="/admin/reports"     element={<AdminReports />} />
      </Route>

      <Route element={<RequireAuth role="farmer" />}>
        <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
        <Route path="/farmer/profile"   element={<FarmerProfile />} />
        <Route path="/farmer/products"  element={<FarmerProducts />} />
        <Route path="/farmer/orders"    element={<FarmerOrders />} />
        <Route path="/farmer/reviews"   element={<FarmerReviews />} />
      </Route>

      <Route element={<RequireAuth role="customer" />}>
        <Route path="/customer/dashboard"       element={<CustomerDashboard />} />
        <Route path="/customer/products"        element={<CustomerProducts />} />
        <Route path="/customer/farmers"         element={<CustomerFarmers />} />
        <Route path="/customer/farmers/:id"     element={<FarmerDetail />} />
        <Route path="/customer/markets"         element={<CustomerMarkets />} />
        <Route path="/customer/orders"          element={<CustomerOrders />} />
        <Route path="/customer/favorites"       element={<CustomerFavorites />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AOSInit />
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: { borderRadius: '8px', fontSize: '14px' },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
