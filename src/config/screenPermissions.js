export const SCREEN_PERMISSIONS = [
  { id: 'dashboard', path: '/admin', labelKey: 'dashboard' },
  { id: 'customers', path: '/admin/customers', labelKey: 'customers' },
  { id: 'cars', path: '/admin/cars', labelKey: 'cars' },
  { id: 'workOrders', path: '/admin/work-orders', labelKey: 'work_orders' },
  { id: 'inventory', path: '/admin/inventory', labelKey: 'inventory' },
  { id: 'invoices', path: '/admin/invoices', labelKey: 'invoices' },
  { id: 'pos', path: '/admin/pos', labelKey: 'pos_title' },
  { id: 'purchasesExpenses', path: '/admin/purchases-expenses', labelKey: 'accounting_title' },
  { id: 'reports', path: '/admin/reports', labelKey: 'reports' },
  { id: 'store', path: '/admin/store-manage', labelKey: 'store' },
  { id: 'employees', path: '/admin/employees', labelKey: 'employees' },
  { id: 'settings', path: '/admin/settings', labelKey: 'settings' },
]

export const DEFAULT_EMPLOYEE_PERMISSIONS = ['dashboard', 'pos', 'workOrders', 'customers', 'settings']

export function getScreenPermissions(userData) {
  if (userData?.role === 'admin') return SCREEN_PERMISSIONS.map(screen => screen.id)
  if (Array.isArray(userData?.permissions)) return userData.permissions
  return DEFAULT_EMPLOYEE_PERMISSIONS
}

export function canAccessScreen(userData, screenId) {
  return getScreenPermissions(userData).includes(screenId)
}
