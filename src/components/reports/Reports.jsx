import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { FiTrendingUp, FiDollarSign, FiTool, FiTruck, FiFileText } from 'react-icons/fi'

export default function Reports() {
  const { t } = useTranslation()
  const { data: invoices } = useCollection('invoices')
  const { data: orders } = useCollection('workOrders')
  const { data: customers } = useCollection('customers')
  const { data: inventory } = useCollection('inventory')
  const [period, setPeriod] = useState('month')

  const now = new Date()
  const filterByPeriod = (item) => {
    const d = new Date(item.createdAt)
    if (period === 'today') return d.toDateString() === now.toDateString()
    if (period === 'week') {
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
      return d >= weekAgo
    }
    if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    return true
  }

  const periodInvoices = invoices.filter(filterByPeriod)
  const periodOrders = orders.filter(filterByPeriod)
  const totalRevenue = periodInvoices.reduce((s, i) => s + (i.total || 0), 0)
  const totalParts = periodInvoices.reduce((s, i) => s + (i.items || []).reduce((ss, item) => ss + (item.price || 0), 0), 0)
  const totalLabor = periodInvoices.reduce((s, i) => s + (i.laborCost || 0), 0)

  // أكثر خدمة مطلوبة
  const serviceCount = periodOrders.reduce((acc, o) => {
    acc[o.serviceType] = (acc[o.serviceType] || 0) + 1
    return acc
  }, {})
  const sortedServices = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])

  // أكثر موديل
  const modelCount = periodOrders.reduce((acc, o) => {
    const key = `Ford ${o.carModel}`
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const sortedModels = Object.entries(modelCount).sort((a, b) => b[1] - a[1])

  // قيمة المخزون
  const inventoryValue = inventory.reduce((s, i) => s + (i.quantity * i.buyPrice), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold">{t('reports')}</h2>
        <div className="flex gap-2">
          {['today', 'week', 'month', 'all'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`badge cursor-pointer px-4 py-2 ${period === p ? 'bg-hrr-red' : 'bg-hrr-steel'} text-white`}>
              {p === 'week' ? 'Week' : t(p === 'all' ? 'all' : p === 'today' ? 'today' : 'this_month')}
            </button>
          ))}
        </div>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <FiDollarSign className="text-2xl text-green-400" />
          <span className="text-xl font-bold text-green-400">{formatCurrency(totalRevenue)}</span>
          <span className="text-xs text-hrr-silver">{t('revenue')}</span>
        </div>
        <div className="stat-card">
          <FiTool className="text-2xl text-blue-400" />
          <span className="text-xl font-bold">{formatCurrency(totalLabor)}</span>
          <span className="text-xs text-hrr-silver">{t('labor_cost')}</span>
        </div>
        <div className="stat-card">
          <FiTruck className="text-2xl text-orange-400" />
          <span className="text-xl font-bold">{formatCurrency(totalParts)}</span>
          <span className="text-xs text-hrr-silver">{t('parts_cost')}</span>
        </div>
        <div className="stat-card">
          <FiFileText className="text-2xl text-purple-400" />
          <span className="text-xl font-bold">{periodOrders.length}</span>
          <span className="text-xs text-hrr-silver">{t('work_orders')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* أكثر خدمة */}
        <div className="card">
          <h3 className="font-heading text-lg font-bold mb-4">{t('service_type')}</h3>
          {sortedServices.length === 0 ? (
            <p className="text-hrr-silver text-center py-4">{t('no_results')}</p>
          ) : (
            <div className="space-y-3">
              {sortedServices.map(([type, count]) => {
                const max = sortedServices[0][1]
                const pct = (count / max) * 100
                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t(type)}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                    <div className="w-full bg-hrr-steel rounded-full h-2">
                      <div className="bg-hrr-red h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* أكثر موديل */}
        <div className="card">
          <h3 className="font-heading text-lg font-bold mb-4">🚗 {t('cars')}</h3>
          {sortedModels.length === 0 ? (
            <p className="text-hrr-silver text-center py-4">{t('no_results')}</p>
          ) : (
            <div className="space-y-3">
              {sortedModels.map(([model, count]) => {
                const max = sortedModels[0][1]
                const pct = (count / max) * 100
                return (
                  <div key={model}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{model}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                    <div className="w-full bg-hrr-steel rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ملخص المخزون */}
        <div className="card">
          <h3 className="font-heading text-lg font-bold mb-4">📦 {t('inventory')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-hrr-steel rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{inventory.length}</p>
              <p className="text-xs text-hrr-silver">{t('part_name')}</p>
            </div>
            <div className="bg-hrr-steel rounded-lg p-4 text-center">
              <p className="text-xl font-bold text-hrr-gold">{formatCurrency(inventoryValue)}</p>
              <p className="text-xs text-hrr-silver">{t('total')}</p>
            </div>
          </div>
        </div>

        {/* ملخص العملاء */}
        <div className="card">
          <h3 className="font-heading text-lg font-bold mb-4">👥 {t('customers')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-hrr-steel rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{customers.length}</p>
              <p className="text-xs text-hrr-silver">{t('customers')}</p>
            </div>
            <div className="bg-hrr-steel rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{periodInvoices.length}</p>
              <p className="text-xs text-hrr-silver">{t('invoices')}</p>
            </div>
          </div>
        </div>

        {/* آخر الفواتير */}
        <div className="card col-span-1 md:col-span-2">
          <h3 className="font-heading text-lg font-bold mb-4">🧾 {t('invoices')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-hrr-silver border-b border-hrr-silver/10">
                  <th className="text-start p-2">#</th>
                  <th className="text-start p-2">{t('customer')}</th>
                  <th className="text-start p-2">{t('car')}</th>
                  <th className="text-start p-2">{t('date')}</th>
                  <th className="p-2">{t('total')}</th>
                </tr>
              </thead>
              <tbody>
                {periodInvoices.slice(0, 10).map(inv => (
                  <tr key={inv.id} className="table-row">
                    <td className="p-2 font-bold">{inv.number}</td>
                    <td className="p-2">{inv.customerName}</td>
                    <td className="p-2">Ford {inv.carModel}</td>
                    <td className="p-2 text-hrr-silver">{formatDate(inv.createdAt)}</td>
                    <td className="p-2 text-center font-bold text-hrr-gold">{formatCurrency(inv.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
