import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import { formatCurrency, formatDate, sendInvoiceWhatsApp, generateOrderNumber } from '../../utils/helpers'
import { FiPlus, FiSend, FiSearch, FiPrinter, FiEdit2, FiTrash2, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { generateInvoicePDF } from '../../utils/pdfGenerator'
import toast from 'react-hot-toast'

const PAGE_SIZE = 15

export default function Invoices() {
  const { t } = useTranslation()
  const { data: invoices, add, update, remove } = useCollection('invoices')
  const { data: orders } = useCollection('workOrders')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [form, setForm] = useState({ orderId: '', laborCost: 0, items: [{ name: '', price: 0 }] })
  const [page, setPage] = useState(0)

  const filtered = invoices
    .filter(i => !search || i.customerName?.toLowerCase().includes(search.toLowerCase()) || i.number?.includes(search) || i.carModel?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleAddItem = () => setForm({ ...form, items: [...form.items, { name: '', price: 0 }] })
  const handleItemChange = (idx, field, value) => {
    const items = [...form.items]
    items[idx][field] = field === 'price' ? Number(value) : value
    setForm({ ...form, items })
  }
  const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })

  const handleSave = async () => {
    const total = form.items.reduce((s, i) => s + (Number(i.price) || 0), 0) + (Number(form.laborCost) || 0)

    if (editingId) {
      await update(editingId, {
        items: form.items.filter(i => i.name),
        laborCost: Number(form.laborCost),
        total,
      })
      toast.success('✅ Invoice updated!')
    } else {
      const order = orders.find(o => o.id === form.orderId)
      if (!order) return toast.error('Select work order')
      await add({
        number: generateOrderNumber().replace('HRR', 'INV'),
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        carId: order.carId,
        carModel: order.carModel,
        carYear: order.carYear,
        carPlate: order.carPlate,
        items: form.items.filter(i => i.name),
        laborCost: Number(form.laborCost),
        total,
      })
      toast.success('🧾 Invoice created!')
    }
    resetForm()
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm({ orderId: '', laborCost: 0, items: [{ name: '', price: 0 }] })
  }

  const startEdit = (inv) => {
    setEditingId(inv.id)
    setForm({
      orderId: inv.orderId || '',
      laborCost: inv.laborCost || 0,
      items: inv.items?.length ? [...inv.items] : [{ name: '', price: 0 }]
    })
    setShowForm(true)
    setSelectedInvoice(null)
  }

  const handleDelete = async (inv) => {
    if (!confirm(t('confirm_delete'))) return
    await remove(inv.id)
    setSelectedInvoice(null)
    toast.success('🗑️ Invoice deleted')
  }

  const handleSendWhatsApp = (inv) => {
    const customer = { name: inv.customerName, phone: inv.customerPhone }
    const car = { model: inv.carModel, year: inv.carYear, plateNumber: inv.carPlate }
    sendInvoiceWhatsApp(inv, customer, car)
  }

  const generatePDF = async (inv) => {
    toast.loading('📄 Generating PDF...')
    await generateInvoicePDF(inv)
    toast.dismiss()
    toast.success('📄 PDF Downloaded!')
  }

  const onSelectOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId)
    if (order) {
      const items = (order.parts || []).map(p => ({ name: p.name, price: p.price * p.quantity }))
      if (!items.length) items.push({ name: '', price: 0 })
      setForm({ orderId, laborCost: order.laborCost || 0, items })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="font-heading text-xl md:text-2xl font-bold">{t('invoices')}</h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm) }} className="btn-primary flex items-center gap-2 text-sm md:text-base py-2 px-3 md:px-6">
          <FiPlus /> {t('add')}
        </button>
      </div>

      <div className="relative mb-4">
        <FiSearch className="absolute top-3.5 start-4 text-hrr-silver" />
        <input type="text" placeholder={`${t('search')}...`} value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} className="input-field ps-10" />
      </div>

      {showForm && (
        <div className="card mb-6 border-hrr-red/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold">{editingId ? t('edit') + ' ' + t('invoice') : t('invoice')}</h3>
            <button onClick={resetForm} className="text-hrr-silver hover:text-white"><FiX /></button>
          </div>

          {!editingId && (
            <select value={form.orderId} onChange={e => onSelectOrder(e.target.value)} className="input-field mb-3">
              <option value="">{t('work_orders')}...</option>
              {orders.map(o => <option key={o.id} value={o.id}>{o.orderNumber} - {o.customerName} - Ford {o.carModel}</option>)}
            </select>
          )}

          <label className="text-sm text-hrr-silver mb-1 block">{t('parts_cost')}</label>
          {form.items.map((item, idx) => (
            <div key={idx} className="flex gap-2 mb-2 items-center">
              <input placeholder={t('part_name')} value={item.name} onChange={e => handleItemChange(idx, 'name', e.target.value)} className="input-field flex-1 py-2" />
              <input type="number" step="0.001" placeholder="KWD" value={item.price} onChange={e => handleItemChange(idx, 'price', e.target.value)} className="input-field w-32 py-2" />
              {form.items.length > 1 && <button onClick={() => removeItem(idx)} className="text-red-400">✕</button>}
            </div>
          ))}
          <button onClick={handleAddItem} className="text-sm text-hrr-red hover:underline mb-3">+ {t('add')}</button>

          <div className="mb-3">
            <label className="text-sm text-hrr-silver mb-1 block">{t('labor_cost')} (KWD)</label>
            <input type="number" step="0.001" value={form.laborCost} onChange={e => setForm({ ...form, laborCost: e.target.value })} className="input-field w-40 py-2" />
          </div>

          <div className="bg-hrr-steel rounded-lg p-3 mb-3 flex justify-between items-center">
            <span className="font-bold">{t('total')}</span>
            <span className="font-bold text-xl text-hrr-gold">
              {formatCurrency(form.items.reduce((s, i) => s + (Number(i.price) || 0), 0) + (Number(form.laborCost) || 0))}
            </span>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-primary">{t('save')}</button>
            <button onClick={resetForm} className="btn-secondary">{t('cancel')}</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {paged.map(inv => (
          <div key={inv.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1 cursor-pointer" onClick={() => setSelectedInvoice(selectedInvoice?.id === inv.id ? null : inv)}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-heading font-bold text-sm md:text-base">{inv.number}</span>
                  <span className="text-hrr-silver hidden sm:inline">•</span>
                  <span className="text-sm">{inv.customerName}</span>
                </div>
                <p className="text-xs text-hrr-silver mt-1">
                  Ford {inv.carModel} {inv.carYear} • {formatDate(inv.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 md:gap-3 ms-2 shrink-0">
                <span className="font-bold text-hrr-gold text-sm md:text-lg">{formatCurrency(inv.total)}</span>
                <button onClick={() => handleSendWhatsApp(inv)} className="btn-primary text-xs md:text-sm py-1.5 px-2 md:px-3" title="WhatsApp"><FiSend /></button>
                <button onClick={() => generatePDF(inv)} className="btn-secondary text-xs md:text-sm py-1.5 px-2 md:px-3 hidden sm:flex" title="PDF"><FiPrinter /></button>
                <button onClick={() => startEdit(inv)} className="text-blue-400 hover:text-blue-300 p-1" title="Edit"><FiEdit2 size={16} /></button>
                <button onClick={() => handleDelete(inv)} className="text-red-400 hover:text-red-300 p-1" title="Delete"><FiTrash2 size={16} /></button>
              </div>
            </div>

            {selectedInvoice?.id === inv.id && (
              <div className="mt-4 pt-4 border-t border-hrr-silver/10">
                <div className="bg-hrr-steel rounded-lg p-4 space-y-2">
                  {(inv.items || []).map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span>{formatCurrency(item.price)}</span>
                    </div>
                  ))}
                  {inv.laborCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Labor</span>
                      <span>{formatCurrency(inv.laborCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-hrr-silver/20">
                    <span>Total</span>
                    <span className="text-hrr-gold">{formatCurrency(inv.total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-hrr-silver py-12">{t('no_results')}</p>}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="btn-secondary py-1.5 px-3 disabled:opacity-30"><FiChevronLeft /></button>
            <span className="text-sm text-hrr-silver">{page + 1} / {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="btn-secondary py-1.5 px-3 disabled:opacity-30"><FiChevronRight /></button>
          </div>
        )}
      </div>
    </div>
  )
}
