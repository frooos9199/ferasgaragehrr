import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import { useAuth } from '../../hooks/useAuth'
import { WORK_ORDER_STATUS, STATUS_COLORS, WORK_ORDER_TEMPLATES } from '../../config/constants'
import { generateOrderNumber, formatDate, formatCurrency, sendWhatsApp } from '../../utils/helpers'
import { WHATSAPP_NUMBER } from '../../config/constants'
import { FiPlus, FiCamera, FiSend, FiFileText, FiChevronDown, FiChevronUp, FiTrash2, FiX, FiCpu, FiAlertTriangle } from 'react-icons/fi'
import { storage } from '../../config/firebase'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import toast from 'react-hot-toast'

export default function WorkOrders() {
  const { t } = useTranslation()
  const { userData, isAdmin } = useAuth()
  const { data: orders, add, update, remove: removeOrder } = useCollection('workOrders')
  const { data: cars } = useCollection('cars')
  const { data: customers } = useCollection('customers')
  const { data: inventoryItems } = useCollection('inventory')
  const { add: addInvoice } = useCollection('invoices')
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [form, setForm] = useState({
    customerId: '', carId: '', serviceType: 'maintenance',
    description: '', template: '', technicianName: userData?.name || ''
  })

  const [dtcInput, setDtcInput] = useState('')

  const filtered = orders
    .filter(o => filterStatus === 'all' || o.status === filterStatus)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const applyTemplate = (templateId) => {
    const tmpl = WORK_ORDER_TEMPLATES.find(t => t.id === templateId)
    if (tmpl) {
      const desc = templateId === 'periodic' ? 'Oil Change, Filter Change, Full Inspection'
        : templateId === 'computer' ? 'ECU Diagnostic, Code Reading'
        : 'Brake Pads, Brake Discs, Brake Fluid Check'
      setForm({ ...form, template: templateId, description: desc })
    }
  }

  const handleCreate = async () => {
    if (!form.customerId || !form.carId) return toast.error('Select customer & car')
    const car = cars.find(c => c.id === form.carId)
    const customer = customers.find(c => c.id === form.customerId)
    await add({
      ...form,
      orderNumber: generateOrderNumber(),
      status: 'received',
      carModel: car?.model,
      carYear: car?.year,
      carPlate: car?.plateNumber,
      customerName: customer?.name,
      customerPhone: customer?.phone,
      customerId: form.customerId,
      carId: form.carId,
      technicianId: userData?.id,
      technicianName: form.technicianName,
      photos: [],
      parts: [],
      laborCost: 0,
      totalCost: 0,
    })
    setShowForm(false)
    setForm({ customerId: '', carId: '', serviceType: 'maintenance', description: '', template: '', technicianName: userData?.name || '' })
    toast.success('✅ ' + t('new_work_order'))
  }

  const updateStatus = async (order, newStatus) => {
    await update(order.id, { status: newStatus })
    toast.success('✅ ' + t(newStatus))
  }

  const uploadPhoto = async (order, phase) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.multiple = true
    input.onchange = async (e) => {
      const files = Array.from(e.target.files)
      if (!files.length) return
      toast.loading('📸 Uploading...')
      const urls = []
      for (const file of files) {
        const path = `workorders/${order.id}/${phase}_${Date.now()}_${file.name}`
        const storageRef = ref(storage, path)
        await uploadBytes(storageRef, file)
        const url = await getDownloadURL(storageRef)
        urls.push({ url, phase, uploadedAt: new Date().toISOString() })
      }
      await update(order.id, { photos: [...(order.photos || []), ...urls] })
      toast.dismiss()
      toast.success('📸')
    }
    input.click()
  }

  const addPart = async (order) => {
    const parts = [...(order.parts || []), { name: '', quantity: 1, price: 0 }]
    await update(order.id, { parts })
  }

  const updatePart = async (order, idx, field, value) => {
    const parts = [...(order.parts || [])]
    parts[idx] = { ...parts[idx], [field]: field === 'name' ? value : Number(value) }
    const partsCost = parts.reduce((s, p) => s + (p.price * p.quantity), 0)
    const totalCost = partsCost + (order.laborCost || 0)
    await update(order.id, { parts, totalCost })
  }

  const removePart = async (order, idx) => {
    const parts = (order.parts || []).filter((_, i) => i !== idx)
    const partsCost = parts.reduce((s, p) => s + (p.price * p.quantity), 0)
    const totalCost = partsCost + (order.laborCost || 0)
    await update(order.id, { parts, totalCost })
  }

  const updateLaborCost = async (order, cost) => {
    const partsCost = (order.parts || []).reduce((s, p) => s + (p.price * p.quantity), 0)
    const totalCost = partsCost + Number(cost)
    await update(order.id, { laborCost: Number(cost), totalCost })
  }

  const createInvoice = async (order) => {
    const items = [
      ...(order.parts || []).map(p => ({ name: p.name, price: p.price * p.quantity })),
      ...(order.laborCost > 0 ? [{ name: 'Labor', price: order.laborCost }] : [])
    ]
    await addInvoice({
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
      items,
      laborCost: order.laborCost || 0,
      total: order.totalCost || 0,
    })
    toast.success('🧾 Invoice created!')
  }

  const sendClientLink = (order) => {
    const link = `${window.location.origin}/client/${order.id}`
    const msg = `🏁 *HOT ROD RACING - HRR*\n\nHi ${order.customerName},\nYour vehicle Ford ${order.carModel} ${order.carYear} is being serviced.\n\nTrack status here:\n${link}\n\n📞 +96550540999`
    sendWhatsApp(order.customerPhone, msg)
  }

  const deletePhoto = async (order, photoIdx) => {
    if (!confirm('Delete this photo?')) return
    const photo = order.photos[photoIdx]
    try {
      if (photo.url?.includes('firebasestorage')) {
        const photoRef = ref(storage, photo.url)
        await deleteObject(photoRef)
      }
    } catch (e) { console.log('Storage delete skip:', e) }
    const photos = order.photos.filter((_, i) => i !== photoIdx)
    await update(order.id, { photos })
    toast.success('🗑️')
  }

  const deleteOrder = async (order) => {
    if (!confirm(t('confirm_delete'))) return
    // Delete photos from storage
    for (const photo of (order.photos || [])) {
      try {
        if (photo.url?.includes('firebasestorage')) {
          await deleteObject(ref(storage, photo.url))
        }
      } catch (e) { console.log('skip:', e) }
    }
    await removeOrder(order.id)
    setExpandedId(null)
    toast.success('🗑️ Order deleted')
  }

  // DTC Functions
  const addDTC = async (order) => {
    if (!dtcInput.trim()) return
    const dtcCodes = [...(order.dtcCodes || []), { code: dtcInput.toUpperCase().trim(), description: '', severity: 'medium', addedAt: new Date().toISOString() }]
    await update(order.id, { dtcCodes })
    setDtcInput('')
    toast.success('🔧 Code added')
  }

  const updateDTC = async (order, idx, field, value) => {
    const dtcCodes = [...(order.dtcCodes || [])]
    dtcCodes[idx] = { ...dtcCodes[idx], [field]: value }
    await update(order.id, { dtcCodes })
  }

  const removeDTC = async (order, idx) => {
    const dtcCodes = (order.dtcCodes || []).filter((_, i) => i !== idx)
    await update(order.id, { dtcCodes })
    toast.success('🗑️')
  }

  const sendDiagnosticReport = (order) => {
    const codes = order.dtcCodes || []
    if (codes.length === 0) return toast.error('No diagnostic codes to send')
    
    let report = `🏁 *HOT ROD RACING - HRR*\n`
    report += `📋 *DIAGNOSTIC REPORT*\n\n`
    report += `🚗 Vehicle: Ford ${order.carModel} ${order.carYear}\n`
    report += `🔢 Plate: ${order.carPlate}\n`
    report += `📅 Date: ${formatDate(order.createdAt)}\n\n`
    report += `⚠️ *FAULT CODES FOUND: ${codes.length}*\n`
    report += `━━━━━━━━━━━━━━━━━━━━\n\n`
    
    codes.forEach((dtc, i) => {
      const icon = dtc.severity === 'high' ? '🔴' : dtc.severity === 'medium' ? '🟡' : '🟢'
      report += `${i + 1}. ${icon} *${dtc.code}*\n`
      if (dtc.description) report += `   ${dtc.description}\n`
      report += `\n`
    })
    
    report += `━━━━━━━━━━━━━━━━━━━━\n`
    report += `📞 Contact us for repairs:\n+96550540999\n\n`
    report += `Thank you for choosing HRR! 🏁`
    
    sendWhatsApp(order.customerPhone, report)
  }

  const customerCars = cars.filter(c => c.customerId === form.customerId)

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="font-heading text-xl md:text-2xl font-bold">{t('work_orders')}</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm md:text-base py-2 px-3 md:px-6">
          <FiPlus /> <span className="hidden sm:inline">{t('new_work_order')}</span><span className="sm:hidden">{t('add')}</span>
        </button>
      </div>

      {/* فلتر الحالة */}
      <div className="flex gap-1.5 md:gap-2 mb-4 flex-wrap overflow-x-auto pb-2">
        <button onClick={() => setFilterStatus('all')} className={`badge ${filterStatus === 'all' ? 'bg-hrr-red' : 'bg-hrr-steel'} text-white cursor-pointer px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm whitespace-nowrap`}>
          {t('all')} ({orders.length})
        </button>
        {WORK_ORDER_STATUS.map(s => {
          const count = orders.filter(o => o.status === s).length
          return (
            <button key={s} onClick={() => setFilterStatus(s)} className={`badge ${filterStatus === s ? STATUS_COLORS[s] : 'bg-hrr-steel'} text-white cursor-pointer px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm whitespace-nowrap`}>
              {t(s)} ({count})
            </button>
          )
        })}
      </div>

      {/* فورم إضافة */}
      {showForm && (
        <div className="card mb-6 border-hrr-red/30">
          <h3 className="font-heading font-bold mb-4">{t('new_work_order')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value, carId: '' })} className="input-field">
              <option value="">{t('customer')}...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
            </select>
            <select value={form.carId} onChange={e => setForm({ ...form, carId: e.target.value })} className="input-field">
              <option value="">{t('car')}...</option>
              {customerCars.map(c => <option key={c.id} value={c.id}>Ford {c.model} {c.year} - {c.plateNumber}</option>)}
            </select>
            <select value={form.serviceType} onChange={e => setForm({ ...form, serviceType: e.target.value })} className="input-field">
              <option value="maintenance">{t('maintenance')}</option>
              <option value="repair">{t('repair')}</option>
              <option value="programming">{t('programming')}</option>
            </select>
            <select value={form.template} onChange={e => applyTemplate(e.target.value)} className="input-field">
              <option value="">{t('template')}...</option>
              <option value="periodic">{t('periodic_maintenance')}</option>
              <option value="computer">{t('computer_check')}</option>
              <option value="brakes">{t('brake_service')}</option>
            </select>
            <input placeholder={t('technician')} value={form.technicianName} onChange={e => setForm({ ...form, technicianName: e.target.value })} className="input-field" />
          </div>
          <textarea placeholder={t('description')} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field mt-3" rows={2} />
          <div className="flex gap-2 mt-3">
            <button onClick={handleCreate} className="btn-primary">{t('save')}</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">{t('cancel')}</button>
          </div>
        </div>
      )}

      {/* قائمة أوامر الشغل */}
      <div className="space-y-3">
        {filtered.map(order => (
          <div key={order.id} className={`card transition-all ${expandedId === order.id ? 'border-hrr-red/50' : ''}`}>
            {/* الهيدر */}
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                  <span className="font-heading font-bold text-sm md:text-base">{order.orderNumber}</span>
                  <span className={`badge text-white text-xs ${STATUS_COLORS[order.status]}`}>{t(order.status)}</span>
                </div>
                <p className="text-hrr-silver text-xs md:text-sm mt-1 truncate">
                  🚗 Ford {order.carModel} {order.carYear} • 👤 {order.customerName}
                </p>
              </div>
              <div className="flex items-center gap-2 ms-2 shrink-0">
                {order.totalCost > 0 && <span className="font-bold text-hrr-gold text-sm md:text-base hidden sm:block">{formatCurrency(order.totalCost)}</span>}
                {expandedId === order.id ? <FiChevronUp /> : <FiChevronDown />}
              </div>
            </div>

            {/* التفاصيل */}
            {expandedId === order.id && (
              <div className="mt-4 pt-4 border-t border-hrr-silver/10 space-y-4" onClick={e => e.stopPropagation()}>
                {/* الوصف */}
                <p className="text-hrr-silver bg-hrr-steel p-3 rounded-lg">{order.description || '-'}</p>
                <p className="text-sm">{t('technician')}: <span className="font-bold">{order.technicianName}</span></p>

                {/* تغيير الحالة */}
                <div>
                  <label className="text-sm text-hrr-silver mb-2 block">{t('status')}</label>
                  <div className="flex gap-1.5 md:gap-2 flex-wrap">
                    {WORK_ORDER_STATUS.map(s => (
                      <button key={s} onClick={() => updateStatus(order, s)}
                        className={`badge cursor-pointer px-2.5 md:px-4 py-1.5 md:py-2 text-xs transition-all ${order.status === s ? STATUS_COLORS[s] + ' text-white scale-110' : 'bg-hrr-steel text-hrr-silver hover:bg-hrr-silver/20'}`}>
                        {t(s)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* الصور */}
                <div>
                  <label className="text-sm text-hrr-silver mb-2 block">{t('photos')}</label>
                  <div className="flex gap-1.5 md:gap-2 mb-3 flex-wrap">
                    <button onClick={() => uploadPhoto(order, 'before')} className="btn-secondary text-xs md:text-sm flex items-center gap-1 py-1.5 px-2 md:px-4"><FiCamera /> {t('before')}</button>
                    <button onClick={() => uploadPhoto(order, 'during')} className="btn-secondary text-xs md:text-sm flex items-center gap-1 py-1.5 px-2 md:px-4"><FiCamera /> {t('during')}</button>
                    <button onClick={() => uploadPhoto(order, 'after')} className="btn-secondary text-xs md:text-sm flex items-center gap-1 py-1.5 px-2 md:px-4"><FiCamera /> {t('after')}</button>
                  </div>
                  {order.photos?.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {order.photos.map((p, i) => (
                        <div key={i} className="relative group">
                          <img src={p.url} alt="" className="w-full h-20 object-cover rounded-lg" />
                          <span className="absolute top-1 start-1 badge bg-black/70 text-white text-xs">{t(p.phase)}</span>
                          <button onClick={() => deletePhoto(order, i)} className="absolute top-1 end-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"><FiX size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* أكواد الأعطال - DTC */}
                <div className="bg-hrr-dark rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-bold flex items-center gap-2">
                        <FiCpu className="text-blue-400" /> Diagnostic Codes (DTC)
                      </label>
                      <button onClick={() => sendDiagnosticReport(order)} className="text-sm text-green-400 hover:underline flex items-center gap-1">
                        <FiSend size={12} /> Send Report
                      </button>
                    </div>
                    
                    {/* إضافة كود جديد */}
                    <div className="flex gap-2 mb-3">
                      <input 
                        placeholder="Enter code (e.g. P0300)" 
                        value={dtcInput} 
                        onChange={e => setDtcInput(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && addDTC(order)}
                        className="input-field flex-1 py-2 text-sm font-mono" 
                        dir="ltr"
                      />
                      <button onClick={() => addDTC(order)} className="btn-primary text-sm py-2 px-4">
                        <FiPlus />
                      </button>
                    </div>
                    
                    {/* قائمة الأكواد */}
                    {(order.dtcCodes || []).length > 0 ? (
                      <div className="space-y-2">
                        {(order.dtcCodes || []).map((dtc, idx) => (
                          <div key={idx} className="bg-hrr-steel rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-mono font-bold text-blue-400">{dtc.code}</span>
                              <select 
                                value={dtc.severity || 'medium'} 
                                onChange={e => updateDTC(order, idx, 'severity', e.target.value)}
                                className="text-xs bg-hrr-dark border border-hrr-silver/20 rounded px-2 py-1"
                              >
                                <option value="low">🟢 Low</option>
                                <option value="medium">🟡 Medium</option>
                                <option value="high">🔴 High</option>
                              </select>
                              <button onClick={() => removeDTC(order, idx)} className="text-red-400 hover:text-red-300 ms-auto"><FiTrash2 size={14} /></button>
                            </div>
                            <input 
                              placeholder="Description (e.g. Random Misfire Detected)" 
                              value={dtc.description || ''} 
                              onChange={e => updateDTC(order, idx, 'description', e.target.value)}
                              className="input-field py-1.5 text-sm w-full" 
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-hrr-silver text-sm text-center py-4">No fault codes added yet</p>
                    )}
                  </div>

                {/* قطع الغيار */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-hrr-silver">{t('parts_cost')}</label>
                    <button onClick={() => addPart(order)} className="text-sm text-hrr-red hover:underline flex items-center gap-1"><FiPlus /> {t('add')}</button>
                  </div>
                  {(order.parts || []).map((part, idx) => (
                    <div key={idx} className="flex gap-1.5 md:gap-2 mb-2 items-center flex-wrap sm:flex-nowrap">
                      <input placeholder={t('part_name')} value={part.name} onChange={e => updatePart(order, idx, 'name', e.target.value)} className="input-field flex-1 py-2 text-sm min-w-[120px]" />
                      <input type="number" placeholder={t('quantity')} value={part.quantity} onChange={e => updatePart(order, idx, 'quantity', e.target.value)} className="input-field w-16 md:w-20 py-2 text-sm text-center" />
                      <input type="number" step="0.001" placeholder="KWD" value={part.price} onChange={e => updatePart(order, idx, 'price', e.target.value)} className="input-field w-24 md:w-28 py-2 text-sm" />
                      <button onClick={() => removePart(order, idx)} className="text-red-400 hover:text-red-300"><FiTrash2 /></button>
                    </div>
                  ))}
                </div>

                {/* أجرة الشغل */}
                <div>
                  <label className="text-sm text-hrr-silver mb-1 block">{t('labor_cost')} (KWD)</label>
                  <input type="number" step="0.001" value={order.laborCost || 0} onChange={e => updateLaborCost(order, e.target.value)} className="input-field w-40 py-2" />
                </div>

                {/* المجموع */}
                <div className="bg-hrr-steel rounded-lg p-4 flex items-center justify-between">
                  <span className="font-bold text-lg">{t('total')}</span>
                  <span className="font-bold text-2xl text-hrr-gold">{formatCurrency(order.totalCost || 0)}</span>
                </div>

                {/* الأزرار */}
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => createInvoice(order)} className="btn-primary flex items-center gap-1 text-sm py-2 px-3 md:px-6">
                    <FiFileText /> {t('invoice')}
                  </button>
                  <button onClick={() => sendClientLink(order)} className="btn-secondary flex items-center gap-1 text-sm py-2 px-3 md:px-6">
                    <FiSend /> {t('send_whatsapp')}
                  </button>
                  {isAdmin && (
                    <button onClick={() => deleteOrder(order)} className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 text-sm py-2 px-3 md:px-6 rounded-lg">
                      <FiTrash2 /> {t('delete')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-hrr-silver py-12">{t('no_results')}</p>}
      </div>
    </div>
  )
}
