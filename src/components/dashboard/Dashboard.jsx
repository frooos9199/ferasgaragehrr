import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { useAuth } from '../../hooks/useAuth'
import { STATUS_COLORS } from '../../config/constants'
import { Link } from 'react-router-dom'
import { FiTruck, FiTool, FiCheckCircle, FiDollarSign, FiAlertTriangle, FiUsers, FiArrowRight, FiClock, FiSend } from 'react-icons/fi'
import { sendWhatsApp } from '../../utils/helpers'
import { WHATSAPP_NUMBER } from '../../config/constants'

export default function Dashboard() {
  const { t } = useTranslation()
  const { userData, isAdmin } = useAuth()
  const { data: orders } = useCollection('workOrders')
  const { data: customers } = useCollection('customers')
  const { data: inventory } = useCollection('inventory')
  const { data: invoices } = useCollection('invoices')

  const today = new Date().toDateString()
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today)
  const inProgress = orders.filter(o => ['received', 'diagnosis', 'in_progress'].includes(o.status))
  const ready = orders.filter(o => o.status === 'done')
  const lowStock = inventory.filter(i => i.quantity <= i.minQuantity)

  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  const monthInvoices = invoices.filter(i => {
    const d = new Date(i.createdAt)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  })
  const monthRevenue = monthInvoices.reduce((s, i) => s + (i.total || 0), 0)
  const todayRevenue = invoices.filter(i => new Date(i.createdAt).toDateString() === today).reduce((s, i) => s + (i.total || 0), 0)

  // تذكير صيانة - سيارات مر عليها 6 شهور
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const maintenanceReminders = orders.filter(o => {
    if (o.serviceType !== 'maintenance' || o.status !== 'delivered') return false
    return new Date(o.createdAt) <= sixMonthsAgo
  })

  const sendMaintenanceReminder = (order) => {
    const msg = `🏁 *HOT ROD RACING - HRR*

Dear ${order.customerName},

This is a friendly reminder that your vehicle *Ford ${order.carModel} ${order.carYear}* is due for periodic maintenance.

Last service date: ${formatDate(order.createdAt)}

Please contact us to schedule your appointment:
📞 +${WHATSAPP_NUMBER}

Thank you for choosing HRR! 🏁`
    sendWhatsApp(order.customerPhone, msg)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h2 className="font-heading text-xl md:text-2xl font-bold">
            {t('dashboard')}
          </h2>
          <p className="text-hrr-silver text-xs md:text-sm">
            {t('app_name')} • {new Date().toLocaleDateString('en-GB')}
          </p>
        </div>
        <Link to="/admin/work-orders" className="btn-primary flex items-center gap-2 text-sm md:text-base py-2 px-3 md:px-6">
          <FiTool /> <span className="hidden sm:inline">{t('new_work_order')}</span><span className="sm:hidden">{t('add')}</span>
        </Link>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4 mb-4 md:mb-6">
        <div className="stat-card">
          <FiTruck className="text-xl md:text-2xl text-blue-400" />
          <span className="text-xl md:text-2xl font-bold">{todayOrders.length}</span>
          <span className="text-xs text-hrr-silver">{t('cars_today')}</span>
        </div>
        <div className="stat-card">
          <FiTool className="text-2xl text-orange-400" />
          <span className="text-2xl font-bold">{inProgress.length}</span>
          <span className="text-xs text-hrr-silver">{t('in_workshop')}</span>
        </div>
        <div className="stat-card">
          <FiCheckCircle className="text-2xl text-green-400" />
          <span className="text-2xl font-bold">{ready.length}</span>
          <span className="text-xs text-hrr-silver">{t('ready')}</span>
        </div>
        <div className="stat-card">
          <FiDollarSign className="text-xl md:text-2xl text-hrr-gold" />
          <span className="text-sm md:text-xl font-bold text-hrr-gold">{formatCurrency(todayRevenue)}</span>
          <span className="text-xs text-hrr-silver">{t('income_today')}</span>
        </div>
        {isAdmin && (
          <>
            <div className="stat-card">
              <FiUsers className="text-2xl text-purple-400" />
              <span className="text-2xl font-bold">{customers.length}</span>
              <span className="text-xs text-hrr-silver">{t('customers')}</span>
            </div>
            <div className="stat-card">
              <FiAlertTriangle className="text-2xl text-red-400" />
              <span className="text-2xl font-bold text-red-400">{lowStock.length}</span>
              <span className="text-xs text-hrr-silver">{t('low_stock_alert')}</span>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* أوامر الشغل النشطة */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold">{t('work_orders')} - {t('in_workshop')}</h3>
            <Link to="/admin/work-orders" className="text-hrr-red text-sm flex items-center gap-1 hover:underline">
              {t('view')} <FiArrowRight />
            </Link>
          </div>
          {inProgress.length === 0 ? (
            <p className="text-hrr-silver text-center py-6">{t('no_results')}</p>
          ) : (
            <div className="space-y-2">
              {inProgress.slice(0, 8).map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-hrr-steel rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{order.orderNumber}</span>
                      <span className={`badge text-white text-xs ${STATUS_COLORS[order.status]}`}>{t(order.status)}</span>
                    </div>
                    <p className="text-hrr-silver text-xs mt-1">
                      Ford {order.carModel} {order.carYear} • {order.customerName}
                    </p>
                  </div>
                  <span className="text-xs text-hrr-silver">{formatDate(order.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* سيارات جاهزة للاستلام */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-green-400">✅ {t('ready')}</h3>
          </div>
          {ready.length === 0 ? (
            <p className="text-hrr-silver text-center py-6">{t('no_results')}</p>
          ) : (
            <div className="space-y-2">
              {ready.map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div>
                    <span className="font-bold text-sm">{order.orderNumber}</span>
                    <p className="text-hrr-silver text-xs mt-1">
                      Ford {order.carModel} • {order.customerName} • {order.customerPhone}
                    </p>
                  </div>
                  <span className="badge bg-green-500 text-white">{t('done')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* تنبيهات المخزون */}
        {isAdmin && lowStock.length > 0 && (
          <div className="card border-red-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-bold text-red-400">⚠️ {t('low_stock_alert')}</h3>
              <Link to="/admin/inventory" className="text-hrr-red text-sm flex items-center gap-1 hover:underline">
                {t('view')} <FiArrowRight />
              </Link>
            </div>
            <div className="space-y-2">
              {lowStock.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <span className="font-bold text-sm">{item.partName}</span>
                  <span className="text-red-400 font-bold">{item.quantity} / {item.minQuantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* تذكير صيانة */}
        {isAdmin && maintenanceReminders.length > 0 && (
          <div className="card border-hrr-gold/30">
            <div className="flex items-center gap-2 mb-4">
              <FiClock className="text-hrr-gold text-xl" />
              <h3 className="font-heading text-lg font-bold text-hrr-gold">{t('maintenance_reminder')}</h3>
            </div>
            <div className="space-y-2">
              {maintenanceReminders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-sm">Ford {order.carModel} {order.carYear}</span>
                    <p className="text-hrr-silver text-xs">{order.customerName} • {order.customerPhone}</p>
                  </div>
                  <div className="flex items-center gap-2 ms-2 shrink-0">
                    <span className="text-xs text-hrr-gold hidden sm:block">{formatDate(order.createdAt)}</span>
                    <button onClick={() => sendMaintenanceReminder(order)} className="btn-primary text-xs py-1.5 px-2 flex items-center gap-1" title="Send Reminder">
                      <FiSend /> <span className="hidden sm:inline">{t('send_whatsapp')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* إيرادات الشهر */}
        {isAdmin && (
          <div className="card">
            <h3 className="font-heading text-lg font-bold mb-4">{t('this_month')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-hrr-steel rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-400">{formatCurrency(monthRevenue)}</p>
                <p className="text-xs text-hrr-silver mt-1">{t('revenue')}</p>
              </div>
              <div className="bg-hrr-steel rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{monthInvoices.length}</p>
                <p className="text-xs text-hrr-silver mt-1">{t('invoices')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
