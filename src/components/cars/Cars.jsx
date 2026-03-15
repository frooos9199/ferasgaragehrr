import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import { FORD_MODELS, YEARS } from '../../config/constants'
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Cars() {
  const { t } = useTranslation()
  const { data: cars, add, update, remove } = useCollection('cars')
  const { data: customers } = useCollection('customers')
  const { data: orders, update: updateOrder } = useCollection('workOrders')
  const { data: invoices, update: updateInvoice } = useCollection('invoices')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ customerId: '', model: '', year: '', platePrefix: '', plateNum: '', vin: '' })

  const filtered = cars.filter(c =>
    c.model?.toLowerCase().includes(search.toLowerCase()) ||
    c.plateNumber?.includes(search) ||
    c.vin?.includes(search) ||
    c.customerName?.includes(search)
  )

  const syncCarData = async (carId, newModel, newYear, newPlate) => {
    orders.filter(o => o.carId === carId).forEach(o => {
      updateOrder(o.id, { carModel: newModel, carYear: newYear, carPlate: newPlate })
    })
    invoices.filter(i => i.carId === carId).forEach(i => {
      updateInvoice(i.id, { carModel: newModel, carYear: newYear, carPlate: newPlate })
    })
  }

  const handleSave = async () => {
    if (!form.customerId || !form.model || !form.year || !form.platePrefix || !form.plateNum) return toast.error('Fill required fields')
    const customer = customers.find(c => c.id === form.customerId)
    const plateNumber = `${form.platePrefix} / ${form.plateNum}`
    const data = { ...form, plateNumber, customerName: customer?.name || '', customerPhone: customer?.phone || '' }
    if (editing) {
      await update(editing.id, data)
      await syncCarData(editing.id, form.model, form.year, form.plateNumber)
      toast.success('✅ Updated')
    } else {
      await add(data)
      toast.success('✅ Added')
    }
    setForm({ customerId: '', model: '', year: '', platePrefix: '', plateNum: '', vin: '' })
    setShowForm(false)
    setEditing(null)
  }

  const handleEdit = (c) => {
    const parts = (c.plateNumber || '').split(' / ')
    setForm({ customerId: c.customerId, model: c.model, year: c.year, platePrefix: parts[0] || '', plateNum: parts[1] || '', vin: c.vin || '' })
    setEditing(c)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm(t('confirm_delete'))) {
      await remove(id)
      toast.success('✅')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="font-heading text-xl md:text-2xl font-bold">{t('cars')}</h2>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ customerId: '', model: '', year: '', platePrefix: '', plateNum: '', vin: '' }) }}
          className="btn-primary flex items-center gap-2 text-sm md:text-base py-2 px-3 md:px-6">
          <FiPlus /> {t('add')}
        </button>
      </div>

      <div className="relative mb-4">
        <FiSearch className="absolute top-3.5 start-4 text-hrr-silver" />
        <input type="text" placeholder={`${t('search')}...`} value={search} onChange={e => setSearch(e.target.value)} className="input-field ps-10" />
      </div>

      {showForm && (
        <div className="card mb-4 border-hrr-red/30 space-y-3">
          <h3 className="font-heading font-bold">{editing ? t('edit') : t('add')} {t('car')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })} className="input-field">
              <option value="">{t('customer')}...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
            </select>
            <select value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} className="input-field">
              <option value="">{t('model')}...</option>
              {FORD_MODELS.map(m => <option key={m} value={m}>Ford {m}</option>)}
            </select>
            <select value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="input-field">
              <option value="">{t('year')}...</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <div className="flex gap-2 items-center sm:col-span-2">
              <span className="text-sm text-hrr-silver whitespace-nowrap">{t('plate_number')}</span>
              <input placeholder="1" value={form.platePrefix} onChange={e => setForm({ ...form, platePrefix: e.target.value.slice(0, 2) })} className="input-field w-16 text-center" maxLength={2} dir="ltr" />
              <span className="text-hrr-silver font-bold">/</span>
              <input placeholder="12345" value={form.plateNum} onChange={e => setForm({ ...form, plateNum: e.target.value.replace(/\D/g, '').slice(0, 6) })} className="input-field w-32" dir="ltr" />
            </div>
            <input placeholder={`${t('vin')} (${t('notes')})`} value={form.vin} onChange={e => setForm({ ...form, vin: e.target.value })} className="input-field sm:col-span-2" dir="ltr" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-primary">{t('save')}</button>
            <button onClick={() => { setShowForm(false); setEditing(null) }} className="btn-secondary">{t('cancel')}</button>
          </div>
        </div>
      )}

      {/* Desktop table */}
      <div className="card overflow-x-auto hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-hrr-silver border-b border-hrr-silver/10">
              <th className="text-start p-3">{t('customer')}</th>
              <th className="text-start p-3">{t('model')}</th>
              <th className="text-start p-3">{t('year')}</th>
              <th className="text-start p-3">{t('plate_number')}</th>
              <th className="text-start p-3">{t('vin')}</th>
              <th className="p-3">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="table-row">
                <td className="p-3">{c.customerName}</td>
                <td className="p-3 font-bold">Ford {c.model}</td>
                <td className="p-3">{c.year}</td>
                <td className="p-3">{c.plateNumber}</td>
                <td className="p-3 text-hrr-silver" dir="ltr">{c.vin}</td>
                <td className="p-3 text-center">
                  <button onClick={() => handleEdit(c)} className="text-blue-400 hover:text-blue-300 mx-1"><FiEdit2 /></button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300 mx-1"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-hrr-silver py-8">{t('no_results')}</p>}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {filtered.map(c => (
          <div key={c.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-bold">Ford {c.model} <span className="text-hrr-silver">{c.year}</span></p>
                <p className="text-sm text-hrr-silver mt-1">👤 {c.customerName}</p>
                <p className="text-xs text-hrr-silver">🔢 {c.plateNumber}</p>
                {c.vin && <p className="text-xs text-hrr-silver" dir="ltr">VIN: {c.vin}</p>}
              </div>
              <div className="flex gap-2 ms-2 shrink-0">
                <button onClick={() => handleEdit(c)} className="text-blue-400"><FiEdit2 /></button>
                <button onClick={() => handleDelete(c.id)} className="text-red-400"><FiTrash2 /></button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-hrr-silver py-8">{t('no_results')}</p>}
      </div>
    </div>
  )
}
