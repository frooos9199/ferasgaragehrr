import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCollection } from '../hooks/useCollection'
import { useStoreAuth } from '../hooks/useStoreAuth'
import { formatCurrency } from '../utils/helpers'
import { WHATSAPP_NUMBER } from '../config/constants'
import {
  FiShoppingBag, FiUser, FiLogOut, FiSearch, FiMessageCircle,
  FiTool, FiCpu, FiFileText, FiPackage, FiChevronRight, FiPhone, FiMail, FiMapPin, FiArrowRight
} from 'react-icons/fi'

export default function HomePage() {
  const { data: products } = useCollection('storeProducts')
  const { data: parts } = useCollection('storeParts')
  const { buyer, login, register, logout, addPurchase } = useStoreAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [authForm, setAuthForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState('files')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [search, setSearch] = useState('')

  const digitalFiles = products.filter(p => p.active !== false)
  const spareParts = parts.filter(p => p.active !== false)

  const filteredFiles = digitalFiles.filter(p =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase())
  )
  const filteredParts = spareParts.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase())
  )

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
    } catch (e) { setAuthError(e.message) }
  }

  const handleOrder = (item, type) => {
    if (!buyer) return setShowAuth(true)
    if (type === 'file') addPurchase(item.id)
    const msg = `🏁 *HOT ROD RACING - HRR*\n\n👤 ${buyer.name}\n📱 ${buyer.phone}\n📧 ${buyer.email}\n\n🛒 I want to ${type === 'part' ? 'order' : 'buy'}:\n📄 ${item.title || item.name}\n${item.model ? `🚗 Ford ${item.model}` : ''}\n💰 ${formatCurrency(item.price)}`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-hrr-dark">

      {/* ===== HEADER ===== */}
      <header className="fixed top-0 w-full bg-hrr-dark/90 backdrop-blur-md border-b border-hrr-silver/10 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-hrr-red rounded-lg flex items-center justify-center">
              <span className="font-heading text-lg font-bold text-white">H</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-heading text-lg font-bold text-white leading-tight">HOT ROD RACING</h1>
              <p className="text-[10px] text-hrr-silver leading-tight">FORD SPECIALIST • KUWAIT</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#services" className="text-hrr-silver hover:text-white transition-colors">Services</a>
            <a href="#parts" className="text-hrr-silver hover:text-white transition-colors">Parts</a>
            <a href="#files" className="text-hrr-silver hover:text-white transition-colors">Digital Files</a>
            <a href="#contact" className="text-hrr-silver hover:text-white transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-xs text-hrr-silver hover:text-white transition-colors hidden sm:block">Admin</Link>
            {buyer ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-hrr-red flex items-center justify-center text-sm font-bold">{buyer.name?.charAt(0)}</div>
                <span className="text-sm text-hrr-silver hidden sm:block">{buyer.name}</span>
                <button onClick={logout} className="text-hrr-silver hover:text-red-400 p-1"><FiLogOut size={16} /></button>
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)} className="bg-hrr-red hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all">
                <FiUser size={14} /> Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="pt-16">
        <div className="relative overflow-hidden bg-gradient-to-br from-hrr-dark via-hrr-gray to-hrr-dark">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 text-[200px] font-heading font-bold text-white leading-none">HRR</div>
            <div className="absolute bottom-0 right-0 text-[150px] font-heading font-bold text-white leading-none">🏁</div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-28">
            <div className="max-w-2xl">
              <div className="inline-block bg-hrr-red/20 border border-hrr-red/40 rounded-full px-4 py-1 text-sm text-hrr-red font-bold mb-6">
                🏁 FORD SPECIALIST WORKSHOP
              </div>
              <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4">
                <span className="text-white">HOT ROD</span><br />
                <span className="text-hrr-red">RACING</span>
              </h2>
              <p className="text-hrr-silver text-base md:text-lg mb-8 max-w-lg">
                Professional Ford maintenance, repair & ECU programming. Plus genuine parts and digital service files.
              </p>
              <div className="flex gap-3 flex-wrap">
                <a href="#parts" className="bg-hrr-red hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-all">
                  <FiPackage /> Shop Parts
                </a>
                <a href="#files" className="bg-hrr-steel hover:bg-hrr-silver/20 text-white font-bold py-3 px-6 rounded-lg border border-hrr-silver/30 flex items-center gap-2 transition-all">
                  <FiFileText /> Digital Files
                </a>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-all">
                  <FiMessageCircle /> WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="bg-hrr-gray/80 border-t border-hrr-silver/10">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div><span className="text-2xl font-bold text-hrr-red">500+</span><p className="text-xs text-hrr-silver">Cars Serviced</p></div>
              <div><span className="text-2xl font-bold text-white">Ford</span><p className="text-xs text-hrr-silver">Specialist</p></div>
              <div><span className="text-2xl font-bold text-hrr-gold">100%</span><p className="text-xs text-hrr-silver">Genuine Parts</p></div>
              <div><span className="text-2xl font-bold text-green-400">24/7</span><p className="text-xs text-hrr-silver">WhatsApp Support</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section id="services" className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="text-center mb-10">
          <h3 className="font-heading text-3xl md:text-4xl font-bold mb-2">Our <span className="text-hrr-red">Services</span></h3>
          <p className="text-hrr-silver">Expert Ford care from bumper to bumper</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[
            { icon: <FiTool className="text-3xl" />, title: 'Periodic Maintenance', desc: 'Oil change, filters, full inspection for all Ford models', color: 'text-blue-400' },
            { icon: <FiCpu className="text-3xl" />, title: 'ECU Programming', desc: 'Advanced diagnostics, code reading & ECU calibration', color: 'text-hrr-red' },
            { icon: <FiTool className="text-3xl" />, title: 'Repair & Overhaul', desc: 'Engine, transmission, suspension & electrical repairs', color: 'text-hrr-gold' },
            { icon: <FiPackage className="text-3xl" />, title: 'Genuine Parts', desc: 'Original & OEM Ford parts with warranty', color: 'text-green-400' },
            { icon: <FiFileText className="text-3xl" />, title: 'Digital Files', desc: 'Service manuals, wiring diagrams & ECU files', color: 'text-purple-400' },
            { icon: <FiMessageCircle className="text-3xl" />, title: '24/7 Support', desc: 'Reach us anytime on WhatsApp for quick help', color: 'text-green-400' },
          ].map((s, i) => (
            <div key={i} className="bg-hrr-gray border border-hrr-silver/10 rounded-xl p-6 hover:border-hrr-red/30 transition-all group">
              <div className={`${s.color} mb-4 group-hover:scale-110 transition-transform`}>{s.icon}</div>
              <h4 className="font-heading font-bold text-lg mb-2">{s.title}</h4>
              <p className="text-hrr-silver text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SEARCH BAR ===== */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="relative max-w-xl mx-auto">
          <FiSearch className="absolute top-3.5 start-4 text-hrr-silver" />
          <input
            type="text"
            placeholder="Search parts, files, programs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field ps-10 text-center bg-hrr-gray"
          />
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <div className="flex gap-2 justify-center">
          <button onClick={() => setActiveTab('parts')}
            className={`font-heading font-bold py-3 px-6 rounded-lg text-sm md:text-base flex items-center gap-2 transition-all ${activeTab === 'parts' ? 'bg-hrr-red text-white shadow-lg shadow-red-500/20' : 'bg-hrr-steel text-hrr-silver hover:text-white'}`}>
            <FiPackage /> Spare Parts
          </button>
          <button onClick={() => setActiveTab('files')}
            className={`font-heading font-bold py-3 px-6 rounded-lg text-sm md:text-base flex items-center gap-2 transition-all ${activeTab === 'files' ? 'bg-hrr-red text-white shadow-lg shadow-red-500/20' : 'bg-hrr-steel text-hrr-silver hover:text-white'}`}>
            <FiFileText /> Digital Files & Programs
          </button>
        </div>
      </div>

      {/* ===== SPARE PARTS ===== */}
      {activeTab === 'parts' && (
        <section id="parts" className="max-w-7xl mx-auto px-4 md:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading text-2xl md:text-3xl font-bold">
              <span className="text-hrr-red">⚙️</span> Spare Parts
            </h3>
          </div>

          {filteredParts.length === 0 ? (
            <div className="text-center py-16 bg-hrr-gray rounded-xl border border-hrr-silver/10">
              <FiPackage className="text-5xl text-hrr-silver mx-auto mb-4" />
              <p className="text-hrr-silver text-lg mb-2">No parts listed yet</p>
              <p className="text-hrr-silver text-sm">Contact us on WhatsApp for any Ford part you need</p>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I need a Ford part...')}`} target="_blank"
                className="btn-primary inline-flex items-center gap-2 mt-4">
                <FiMessageCircle /> Ask for Parts
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredParts.map(p => (
                <div key={p.id} className="bg-hrr-gray border border-hrr-silver/10 rounded-xl overflow-hidden hover:border-hrr-red/30 transition-all group">
                  {p.image && <img src={p.image} alt={p.name} className="w-full h-40 object-cover" />}
                  <div className="p-4">
                    <h4 className="font-bold mb-1 group-hover:text-hrr-red transition-colors">{p.name}</h4>
                    {p.model && <p className="text-xs text-hrr-silver mb-2">Ford {p.model}</p>}
                    {p.partNumber && <p className="text-xs text-hrr-silver mb-3" dir="ltr">#{p.partNumber}</p>}
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-hrr-gold text-lg">{formatCurrency(p.price)}</span>
                      <button onClick={() => handleOrder(p, 'part')} className="bg-hrr-red hover:bg-red-700 text-white text-sm font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all">
                        <FiMessageCircle size={14} /> Order
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ===== DIGITAL FILES ===== */}
      {activeTab === 'files' && (
        <section id="files" className="max-w-7xl mx-auto px-4 md:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading text-2xl md:text-3xl font-bold">
              <span className="text-hrr-red">📁</span> Digital Files & Programs
            </h3>
          </div>

          {filteredFiles.length === 0 ? (
            <div className="text-center py-16 bg-hrr-gray rounded-xl border border-hrr-silver/10">
              <FiFileText className="text-5xl text-hrr-silver mx-auto mb-4" />
              <p className="text-hrr-silver text-lg mb-2">No files listed yet</p>
              <p className="text-hrr-silver text-sm">Contact us for service manuals, ECU files & more</p>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I need a Ford file...')}`} target="_blank"
                className="btn-primary inline-flex items-center gap-2 mt-4">
                <FiMessageCircle /> Ask for Files
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map(p => (
                <div key={p.id} className="bg-hrr-gray border border-hrr-silver/10 rounded-xl p-5 hover:border-hrr-red/30 transition-all group cursor-pointer"
                  onClick={() => setSelectedProduct(p)}>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`badge text-white ${
                      p.fileType === 'pdf' ? 'bg-red-600' :
                      p.fileType === 'ecu' ? 'bg-blue-600' :
                      p.fileType === 'program' ? 'bg-purple-600' :
                      p.fileType === 'image' ? 'bg-green-600' : 'bg-hrr-steel'
                    }`}>
                      {p.fileType?.toUpperCase() || 'FILE'}
                    </span>
                    {p.model && <span className="text-xs text-hrr-silver">Ford {p.model}</span>}
                  </div>
                  <h4 className="font-bold text-base mb-1 group-hover:text-hrr-red transition-colors">{p.title}</h4>
                  <p className="text-hrr-silver text-sm mb-4 line-clamp-2">{p.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-hrr-silver/10">
                    <span className="font-bold text-hrr-gold text-lg">{formatCurrency(p.price)}</span>
                    <span className="text-hrr-red text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      View <FiArrowRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ===== CTA SECTION ===== */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="bg-gradient-to-r from-hrr-red to-red-800 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 text-[120px] font-heading font-bold text-white/5 leading-none">HRR</div>
          <h3 className="font-heading text-2xl md:text-4xl font-bold mb-3 relative">Need a specific Ford part or file?</h3>
          <p className="text-white/80 mb-6 relative">Contact us directly and we'll find it for you</p>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank"
            className="bg-white text-hrr-red font-bold py-3 px-8 rounded-lg inline-flex items-center gap-2 hover:bg-gray-100 transition-all relative">
            <FiMessageCircle /> Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* ===== CONTACT / FOOTER ===== */}
      <footer id="contact" className="bg-hrr-gray border-t border-hrr-silver/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-hrr-red rounded-lg flex items-center justify-center">
                  <span className="font-heading text-lg font-bold">H</span>
                </div>
                <div>
                  <h4 className="font-heading font-bold">HOT ROD RACING</h4>
                  <p className="text-xs text-hrr-silver">Managed by Firas Al-Otaibi</p>
                </div>
              </div>
              <p className="text-hrr-silver text-sm">Professional Ford specialist workshop in Kuwait. Maintenance, repair, ECU programming & genuine parts.</p>
            </div>
            <div>
              <h4 className="font-heading font-bold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <a href="#services" className="text-hrr-silver hover:text-white flex items-center gap-2 transition-colors"><FiChevronRight size={14} /> Services</a>
                <a href="#parts" className="text-hrr-silver hover:text-white flex items-center gap-2 transition-colors"><FiChevronRight size={14} /> Spare Parts</a>
                <a href="#files" className="text-hrr-silver hover:text-white flex items-center gap-2 transition-colors"><FiChevronRight size={14} /> Digital Files</a>
                <Link to="/admin" className="text-hrr-silver hover:text-white flex items-center gap-2 transition-colors"><FiChevronRight size={14} /> Workshop Login</Link>
              </div>
            </div>
            <div>
              <h4 className="font-heading font-bold mb-4">Contact Us</h4>
              <div className="space-y-3 text-sm">
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" className="text-hrr-silver hover:text-green-400 flex items-center gap-2 transition-colors">
                  <FiMessageCircle /> +965 5054 0999
                </a>
                <a href="tel:+96550540999" className="text-hrr-silver hover:text-white flex items-center gap-2 transition-colors">
                  <FiPhone /> +965 5054 0999
                </a>
                <p className="text-hrr-silver flex items-center gap-2"><FiMapPin /> Kuwait</p>
              </div>
            </div>
          </div>
          <div className="border-t border-hrr-silver/10 mt-8 pt-6 text-center">
            <p className="text-hrr-silver text-xs">© {new Date().getFullYear()} HOT ROD RACING - HRR. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* ===== PRODUCT MODAL ===== */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-hrr-gray border border-hrr-silver/10 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <span className={`badge text-white ${
                selectedProduct.fileType === 'pdf' ? 'bg-red-600' :
                selectedProduct.fileType === 'ecu' ? 'bg-blue-600' :
                selectedProduct.fileType === 'program' ? 'bg-purple-600' : 'bg-hrr-steel'
              }`}>{selectedProduct.fileType?.toUpperCase()}</span>
              <button onClick={() => setSelectedProduct(null)} className="text-hrr-silver hover:text-white text-xl">✕</button>
            </div>
            <h2 className="font-heading text-xl md:text-2xl font-bold mb-2">{selectedProduct.title}</h2>
            {selectedProduct.model && <p className="text-hrr-silver mb-2">🚗 Ford {selectedProduct.model}</p>}
            <p className="text-hrr-silver mb-6">{selectedProduct.description}</p>
            <div className="bg-hrr-steel rounded-lg p-4 flex items-center justify-between mb-4">
              <span className="text-hrr-silver">Price</span>
              <span className="font-bold text-hrr-gold text-2xl">{formatCurrency(selectedProduct.price)}</span>
            </div>
            <button onClick={() => { handleOrder(selectedProduct, 'file'); setSelectedProduct(null) }}
              className="bg-hrr-red hover:bg-red-700 text-white font-bold w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-all">
              <FiMessageCircle /> Order via WhatsApp
            </button>
            <p className="text-center text-hrr-silver text-xs mt-3">Contact us on WhatsApp to complete your purchase</p>
          </div>
        </div>
      )}

      {/* ===== AUTH MODAL ===== */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowAuth(false)}>
          <div className="bg-hrr-gray border border-hrr-silver/10 rounded-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-hrr-red rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="font-heading text-xl font-bold">H</span>
              </div>
              <h2 className="font-heading text-xl font-bold">{isRegister ? 'Create Account' : 'Sign In'}</h2>
              <p className="text-hrr-silver text-sm mt-1">HRR Store</p>
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
              <button onClick={handleAuth} className="bg-hrr-red hover:bg-red-700 text-white font-bold w-full py-3 rounded-lg transition-all">
                {isRegister ? 'Create Account' : 'Sign In'}
              </button>
              <p className="text-center text-sm text-hrr-silver">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}
                <button onClick={() => { setIsRegister(!isRegister); setAuthError('') }} className="text-hrr-red ms-1 hover:underline">
                  {isRegister ? 'Sign In' : 'Register'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
