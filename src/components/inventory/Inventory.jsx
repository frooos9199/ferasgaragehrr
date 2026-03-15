import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import { formatCurrency } from '../../utils/helpers'
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiAlertTriangle } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Inventory() {
  const { t } = useTranslation()
  const { data: items, add, update, remove } = useCollection('inventory')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ partName: '', partNumber: '', quantity: 0, minQuantity: 5, buyPrice: 0, sellPrice: 0 })

  const filtered = items.filter(i =>
    i.partName?.includes(search) || i.partNumber?.includes(search)
  )

  const handleSave = async () => {
    if (!form.partName) return toast.error('Fill part name')
    const data = { ...form, quantity: Number(form.quantity), minQuantity: Number(form.minQuantity), buyPrice: Number(form.buyPrice), sellPrice: Number(form.sellPrice) }
    if (editing) await update(editing.id, data)
    else await add(data)
    setForm({ partName: '', partNumber: '', quantity: 0, minQuantity: 5, buyPrice: 0, sellPrice: 0 })
    setShowForm(false)
    setEditing(null)
    toast.success('✅')
  }

  const handleEdit = (i) => {
    setForm({ partName: i.partName, partNumber: i.partNumber, quantity: i.quantity, minQuantity: i.minQuantity, buyPrice: i.buyPrice, sellPrice: i.sellPrice })
    setEditing(i)
    setShowForm(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="font-heading text-xl md:text-2xl font-bold">{t('inventory')}</h2>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ partName: '', partNumber: '', quantity: 0, minQuantity: 5, buyPrice: 0, sellPrice: 0 }) }} className="btn-primary flex items-center gap-2 text-sm md:text-base py-2 px-3 md:px-6">
          <FiPlus /> {t('add')}
        </button>
      </div>

      <div className="relative mb-4">
        <FiSearch className="absolute top-3.5 start-4 text-hrr-silver" />
        <input type="text" placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} className="input-field ps-10" />
      </div>

      {showForm && (
        <div className="card mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input placeholder={t('part_name')} value={form.partName} onChange={e => setForm({ ...form, partName: e.target.value })} className="input-field" />
          <input placeholder={t('part_number')} value={form.partNumber} onChange={e => setForm({ ...form, partNumber: e.target.value })} className="input-field" dir="ltr" />
          <input type="number" placeholder={t('quantity')} value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="input-field" />
          <input type="number" placeholder={t('min_quantity')} value={form.minQuantity} onChange={e => setForm({ ...form, minQuantity: e.target.value })} className="input-field" />
          <input type="number" step="0.001" placeholder={t('buy_price')} value={form.buyPrice} onChange={e => setForm({ ...form, buyPrice: e.target.value })} className="input-field" />
          <input type="number" step="0.001" placeholder={t('sell_price')} value={form.sellPrice} onChange={e => setForm({ ...form, sellPrice: e.target.value })} className="input-field" />
          <div className="col-span-1 sm:col-span-2 flex gap-2">
            <button onClick={handleSave} className="btn-primary">{t('save')}</button>
            <button onClick={() => { setShowForm(false); setEditing(null) }} className="btn-secondary">{t('cancel')}</button>
          </div>
        </div>
      )}

      <div className="card overflow-x-auto">
        {/* Desktop table */}
        <table className="w-full text-sm hidden md:table">
          <thead>
            <tr className="text-hrr-silver border-b border-hrr-silver/10">
              <th className="text-start p-3">{t('part_name')}</th>
              <th className="text-start p-3">{t('part_number')}</th>
              <th className="p-3">{t('quantity')}</th>
              <th className="p-3">{t('buy_price')}</th>
              <th className="p-3">{t('sell_price')}</th>
              <th className="p-3">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id} className="table-row">
                <td className="p-3 font-bold">
                  {i.quantity <= i.minQuantity && <FiAlertTriangle className="inline text-red-400 me-1" />}
                  {i.partName}
                </td>
                <td className="p-3" dir="ltr">{i.partNumber}</td>
                <td className={`p-3 text-center font-bold ${i.quantity <= i.minQuantity ? 'text-red-400' : ''}`}>{i.quantity}</td>
                <td className="p-3 text-center">{formatCurrency(i.buyPrice)}</td>
                <td className="p-3 text-center">{formatCurrency(i.sellPrice)}</td>
                <td className="p-3 text-center">
                  <button onClick={() => handleEdit(i)} className="text-blue-400 mx-1"><FiEdit2 /></button>
                  <button onClick={() => { if (confirm(t('confirm_delete'))) remove(i.id) }} className="text-red-400 mx-1"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile cards */}
        <div className="md:hidden space-y-2">
          {filtered.map(i => (
            <div key={i.id} className="bg-hrr-steel rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm flex items-center gap-1">
                    {i.quantity <= i.minQuantity && <FiAlertTriangle className="text-red-400" />}
                    {i.partName}
                  </p>
                  <p className="text-xs text-hrr-silver" dir="ltr">{i.partNumber}</p>
                  <div className="flex gap-3 mt-1 text-xs">
                    <span className={i.quantity <= i.minQuantity ? 'text-red-400 font-bold' : ''}>{t('quantity')}: {i.quantity}</span>
                    <span>{t('sell_price')}: {formatCurrency(i.sellPrice)}</span>
                  </div>
                </div>
                <div className="flex gap-2 ms-2 shrink-0">
                  <button onClick={() => handleEdit(i)} className="text-blue-400"><FiEdit2 /></button>
                  <button onClick={() => { if (confirm(t('confirm_delete'))) remove(i.id) }} className="text-red-400"><FiTrash2 /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
