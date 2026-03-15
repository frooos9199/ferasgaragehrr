import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrency } from '../../utils/helpers'
import { FORD_MODELS, WHATSAPP_NUMBER } from '../../config/constants'
import { storage } from '../../config/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { FiPlus, FiUpload, FiTrash2, FiEdit2, FiEye, FiEyeOff } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Store() {
  const { t } = useTranslation()
  const { isAdmin } = useAuth()
  const { data: products, add, update, remove } = useCollection('storeProducts')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', model: '', price: 0, fileUrl: '', fileType: 'pdf', active: true })
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const path = `store/${Date.now()}_${file.name}`
      const storageRef = ref(storage, path)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      setForm({ ...form, fileUrl: url })
      toast.success('📁 Uploaded')
    } catch (err) {
      toast.error('Upload failed')
    }
    setUploading(false)
  }

  const handleSave = async () => {
    if (!form.title || !form.price) return toast.error('Fill required fields')
    if (editing) {
      await update(editing.id, { ...form, price: Number(form.price) })
    } else {
      await add({ ...form, price: Number(form.price) })
    }
    setForm({ title: '', description: '', model: '', price: 0, fileUrl: '', fileType: 'pdf', active: true })
    setShowForm(false)
    setEditing(null)
    toast.success('✅')
  }

  const toggleActive = async (p) => {
    await update(p.id, { active: !p.active })
    toast.success(p.active ? '🔴 Hidden' : '🟢 Visible')
  }

  const handleDelete = async (p) => {
    if (!confirm(t('confirm_delete'))) return
    await remove(p.id)
    toast.success('🗑️')
  }

  const startEdit = (p) => {
    setForm({ title: p.title, description: p.description || '', model: p.model || '', price: p.price, fileUrl: p.fileUrl || '', fileType: p.fileType || 'pdf', active: p.active !== false })
    setEditing(p)
    setShowForm(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-2xl font-bold">{t('store')}</h2>
          <p className="text-hrr-silver text-sm">{products.length} products • {products.filter(p => p.active !== false).length} visible on homepage</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setShowForm(true); setEditing(null); setForm({ title: '', description: '', model: '', price: 0, fileUrl: '', fileType: 'pdf', active: true }) }} className="btn-primary flex items-center gap-2">
            <FiPlus /> {t('add')}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card mb-4 space-y-3 border-hrr-red/30">
          <h3 className="font-heading font-bold">{editing ? t('edit') : t('add')}</h3>
          <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" rows={2} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} className="input-field">
              <option value="">Ford Model...</option>
              <option value="All Models">All Models</option>
              {FORD_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={form.fileType} onChange={e => setForm({ ...form, fileType: e.target.value })} className="input-field">
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="ecu">ECU File</option>
              <option value="program">Program</option>
              <option value="other">Other</option>
            </select>
          </div>
          <input type="number" step="0.001" placeholder="Price (KWD)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-field" />
          <div>
            <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer">
              <FiUpload /> {uploading ? 'Uploading...' : 'Upload File'}
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
            {form.fileUrl && <span className="text-green-400 ms-2 text-sm">✅ File ready</span>}
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-primary">{t('save')}</button>
            <button onClick={() => { setShowForm(false); setEditing(null) }} className="btn-secondary">{t('cancel')}</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {products.map(p => (
          <div key={p.id} className={`card hover:border-hrr-red/50 transition-colors ${p.active === false ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">{p.title}</h3>
              <div className="flex items-center gap-2">
                <span className={`badge text-white ${p.fileType === 'pdf' ? 'bg-red-600' : p.fileType === 'ecu' ? 'bg-blue-600' : p.fileType === 'program' ? 'bg-purple-600' : 'bg-hrr-steel'}`}>{p.fileType?.toUpperCase()}</span>
                {p.active === false && <span className="badge bg-gray-600 text-white">Hidden</span>}
              </div>
            </div>
            <p className="text-hrr-silver text-sm mb-2">{p.description}</p>
            {p.model && <span className="badge bg-hrr-steel text-hrr-silver">Ford {p.model}</span>}
            <div className="flex items-center justify-between mt-4">
              <span className="font-bold text-hrr-gold text-lg">{formatCurrency(p.price)}</span>
              <div className="flex gap-2 items-center">
                <button onClick={() => toggleActive(p)} className={`${p.active !== false ? 'text-green-400' : 'text-gray-400'} hover:opacity-80`} title={p.active !== false ? 'Hide' : 'Show'}>
                  {p.active !== false ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                </button>
                <button onClick={() => startEdit(p)} className="text-blue-400 hover:text-blue-300"><FiEdit2 size={16} /></button>
                <button onClick={() => handleDelete(p)} className="text-red-400 hover:text-red-300"><FiTrash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && <p className="text-center text-hrr-silver py-12 col-span-full">{t('no_results')}</p>}
      </div>
    </div>
  )
}
