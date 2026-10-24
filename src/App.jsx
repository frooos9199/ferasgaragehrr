import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
import Employees from './components/employees/Employees'
import Pos from './components/pos/Pos'
import PurchasesExpenses from './components/accounting/PurchasesExpenses'
import { SCREEN_PERMISSIONS, canAccessScreen } from './config/screenPermissions'
import ClientView from './components/client/ClientView'
import InvoiceView from './components/client/InvoiceView'
import { Toaster } from 'react-hot-toast'

function ScreenGate({ permission, children }) {
  const { userData, logout } = useAuth()
  const { t } = useTranslation()
  if (canAccessScreen(userData, permission)) return children
  const firstAllowedScreen = SCREEN_PERMISSIONS.find(screen => canAccessScreen(userData, screen.id))
  if (firstAllowedScreen) return <Navigate to={firstAllowedScreen.path} replace />
  return (
    <main className="min-h-screen bg-hrr-dark p-6 text-center text-white">
      <p className="mb-4">{t('no_screen_access')}</p>
      <button onClick={logout} className="btn-secondary">{t('logout')}</button>
    </main>
  )
}

function AdminRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-hrr-dark flex items-center justify-center text-white text-xl">🏁 HRR Loading...</div>
  if (!user) return <LoginPage />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<ScreenGate permission="dashboard"><Dashboard /></ScreenGate>} />
        <Route path="/customers" element={<ScreenGate permission="customers"><Customers /></ScreenGate>} />
        <Route path="/cars" element={<ScreenGate permission="cars"><Cars /></ScreenGate>} />
        <Route path="/work-orders" element={<ScreenGate permission="workOrders"><WorkOrders /></ScreenGate>} />
        <Route path="/inventory" element={<ScreenGate permission="inventory"><Inventory /></ScreenGate>} />
        <Route path="/invoices" element={<ScreenGate permission="invoices"><Invoices /></ScreenGate>} />
        <Route path="/pos" element={<ScreenGate permission="pos"><Pos /></ScreenGate>} />
        <Route path="/purchases-expenses" element={<ScreenGate permission="purchasesExpenses"><PurchasesExpenses /></ScreenGate>} />
        <Route path="/reports" element={<ScreenGate permission="reports"><Reports /></ScreenGate>} />
        <Route path="/settings" element={<ScreenGate permission="settings"><Settings /></ScreenGate>} />
        <Route path="/store-manage" element={<ScreenGate permission="store"><Store /></ScreenGate>} />
        <Route path="/employees" element={<ScreenGate permission="employees"><Employees /></ScreenGate>} />
      </Route>
    </Routes>
  )
}

function CashierRoute() {
  const { user, userData, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-hrr-dark flex items-center justify-center text-white text-xl">🏁 HRR Loading...</div>
  if (!user) return <LoginPage />
  if (!canAccessScreen(userData, 'pos')) {
    const firstAllowedScreen = SCREEN_PERMISSIONS.find(screen => canAccessScreen(userData, screen.id))
    return firstAllowedScreen ? <Navigate to={firstAllowedScreen.path} replace /> : <Navigate to="/admin" replace />
  }
  return <main className="min-h-screen bg-hrr-dark p-4 md:p-6"><Pos /></main>
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
            <Route path="/invoice/:invoiceId" element={<InvoiceView />} />
            <Route path="/cashier" element={<CashierRoute />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
          </Routes>
        </BrowserRouter>
      </StoreAuthProvider>
    </AuthProvider>
  )
}
