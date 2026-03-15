import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import {
  FiHome, FiUsers, FiTruck, FiTool, FiPackage,
  FiFileText, FiBarChart2, FiSettings, FiShoppingBag, FiLogOut, FiX
} from 'react-icons/fi'

export default function Sidebar({ open, onClose }) {
  const { t } = useTranslation()
  const { logout, isAdmin } = useAuth()

  const links = [
    { to: '/admin', icon: <FiHome />, label: t('dashboard') },
    { to: '/admin/customers', icon: <FiUsers />, label: t('customers') },
    { to: '/admin/cars', icon: <FiTruck />, label: t('cars') },
    { to: '/admin/work-orders', icon: <FiTool />, label: t('work_orders') },
    { to: '/admin/inventory', icon: <FiPackage />, label: t('inventory'), admin: true },
    { to: '/admin/invoices', icon: <FiFileText />, label: t('invoices') },
    { to: '/admin/reports', icon: <FiBarChart2 />, label: t('reports'), admin: true },
    { to: '/admin/store-manage', icon: <FiShoppingBag />, label: t('store'), admin: true },
    { to: '/admin/settings', icon: <FiSettings />, label: t('settings') },
  ]

  return (
    <aside className={`
      w-64 bg-hrr-gray h-screen fixed top-0 start-0 flex flex-col border-e border-hrr-silver/10 z-50
      transition-transform duration-300 ease-in-out
      ${open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'}
      lg:translate-x-0 lg:rtl:translate-x-0
    `}>
      <div className="p-4 md:p-6 border-b border-hrr-silver/10 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-hrr-red tracking-wider">
            🏁 HRR
          </h1>
          <p className="text-xs text-hrr-silver mt-1">HOT ROD RACING</p>
        </div>
        <button onClick={onClose} className="lg:hidden text-hrr-silver hover:text-white text-xl">
          <FiX />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(link => {
          if (link.admin && !isAdmin) return null
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin'}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-3 border-t border-hrr-silver/10">
        <button onClick={() => { logout(); onClose() }} className="sidebar-link w-full text-red-400 hover:text-red-300">
          <FiLogOut className="text-lg" />
          {t('logout')}
        </button>
      </div>
    </aside>
  )
}
