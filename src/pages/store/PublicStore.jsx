import { useState } from 'react'
import { useCollection } from '../../hooks/useCollection'
import { useStoreAuth } from '../../hooks/useStoreAuth'
import { formatCurrency } from '../../utils/helpers'
import { FORD_MODELS, WHATSAPP_NUMBER } from '../../config/constants'
import { FiSearch, FiShoppingBag, FiUser, FiLogOut, FiFilter, FiDownload, FiMessageCircle } from 'react-icons/fi'

export default function PublicStore() {
  const { data: products } = useCollection('storeProducts')
  const { buyer, login, register, logout, addPurchase } = useStoreAuth()
  const [search, setSearch] = useState('')
  const [filterModel, setFilterModel] = useState('')
  const [showAuth, setShowAuth] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [authForm, setAuthForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)

  const activeProducts = products.filter(p => p.active !== false)
  const filtered = activeProducts.filter(p => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase())
    const matchModel = !filterModel || p.model === filterModel
    return matchSearch && matchModel
  })

  const usedModels = [...new Set(activeProducts.map(p => p.model).filter(Boolean))]

  const handleAuth = async () => {
    setAuthError('')
    try {
      if (isRegister) {
        if (!authForm.name || !authForm.email || !authForm.phone || !authForm.password) return setAuthError('Fill all fields')
        await register(authForm.name, authForm.email, authForm.phone, authForm.password)
      } else {
        if (!authForm.email || !authForm.password) return setAuthError('Fill all fields')
        await login(authForm.email, authForm.password)
      }
      setShowAuth(false)
      setAuthForm({ name: '', email: '', phone: '', password: '' })
    } catch (e) {
      setAuthError(e.message)
    }
  }

  const handleOrder = (product) => {
    if (!buyer) {
      setShowAuth(true)
      return
    }
    addPurchase(product.id)
    const msg = `🏁 *HOT ROD RACING - HRR*\n\n👤 Name: ${buyer.name}\n📧 Email: ${buyer.email}\n📱 Phone: ${buyer.phone}\n\n🛒 I want to buy:\n📄 ${product.title}\n${product.model ? `🚗 Ford ${product.model}` : ''}\n💰 Price: ${formatCurrency(product.price)}\n\nPlease confirm payment details.`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-hrr-dark">
      {/* Header */}
      <header className="bg-hrr-gray border-b border-hrr-silver/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl md:text-2xl">🏁</span>
            <div>
              <h1 className="font-heading text-lg md:text-xl font-bold text-hrr-red leading-tight">HRR</h1>
              <p className="text-[10px] text-hrr-silver leading-tight hidden sm:block">HOT ROD RACING</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {buyer ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-hrr-silver hidden sm:block">{buyer.name}</span>
                <div className="w-8 h-8 rounded-full bg-hrr-red flex items-center justify-center text-sm font-bold">
                  {buyer.name?.charAt(0)}
                </div>
                <button onClick={logout} className="text-hrr-silver hover:text-red-400 p-1"><FiLogOut /></button>
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)} className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1">
                <FiUser /> Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-b from-hrr-gray to-hrr-dark py-8 md:py-16 text-center px-4">
        <h2 className="font-heading text-3xl md:text-5xl font-bold mb-2">
          <span className="text-hrr-red">FORD</span> Files Store
        </h2>
        <p className="text-hrr-silver text-sm md:text-lg mb-6">Service manuals, wiring diagrams, ECU files & more</p>

        {/* Search */}
        <div className="max-w-xl mx-auto relative">
          <FiSearch className="absolute top-3.5 start-4 text-hrr-silver" />
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field ps-10 text-center"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-3 md:px-6 py-6">
        {/* Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button onClick={() => setFilterModel('')}
            className={`badge whitespace-nowrap cursor-pointer px-4 py-2 ${!filterModel ? 'bg-hrr-red' : 'bg-hrr-steel'} text-white`}>
            All
          </button>
          {usedModels.map(m => (
            <button key={m} onClick={() => setFilterModel(m)}
              className={`badge whitespace-nowrap cursor-pointer px-4 py-2 ${filterModel === m ? 'bg-hrr-red' : 'bg-hrr-steel'} text-white`}>
              {m}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
          {filtered.map(p => (
            <div key={p.id} className="card hover:border-hrr-red/40 group cursor-pointer" onClick={() => setSelectedProduct(p)}>
              {/* File type badge */}
              <div className="flex justify-between items-start mb-3">
                <span className={`badge text-white ${
                  p.fileType === 'pdf' ? 'bg-red-600' :
                  p.fileType === 'ecu' ? 'bg-blue-600' :
                  p.fileType === 'image' ? 'bg-green-600' : 'bg-hrr-steel'
                }`}>
                  {p.fileType?.toUpperCase() || 'FILE'}
                </span>
                {p.model && <span className="text-xs text-hrr-silver">Ford {p.model}</span>}
              </div>

              <h3 className="font-bold text-base md:text-lg mb-1 group-hover:text-hrr-red transition-colors">{p.title}</h3>
              <p className="text-hrr-silver text-sm mb-4 line-clamp-2">{p.description}</p>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-hrr-silver/10">
                <span className="font-bold text-hrr-gold text-lg">{formatCurrency(p.price)}</span>
                <button onClick={(e) => { e.stopPropagation(); handleOrder(p) }}
                  className="btn-primary text-sm py-1.5 px-4 flex items-center gap-1">
                  <FiMessageCircle /> Order
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <FiShoppingBag className="text-5xl text-hrr-silver mx-auto mb-4" />
            <p className="text-hrr-silver text-lg">No files found</p>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <span className={`badge text-white ${
                selectedProduct.fileType === 'pdf' ? 'bg-red-600' :
                selectedProduct.fileType === 'ecu' ? 'bg-blue-600' : 'bg-hrr-steel'
              }`}>
                {selectedProduct.fileType?.toUpperCase()}
              </span>
              <button onClick={() => setSelectedProduct(null)} className="text-hrr-silver hover:text-white text-xl">✕</button>
            </div>

            <h2 className="font-heading text-xl md:text-2xl font-bold mb-2">{selectedProduct.title}</h2>
            {selectedProduct.model && <p className="text-hrr-silver mb-2">🚗 Ford {selectedProduct.model}</p>}
            <p className="text-hrr-silver mb-6">{selectedProduct.description}</p>

            <div className="bg-hrr-steel rounded-lg p-4 flex items-center justify-between mb-4">
              <span className="text-hrr-silver">Price</span>
              <span className="font-bold text-hrr-gold text-2xl">{formatCurrency(selectedProduct.price)}</span>
            </div>

            <button onClick={() => { handleOrder(selectedProduct); setSelectedProduct(null) }}
              className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2">
              <FiMessageCircle /> Order via WhatsApp
            </button>

            <p className="text-center text-hrr-silver text-xs mt-3">
              Contact us on WhatsApp to complete your purchase
            </p>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowAuth(false)}>
          <div className="card max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <h2 className="font-heading text-2xl font-bold text-hrr-red">🏁 HRR Store</h2>
              <p className="text-hrr-silver text-sm mt-1">{isRegister ? 'Create Account' : 'Login'}</p>
            </div>

            <div className="space-y-3">
              {isRegister && (
                <>
                  <input placeholder="Full Name" value={authForm.name} onChange={e => setAuthForm({ ...authForm, name: e.target.value })} className="input-field" />
                  <input placeholder="Phone" value={authForm.phone} onChange={e => setAuthForm({ ...authForm, phone: e.target.value })} className="input-field" dir="ltr" />
                </>
              )}
              <input type="email" placeholder="Email" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} className="input-field" dir="ltr" />
              <input type="password" placeholder="Password" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} className="input-field" />

              {authError && <p className="text-red-400 text-sm text-center">{authError}</p>}

              <button onClick={handleAuth} className="btn-primary w-full py-3">
                {isRegister ? 'Create Account' : 'Login'}
              </button>

              <p className="text-center text-sm text-hrr-silver">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}
                <button onClick={() => { setIsRegister(!isRegister); setAuthError('') }} className="text-hrr-red ms-1 hover:underline">
                  {isRegister ? 'Login' : 'Register'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-hrr-gray border-t border-hrr-silver/10 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="font-heading text-hrr-red font-bold">🏁 HOT ROD RACING - HRR</p>
          <p className="text-hrr-silver text-sm mt-1">Managed by Firas Al-Otaibi</p>
          <p className="text-hrr-silver text-sm mt-1">📞 +96550540999</p>
        </div>
      </footer>
    </div>
  )
}
