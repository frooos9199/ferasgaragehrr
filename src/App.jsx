import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth, AuthProvider } from './hooks/useAuth'
import { StoreAuthProvider } from './hooks/useStoreAuth'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import Dashboard from './components/dashboard/Dashboard'
import Customers from './components/customers/Customers'
import Cars from './components/cars/Cars'
import WorkOrders from './components/workorders/WorkOrders'
import Inventory from './components/inventory/Inventory'
import Invoices from './components/invoices/Invoices'
import Reports from './components/reports/Reports'
import Settings from './components/settings/Settings'
import Store from './components/store/Store'
import ClientView from './components/client/ClientView'
import { Toaster } from 'react-hot-toast'

function AdminRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-hrr-dark flex items-center justify-center text-white text-xl">🏁 HRR Loading...</div>
  if (!user) return <LoginPage />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/work-orders" element={<WorkOrders />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/store-manage" element={<Store />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <StoreAuthProvider>
        <BrowserRouter>
          <Toaster position="top-center" toastOptions={{ style: { background: '#1E1E1E', color: '#fff', border: '1px solid #333' } }} />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/client/:orderId" element={<ClientView />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
          </Routes>
        </BrowserRouter>
      </StoreAuthProvider>
    </AuthProvider>
  )
}
