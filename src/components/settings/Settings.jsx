import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { useCollection } from '../../hooks/useCollection'
import { FiPlus, FiTrash2, FiGlobe, FiUser, FiShield } from 'react-icons/fi'
import toast from 'react-hot-toast'

const LANGS = [
  { code: 'ar', label: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩', dir: 'ltr' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
]

export default function Settings() {
  const { t, i18n } = useTranslation()
  const { isAdmin, userData } = useAuth()
  const { data: users, add, remove } = useCollection('users')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'technician' })

  const changeLang = (code) => {
    i18n.changeLanguage(code)
    const lang = LANGS.find(l => l.code === code)
    document.documentElement.dir = lang.dir
    document.documentElement.lang = code
    toast.success(`${lang.flag} ${lang.label}`)
  }

  const handleSave = async () => {
    if (!form.name || !form.email) return toast.error('Fill required fields')
    await add(form)
    setForm({ name: '', email: '', role: 'technician' })
    setShowForm(false)
    toast.success('✅')
  }

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold">{t('settings')}</h2>

      {/* اللغة */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <FiGlobe className="text-xl text-hrr-red" />
          <h3 className="font-heading text-lg font-bold">{t('language')}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {LANGS.map(l => (
            <button key={l.code} onClick={() => changeLang(l.code)}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                i18n.language === l.code
                  ? 'border-hrr-red bg-hrr-red/10'
                  : 'border-hrr-silver/20 bg-hrr-steel hover:border-hrr-silver/40'
              }`}>
              <span className="text-3xl block mb-2">{l.flag}</span>
              <span className="font-bold">{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* معلومات الحساب */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <FiUser className="text-xl text-blue-400" />
          <h3 className="font-heading text-lg font-bold">{t('admin')}</h3>
        </div>
        <div className="bg-hrr-steel rounded-lg p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-hrr-red flex items-center justify-center text-xl font-bold">
            {userData?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <p className="font-bold">{userData?.name}</p>
            <p className="text-sm text-hrr-silver">{userData?.email}</p>
            <span className={`badge mt-1 ${userData?.role === 'admin' ? 'bg-hrr-red' : 'bg-blue-600'} text-white`}>
              {t(userData?.role || 'admin')}
            </span>
          </div>
        </div>
      </div>

      {/* إدارة الموظفين */}
      {isAdmin && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiShield className="text-xl text-hrr-gold" />
              <h3 className="font-heading text-lg font-bold">{t('employees')}</h3>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
              <FiPlus /> {t('add')}
            </button>
          </div>

          {showForm && (
            <div className="space-y-3 mb-4 p-4 bg-hrr-steel rounded-lg">
              <input placeholder={t('name')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
              <input placeholder={t('email')} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" dir="ltr" />
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input-field">
                <option value="technician">{t('technician')}</option>
                <option value="admin">{t('admin')}</option>
              </select>
              <div className="flex gap-2">
                <button onClick={handleSave} className="btn-primary">{t('save')}</button>
                <button onClick={() => setShowForm(false)} className="btn-secondary">{t('cancel')}</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-hrr-steel rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-hrr-gray flex items-center justify-center font-bold">
                    {u.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{u.name}</p>
                    <p className="text-xs text-hrr-silver" dir="ltr">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${u.role === 'admin' ? 'bg-hrr-red' : 'bg-blue-600'} text-white`}>{t(u.role)}</span>
                  <button onClick={() => { if (confirm(t('confirm_delete'))) remove(u.id) }} className="text-red-400 hover:text-red-300">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
            {users.length === 0 && <p className="text-center text-hrr-silver py-4">{t('no_results')}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
