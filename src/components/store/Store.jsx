import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrency } from '../../utils/helpers'
import { FORD_MODELS, WHATSAPP_NUMBER } from '../../config/constants'
// Firebase storage will be connected later
import { FiPlus, FiUpload, FiTrash2, FiEdit2 } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Store() {
  const { t } = useTranslation()
  const { isAdmin } = useAuth()
  const { data: products, add, update, remove } = useCollection('storeProducts')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', model: '', price: 0, fileUrl: '', fileType: 'pdf' })

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setForm({ ...form, fileUrl: url })
    toast.success('📁 Uploaded')
  }

  const handleSave = async () => {
    if (!form.title || !form.price) return toast.error('Fill required fields')
    if (editing) await update(editing.id, form)
    else await add({ ...form, price: Number(form.price), active: true })
    setForm({ title: '', description: '', model: '', price: 0, fileUrl: '', fileType: 'pdf' })
    setShowForm(false)
    setEditing(null)
    toast.success('✅')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold">{t('store')}</h2>
        {isAdmin && (
          <button onClick={() => { setShowForm(true); setEditing(null) }} className="btn-primary flex items-center gap-2">
            <FiPlus /> {t('add')}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card mb-4 space-y-3">
          <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" rows={2} />
          <div className="flex gap-2">
            <select value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} className="input-field">
              <option value="">Ford Model...</option>
              {FORD_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={form.fileType} onChange={e => setForm({ ...form, fileType: e.target.value })} className="input-field">
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="ecu">ECU File</option>
              <option value="other">Other</option>
            </select>
          </div>
          <input type="number" step="0.001" placeholder="Price (KWD)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-field" />
          <div>
            <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer">
              <FiUpload /> Upload File
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
            {form.fileUrl && <span className="text-green-400 ms-2 text-sm">✅ File uploaded</span>}
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-primary">{t('save')}</button>
            <button onClick={() => { setShowForm(false); setEditing(null) }} className="btn-secondary">{t('cancel')}</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {products.map(p => (
          <div key={p.id} className="card hover:border-hrr-red/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">{p.title}</h3>
              <span className="badge bg-hrr-red text-white">{p.fileType}</span>
            </div>
            <p className="text-hrr-silver text-sm mb-2">{p.description}</p>
            {p.model && <span className="badge bg-hrr-steel text-hrr-silver">Ford {p.model}</span>}
            <div className="flex items-center justify-between mt-4">
              <span className="font-bold text-hrr-gold text-lg">{formatCurrency(p.price)}</span>
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I want to buy: ${p.title} - ${formatCurrency(p.price)}`)}`}
                  target="_blank"
                  className="btn-primary text-sm"
                >
                  💬 Order
                </a>
                {isAdmin && (
                  <>
                    <button onClick={() => { setForm(p); setEditing(p); setShowForm(true) }} className="text-blue-400"><FiEdit2 /></button>
                    <button onClick={() => { if (confirm(t('confirm_delete'))) remove(p.id) }} className="text-red-400"><FiTrash2 /></button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
