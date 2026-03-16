import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { FiDollarSign, FiTool, FiTruck, FiFileText, FiDownload, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'

const PAGE_SIZE = 15

export default function Reports() {
  const { t } = useTranslation()
  const { data: invoices } = useCollection('invoices')
  const { data: orders } = useCollection('workOrders')
  const { data: customers } = useCollection('customers')
  const { data: inventory } = useCollection('inventory')
  const [period, setPeriod] = useState('month')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(0)

  const now = new Date()
  const filterByPeriod = (item) => {
    const d = new Date(item.createdAt)
    if (period === 'custom' && dateFrom && dateTo) {
      return d >= new Date(dateFrom) && d <= new Date(dateTo + 'T23:59:59')
    }
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

  const serviceCount = periodOrders.reduce((acc, o) => {
    acc[o.serviceType] = (acc[o.serviceType] || 0) + 1
    return acc
  }, {})
  const sortedServices = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])

  const modelCount = periodOrders.reduce((acc, o) => {
    const key = `Ford ${o.carModel}`
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const sortedModels = Object.entries(modelCount).sort((a, b) => b[1] - a[1])

  const inventoryValue = inventory.reduce((s, i) => s + (i.quantity * i.buyPrice), 0)

  // Pagination
  const totalPages = Math.ceil(periodInvoices.length / PAGE_SIZE)
  const pagedInvoices = periodInvoices.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  // Excel Export
  const exportInvoices = () => {
    const data = periodInvoices.map(inv => ({
      'Invoice #': inv.number,
      'Customer': inv.customerName,
      'Phone': inv.customerPhone,
      'Car': `Ford ${inv.carModel} ${inv.carYear}`,
      'Plate': inv.carPlate,
      'Parts': (inv.items || []).map(i => i.name).join(', '),
      'Parts Cost': (inv.items || []).reduce((s, i) => s + (i.price || 0), 0),
      'Labor': inv.laborCost || 0,
      'Total (KWD)': inv.total || 0,
      'Date': formatDate(inv.createdAt),
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Invoices')
    XLSX.writeFile(wb, `HRR_Invoices_${new Date().toISOString().slice(0, 10)}.xlsx`)
    toast.success('📊 Excel exported!')
  }

  const exportOrders = () => {
    const data = periodOrders.map(o => ({
      'Order #': o.orderNumber,
      'Customer': o.customerName,
      'Phone': o.customerPhone,
      'Car': `Ford ${o.carModel} ${o.carYear}`,
      'Plate': o.carPlate,
      'Service': o.serviceType,
      'Status': o.status,
      'Technician': o.technicianName,
      'Total (KWD)': o.totalCost || 0,
      'Date': formatDate(o.createdAt),
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Work Orders')
    XLSX.writeFile(wb, `HRR_Orders_${new Date().toISOString().slice(0, 10)}.xlsx`)
    toast.success('📊 Excel exported!')
  }

  const exportInventory = () => {
    const data = inventory.map(i => ({
      'Part Name': i.partName,
      'Part Number': i.partNumber || '',
      'Quantity': i.quantity,
      'Min Qty': i.minQuantity,
      'Buy Price': i.buyPrice,
      'Sell Price': i.sellPrice || '',
      'Total Value': i.quantity * i.buyPrice,
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory')
    XLSX.writeFile(wb, `HRR_Inventory_${new Date().toISOString().slice(0, 10)}.xlsx`)
    toast.success('📊 Excel exported!')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="font-heading text-2xl font-bold">{t('reports')}</h2>
        <div className="flex gap-2 flex-wrap">
          {['today', 'week', 'month', 'all', 'custom'].map(p => (
            <button key={p} onClick={() => { setPeriod(p); setPage(0) }}
              className={`badge cursor-pointer px-3 py-2 text-xs ${period === p ? 'bg-hrr-red' : 'bg-hrr-steel'} text-white`}>
              {p === 'custom' ? '📅 Custom' : p === 'week' ? 'Week' : t(p === 'all' ? 'all' : p === 'today' ? 'today' : 'this_month')}
            </button>
          ))}
        </div>
      </div>

      {period === 'custom' && (
        <div className="flex gap-3 mb-4 items-center flex-wrap">
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0) }} className="input-field w-40 py-2 text-sm" />
          <span className="text-hrr-silver">→</span>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0) }} className="input-field w-40 py-2 text-sm" />
        </div>
      )}

      {/* Stats */}
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

      {/* Export Buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={exportInvoices} className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
          <FiDownload /> Export Invoices
        </button>
        <button onClick={exportOrders} className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
          <FiDownload /> Export Orders
        </button>
        <button onClick={exportInventory} className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
          <FiDownload /> Export Inventory
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Services */}
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

        {/* Models */}
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

        {/* Inventory */}
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

        {/* Customers */}
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

        {/* Invoices Table with Pagination */}
        <div className="card col-span-1 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold">🧾 {t('invoices')} ({periodInvoices.length})</h3>
          </div>
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
                {pagedInvoices.map(inv => (
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
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-hrr-silver/10">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="btn-secondary py-1.5 px-3 disabled:opacity-30"><FiChevronLeft /></button>
              <span className="text-sm text-hrr-silver">{page + 1} / {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="btn-secondary py-1.5 px-3 disabled:opacity-30"><FiChevronRight /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
