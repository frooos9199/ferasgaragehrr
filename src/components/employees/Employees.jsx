import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import { db } from '../../config/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { FiPlus, FiTrash2, FiEdit2, FiMail } from 'react-icons/fi'
import toast from 'react-hot-toast'

// Secondary Firebase app for creating users without logging out admin
const secondaryApp = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
}, 'secondary')
const secondaryAuth = getAuth(secondaryApp)

export default function Employees() {
  const { t } = useTranslation()
  const { data: employees, loading, update, remove } = useCollection('users')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'technician' })
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) return toast.error('Fill all fields')
    if (form.password.length < 6) return toast.error('Password must be 6+ characters')
    setCreating(true)
    try {
      // Create user with secondary auth (doesn't affect current session)
      const cred = await createUserWithEmailAndPassword(secondaryAuth, form.email, form.password)
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: form.name,
        email: form.email,
        phone: form.phone || '',
        role: form.role,
        createdAt: new Date().toISOString()
      })
      // Sign out from secondary auth
      await secondaryAuth.signOut()
      toast.success('✅ Employee added')
      setShowForm(false)
      setForm({ name: '', email: '', phone: '', password: '', role: 'technician' })
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use' ? 'Email already exists'
        : err.code === 'auth/weak-password' ? 'Password too weak'
        : err.message
      toast.error(`❌ ${msg}`)
    }
    setCreating(false)
  }

  const handleUpdate = async () => {
    if (!form.name) return toast.error('Name required')
    await update(editId, { name: form.name, phone: form.phone, role: form.role })
    toast.success('✅ Updated')
    setEditId(null)
    setShowForm(false)
    setForm({ name: '', email: '', phone: '', password: '', role: 'technician' })
  }

  const handleDelete = async (emp) => {
    if (!confirm(t('confirm_delete'))) return
    await remove(emp.id)
    toast.success('🗑️ Deleted from system')
  }

  const startEdit = (emp) => {
    setEditId(emp.id)
    setForm({ name: emp.name, email: emp.email, phone: emp.phone || '', password: '', role: emp.role })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditId(null)
    setForm({ name: '', email: '', phone: '', password: '', role: 'technician' })
  }

  if (loading) return <div className="text-center text-hrr-silver py-12">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="font-heading text-xl md:text-2xl font-bold">{t('employees')}</h2>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary flex items-center gap-2 text-sm md:text-base py-2 px-3 md:px-6">
          <FiPlus /> {t('add')}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 border-hrr-red/30">
          <h3 className="font-heading font-bold mb-4">{editId ? t('edit') : t('add')} {t('employees')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder={t('name')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
            {!editId && <input type="email" placeholder={t('email')} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" dir="ltr" />}
            <input placeholder={t('phone')} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" dir="ltr" />
            {!editId && <input type="password" placeholder={`${t('password')} (6+ chars)`} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-field" />}
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input-field">
              <option value="admin">{t('admin')}</option>
              <option value="technician">{t('technician')}</option>
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={editId ? handleUpdate : handleCreate} disabled={creating} className="btn-primary">
              {creating ? '...' : t('save')}
            </button>
            <button onClick={resetForm} className="btn-secondary">{t('cancel')}</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {employees.map(emp => (
          <div key={emp.id} className="card flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-bold">{emp.name}</p>
              <p className="text-hrr-silver text-sm flex items-center gap-1 flex-wrap">
                <FiMail size={12} /> {emp.email} {emp.phone && `• ${emp.phone}`}
              </p>
            </div>
            <div className="flex items-center gap-3 ms-2 shrink-0">
              <span className={`badge text-white text-xs ${emp.role === 'admin' ? 'bg-hrr-red' : 'bg-hrr-steel'}`}>
                {emp.role === 'admin' ? t('admin') : t('technician')}
              </span>
              <button onClick={() => startEdit(emp)} className="text-hrr-silver hover:text-white"><FiEdit2 /></button>
              <button onClick={() => handleDelete(emp)} className="text-red-400 hover:text-red-300"><FiTrash2 /></button>
            </div>
          </div>
        ))}
        {employees.length === 0 && <p className="text-center text-hrr-silver py-12">{t('no_results')}</p>}
      </div>
    </div>
  )
}
