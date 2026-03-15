import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('✅')
    } catch (err) {
      console.error('Login error:', err.code, err.message)
      const msg = err.code === 'auth/user-not-found' ? 'User not found'
        : err.code === 'auth/wrong-password' ? 'Wrong password'
        : err.code === 'auth/invalid-credential' ? 'Invalid email or password'
        : err.code === 'auth/too-many-requests' ? 'Too many attempts, try later'
        : err.message || 'Login failed'
      toast.error(`❌ ${msg}`)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-hrr-dark flex items-center justify-center p-4">
      <div className="card w-full max-w-md text-center">
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-hrr-red tracking-widest">
            🏁 HRR
          </h1>
          <p className="font-heading text-lg text-white mt-1">HOT ROD RACING</p>
          <p className="text-hrr-silver text-sm mt-2">{t('managed_by')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder={t('email')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input-field"
            required
          />
          <input
            type="password"
            placeholder={t('password')}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input-field"
            required
          />
          <button type="submit" disabled={loading} className="btn-primary w-full text-lg py-3">
            {loading ? '...' : t('login')}
          </button>
        </form>
      </div>
    </div>
  )
}
