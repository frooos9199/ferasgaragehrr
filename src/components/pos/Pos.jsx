import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import { useAuth } from '../../hooks/useAuth'
import { db } from '../../config/firebase'
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { formatCurrency, generateOrderNumber } from '../../utils/helpers'
import { generateInvoicePDF } from '../../utils/pdfGenerator'
import { FiPlus, FiMinus, FiTrash2, FiSearch, FiShoppingCart, FiPackage, FiMonitor, FiDownload, FiPrinter, FiEdit2, FiX, FiTool } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Pos() {
  const { t, i18n } = useTranslation()
  const { isAdmin } = useAuth()
  const { data: customers } = useCollection('customers')
  const { data: cars } = useCollection('cars')
  const { data: inventory } = useCollection('inventory')
  const { data: quickItems, add: addQuickItem, update: updateQuickItem, remove: removeQuickItem } = useCollection('posQuickItems')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [walkInName, setWalkInName] = useState('')
  const [walkInPhone, setWalkInPhone] = useState('')
  const [carId, setCarId] = useState('')
  const [showQuickItemForm, setShowQuickItemForm] = useState(false)
  const [editingQuickItemId, setEditingQuickItemId] = useState(null)
  const [quickItemForm, setQuickItemForm] = useState({ nameAr: '', nameEn: '', nameBn: '', nameHi: '', price: '', kind: 'service', includedParts: [] })
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedPartId, setSelectedPartId] = useState('')
  const [selectedPartQuantity, setSelectedPartQuantity] = useState(1)
  const [savingQuickItem, setSavingQuickItem] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paidAmount, setPaidAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [lastInvoice, setLastInvoice] = useState(null)

  useEffect(() => {
    const captureInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    window.addEventListener('beforeinstallprompt', captureInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', captureInstallPrompt)
  }, [])

  const visibleInventory = useMemo(() => inventory.filter(item =>
    `${item.partName || ''} ${item.partNumber || ''}`.toLowerCase().includes(search.toLowerCase())
  ), [inventory, search])
  const getQuickItemKind = (item) => item.kind || (item.includedParts?.length ? 'package' : 'service')
  const visibleQuickItems = useMemo(() => quickItems.filter(item => {
    const kind = getQuickItemKind(item)
    const matchesCategory = activeCategory === 'all' || activeCategory === kind
    const label = `${item.nameAr || ''} ${item.nameEn || ''} ${item.nameBn || ''} ${item.nameHi || ''} ${item.name || ''}`
    return matchesCategory && label.toLowerCase().includes(search.toLowerCase())
  }), [quickItems, activeCategory, search])
  const selectedCustomer = customers.find(customer => customer.id === customerId)
  const selectedCar = cars.find(car => car.id === carId)
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const received = paidAmount === '' ? total : Math.max(0, Number(paidAmount) || 0)
  const change = Math.max(0, received - total)

  const addItem = (item) => {
    setCart(current => {
      const existingIndex = current.findIndex(line => line.inventoryId && line.inventoryId === item.inventoryId)
      if (existingIndex < 0) return [...current, { ...item, quantity: 1 }]
      return current.map((line, index) => index === existingIndex
        ? { ...line, quantity: Math.min(line.quantity + 1, item.stock ?? Infinity) }
        : line)
    })
  }

  const getLocalizedItemName = (item) => {
    if (i18n.language.startsWith('ar')) return item.nameAr || item.nameEn || item.name
    if (i18n.language.startsWith('bn')) return item.nameBn || item.nameEn || item.nameAr || item.name
    if (i18n.language.startsWith('hi')) return item.nameHi || item.nameEn || item.nameAr || item.name
    return item.nameEn || item.nameAr || item.name
  }

  const addIncludedPart = () => {
    const part = inventory.find(item => item.id === selectedPartId)
    const quantity = Number(selectedPartQuantity)
    if (!part || !Number.isInteger(quantity) || quantity < 1) return toast.error(t('pos_valid_part_quantity'))
    setQuickItemForm(current => {
      const existing = current.includedParts.find(item => item.inventoryId === part.id)
      const includedParts = existing
        ? current.includedParts.map(item => item.inventoryId === part.id
          ? { ...item, quantity: item.quantity + quantity }
          : item)
        : [...current.includedParts, {
          inventoryId: part.id,
          name: part.partName,
          quantity,
        }]
      return { ...current, includedParts }
    })
    setSelectedPartId('')
    setSelectedPartQuantity(1)
  }

  const saveQuickItem = async () => {
    const nameAr = quickItemForm.nameAr.trim()
    const nameEn = quickItemForm.nameEn.trim()
    const nameBn = quickItemForm.nameBn.trim()
    const nameHi = quickItemForm.nameHi.trim()
    const price = Number(quickItemForm.price)
    if (!nameAr || !nameEn || !Number.isFinite(price) || price < 0) return toast.error(t('pos_enter_bilingual_item_names'))
    const item = {
      name: nameAr || nameEn,
      nameAr,
      nameEn,
      nameBn,
      nameHi,
      price,
      kind: quickItemForm.kind,
      includedParts: quickItemForm.kind === 'package' ? quickItemForm.includedParts : [],
    }
    setSavingQuickItem(true)
    try {
      if (editingQuickItemId) await updateQuickItem(editingQuickItemId, item)
      else await addQuickItem(item)
      setQuickItemForm({ nameAr: '', nameEn: '', nameBn: '', nameHi: '', price: '', kind: 'service', includedParts: [] })
      setEditingQuickItemId(null)
      setShowQuickItemForm(false)
      toast.success(t('pos_button_saved'))
    } catch (error) {
      console.error('POS item save failed:', error)
      toast.error(error.code === 'permission-denied' ? t('pos_permission_denied') : `${t('pos_save_failed')} (${error.code || error.message})`)
    } finally {
      setSavingQuickItem(false)
    }
  }

  const editQuickItem = (item) => {
    setEditingQuickItemId(item.id)
    setQuickItemForm({
      nameAr: item.nameAr || item.name || '',
      nameEn: item.nameEn || item.name || '',
      nameBn: item.nameBn || '',
      nameHi: item.nameHi || '',
      price: String(item.price),
      kind: item.kind || (item.includedParts?.length ? 'package' : 'service'),
      includedParts: item.includedParts || [],
    })
    setSelectedPartId('')
    setSelectedPartQuantity(1)
    setShowQuickItemForm(true)
  }

  const deleteQuickItem = async (item) => {
    if (!confirm(t('confirm_delete'))) return
    await removeQuickItem(item.id)
  }

  const changeQuantity = (index, difference) => {
    setCart(current => current.map((item, itemIndex) => {
      if (itemIndex !== index) return item
      const stock = item.stock ?? Infinity
      return { ...item, quantity: Math.min(stock, Math.max(1, item.quantity + difference)) }
    }))
  }

  const setItemPrice = (index, value) => {
    const item = cart[index]
    const price = item?.inventoryId ? value : Math.max(0, Number(value) || 0)
    setCart(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, price } : item))
  }

  const checkout = async () => {
    if (!cart.length) return toast.error(t('pos_cart_empty'))
    if (cart.some(item => item.inventoryId && Number(item.price) < item.minimumPrice)) {
      return toast.error(t('pos_minimum_price_warning'))
    }
    setSaving(true)
    try {
      const stockRequirements = new Map()
      cart.forEach(item => {
        if (item.inventoryId) {
          stockRequirements.set(item.inventoryId, (stockRequirements.get(item.inventoryId) || 0) + item.quantity)
        }
        ;(item.includedParts || []).forEach(part => {
          stockRequirements.set(part.inventoryId, (stockRequirements.get(part.inventoryId) || 0) + (part.quantity * item.quantity))
        })
      })
      const paid = paymentMethod === 'credit' ? 0 : Math.min(received, total)
      const invoiceData = {
        number: generateOrderNumber().replace('HRR', 'INV'),
        customerId: selectedCustomer?.id || '',
        customerName: selectedCustomer?.name || walkInName.trim() || t('pos_walk_in'),
        customerPhone: selectedCustomer?.phone || walkInPhone.trim(),
        carId: selectedCar?.id || '',
        carModel: selectedCar?.model || '',
        carYear: selectedCar?.year || '',
        carPlate: selectedCar?.plateNumber || '',
      items: cart.map(({ name, nameAr, nameEn, nameBn, nameHi, price, originalPrice, quantity, inventoryId, type }) => {
        const linePrice = Number(price) * quantity
        const discountAmount = Math.max(0, (Number(originalPrice ?? price) - Number(price)) * quantity)
        return {
          name,
          nameAr: nameAr || name,
          nameEn: nameEn || name,
          nameBn: nameBn || '',
          nameHi: nameHi || '',
          price: linePrice,
          originalPrice: discountAmount > 0 ? Number(originalPrice) * quantity : linePrice,
          discountAmount,
          quantity,
          inventoryId: inventoryId || '',
          type: type || (inventoryId ? 'part' : 'service'),
        }
      }),
        laborCost: 0,
        total,
        paymentMethod,
        paidAmount: paid,
        paymentStatus: paid >= total ? 'paid' : paid > 0 ? 'partial' : 'unpaid',
        source: 'pos',
      }
      const invoiceId = doc(collection(db, 'invoices')).id
      const stockItemIds = [...stockRequirements.keys()]

      await runTransaction(db, async transaction => {
        const snapshots = await Promise.all(stockItemIds.map(id => transaction.get(doc(db, 'inventory', id))))
        snapshots.forEach((snapshot, index) => {
          const requested = stockRequirements.get(stockItemIds[index])
          if (!snapshot.exists()) throw new Error('Insufficient stock')

          const cartItem = cart.find(item => item.inventoryId === snapshot.id)
          const inventoryData = snapshot.data()
          if (cartItem && cartItem.price < Number(inventoryData.minSellPrice ?? inventoryData.sellPrice ?? 0)) {
            throw new Error('Below minimum selling price')
          }
          if (Number(inventoryData.quantity || 0) < requested) {
            throw new Error('Insufficient stock')
          }
        })

        transaction.set(doc(db, 'invoices', invoiceId), { ...invoiceData, createdAt: serverTimestamp() })
        snapshots.forEach((snapshot, index) => {
          transaction.update(snapshot.ref, { quantity: Number(snapshot.data().quantity || 0) - stockRequirements.get(stockItemIds[index]) })
        })
      })

      const invoice = { ...invoiceData, id: invoiceId, createdAt: new Date().toISOString() }
      setLastInvoice(invoice)
      setCart([])
      setCustomerId('')
      setWalkInName('')
      setWalkInPhone('')
      setCarId('')
      setPaidAmount('')
      toast.success(`${t('pos_sale_complete')} ${invoice.number}`)
    } catch (error) {
      console.error('POS checkout failed:', error)
      toast.error(error.message === 'Below minimum selling price' ? t('pos_minimum_price_warning') : t('pos_checkout_failed'))
    } finally {
      setSaving(false)
    }
  }

  const installApp = async () => {
    if (!installPrompt) return toast(t('pos_install_from_browser'))
    await installPrompt.prompt()
    setInstallPrompt(null)
  }

  const printLastInvoice = async () => {
    if (lastInvoice) await generateInvoicePDF(lastInvoice)
  }

  return (
    <div className="min-h-[calc(100vh-7rem)] flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-500/15 text-emerald-300"><FiShoppingCart size={21} /></span>
          <div>
            <h1 className="text-xl font-bold">{t('pos_title')}</h1>
            <p className="text-sm text-hrr-silver">{t('pos_subtitle')}</p>
          </div>
        </div>
        <button onClick={installApp} className="btn-secondary flex items-center gap-2 py-2 px-3 text-sm" title={t('pos_install')}>
          <FiDownload /> {t('pos_install')}
        </button>
        {lastInvoice && <button onClick={printLastInvoice} className="btn-secondary flex items-center gap-2 py-2 px-3 text-sm" title={t('print')}><FiPrinter /> {t('pos_last_invoice')}</button>}
      </header>

      <div className="grid flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="min-w-0 space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <select value={customerId} onChange={event => { setCustomerId(event.target.value); setCarId('') }} className="input-field">
              <option value="">{t('pos_walk_in')}</option>
              {customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name} · {customer.phone}</option>)}
            </select>
            <select value={carId} onChange={event => setCarId(event.target.value)} className="input-field" disabled={!customerId}>
              <option value="">{t('pos_select_asset')}</option>
              {cars.filter(car => !customerId || car.customerId === customerId).map(car => (
                <option key={car.id} value={car.id}>{car.model} {car.year} · {car.plateNumber}</option>
              ))}
            </select>
          </div>
          {!customerId && (
            <div className="grid gap-3 md:grid-cols-2">
              <input value={walkInName} onChange={event => setWalkInName(event.target.value)} className="input-field" placeholder={t('pos_customer_name_optional')} />
              <input value={walkInPhone} onChange={event => setWalkInPhone(event.target.value)} className="input-field" placeholder={t('pos_customer_phone_optional')} type="tel" inputMode="tel" dir="ltr" />
            </div>
          )}

          <div className="relative">
            <FiSearch className="absolute top-3.5 start-4 text-hrr-silver" />
            <input value={search} onChange={event => setSearch(event.target.value)} className="input-field ps-10" placeholder={t('pos_search_parts')} />
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-hrr-silver"><FiTool /> {t('pos_quick_buttons')}</h2>
              {isAdmin && <button onClick={() => { setEditingQuickItemId(null); setQuickItemForm({ nameAr: '', nameEn: '', nameBn: '', nameHi: '', price: '', kind: 'service', includedParts: [] }); setShowQuickItemForm(value => !value) }} className="btn-secondary flex items-center gap-2 px-3 py-2 text-sm"><FiPlus /> {t('pos_manage_buttons')}</button>}
            </div>

            {showQuickItemForm && isAdmin && (
              <div className="space-y-3 rounded-lg border border-white/10 bg-hrr-gray p-3">
                <select value={quickItemForm.kind} onChange={event => setQuickItemForm(current => ({ ...current, kind: event.target.value, includedParts: event.target.value === 'package' ? current.includedParts : [] }))} className="input-field py-2">
                  <option value="service">{t('pos_services')}</option>
                  <option value="package">{t('pos_packages')}</option>
                </select>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input value={quickItemForm.nameAr} onChange={event => setQuickItemForm(current => ({ ...current, nameAr: event.target.value }))} className="input-field py-2" placeholder={t('pos_item_name_ar')} dir="rtl" />
                  <input value={quickItemForm.nameEn} onChange={event => setQuickItemForm(current => ({ ...current, nameEn: event.target.value }))} className="input-field py-2" placeholder={t('pos_item_name_en')} dir="ltr" />
                  <input value={quickItemForm.nameBn} onChange={event => setQuickItemForm(current => ({ ...current, nameBn: event.target.value }))} className="input-field py-2" placeholder={t('pos_item_name_bn')} dir="ltr" />
                  <input value={quickItemForm.nameHi} onChange={event => setQuickItemForm(current => ({ ...current, nameHi: event.target.value }))} className="input-field py-2" placeholder={t('pos_item_name_hi')} dir="ltr" />
                </div>
                <div className="grid gap-2 sm:grid-cols-[150px_auto_auto]">
                  <input value={quickItemForm.price} onChange={event => setQuickItemForm(current => ({ ...current, price: event.target.value }))} type="number" min="0" step="0.001" className="input-field py-2" placeholder="KWD" aria-label={t('pos_price')} />
                  <button onClick={saveQuickItem} disabled={savingQuickItem} className="btn-primary flex items-center justify-center gap-2 px-3 py-2 disabled:opacity-50"><FiPlus /> {savingQuickItem ? t('pos_saving') : t('save')}</button>
                  <button onClick={() => { setShowQuickItemForm(false); setEditingQuickItemId(null) }} className="btn-secondary flex items-center justify-center px-3 py-2" title={t('cancel')}><FiX /></button>
                </div>
                {quickItemForm.kind === 'package' && <div className="space-y-2 border-t border-white/10 pt-3">
                  <p className="text-sm font-semibold text-hrr-silver">{t('pos_package_parts')}</p>
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_100px_auto]">
                    <select value={selectedPartId} onChange={event => setSelectedPartId(event.target.value)} className="input-field py-2">
                      <option value="">{t('pos_choose_part')}</option>
                      {inventory.map(part => <option key={part.id} value={part.id}>{part.partName} · {t('pos_stock')}: {part.quantity}</option>)}
                    </select>
                    <input type="number" min="1" step="1" value={selectedPartQuantity} onChange={event => setSelectedPartQuantity(event.target.value)} className="input-field py-2" aria-label={t('quantity')} />
                    <button onClick={addIncludedPart} disabled={!selectedPartId} className="btn-secondary flex items-center justify-center gap-2 px-3 py-2 disabled:opacity-50"><FiPlus /> {t('pos_add_part')}</button>
                  </div>
                  {quickItemForm.includedParts.map(part => (
                    <div key={part.inventoryId} className="flex items-center justify-between gap-3 rounded bg-black/20 px-3 py-2 text-sm">
                      <span>{part.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-hrr-silver">× {part.quantity}</span>
                        <button onClick={() => setQuickItemForm(current => ({ ...current, includedParts: current.includedParts.filter(item => item.inventoryId !== part.inventoryId) }))} className="p-1 text-red-300" title={t('delete')}><FiTrash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-hrr-silver">{t('pos_package_invoice_note')}</p>
                </div>}
              </div>
            )}

            <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('pos_quick_buttons')}>
              {['all', 'service', 'package', 'parts'].map(category => (
                <button key={category} role="tab" aria-selected={activeCategory === category} onClick={() => setActiveCategory(category)} className={`rounded-md border px-3 py-2 text-sm font-bold transition ${activeCategory === category ? 'border-emerald-400 bg-emerald-400/15 text-emerald-200' : 'border-white/10 text-hrr-silver hover:border-white/25'}`}>
                  {t(`pos_category_${category}`)}
                </button>
              ))}
            </div>

            <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-3">
              {activeCategory !== 'parts' && visibleQuickItems.map(item => (
                <div key={item.id} className="flex min-h-20 items-stretch rounded-lg border border-emerald-400/20 bg-emerald-400/5">
                  <button onClick={() => addItem({ name: getLocalizedItemName(item), nameAr: item.nameAr || item.name, nameEn: item.nameEn || item.name, nameBn: item.nameBn || '', nameHi: item.nameHi || '', price: Number(item.price) || 0, originalPrice: Number(item.price) || 0, type: getQuickItemKind(item), includedParts: item.includedParts || [] })} className="flex min-w-0 flex-1 items-center justify-between gap-3 p-3 text-start transition hover:bg-emerald-400/10">
                    <span className="min-w-0"><span className="block truncate font-semibold">{getLocalizedItemName(item)}</span><span className="text-xs text-hrr-silver">{t(`pos_category_${getQuickItemKind(item)}`)} · {t('pos_tap_to_add')}</span></span>
                    <span className="shrink-0 text-sm font-bold text-emerald-300">{formatCurrency(item.price || 0)}</span>
                  </button>
                  {isAdmin && <div className="flex flex-col border-s border-white/10"><button onClick={() => editQuickItem(item)} className="grid flex-1 place-items-center px-2 text-blue-300" title={t('edit')}><FiEdit2 size={14} /></button><button onClick={() => deleteQuickItem(item)} className="grid flex-1 place-items-center px-2 text-red-300" title={t('delete')}><FiTrash2 size={14} /></button></div>}
                </div>
              ))}
              {activeCategory !== 'parts' && !visibleQuickItems.length && <p className="text-sm text-hrr-silver">{t('pos_no_quick_buttons')}</p>}
            </div>
          </section>

          {['all', 'parts'].includes(activeCategory) && <div className="flex items-center gap-2 text-sm text-hrr-silver"><FiPackage /> {t('pos_parts_stock')}</div>}
          <div className={`grid gap-2 sm:grid-cols-2 2xl:grid-cols-3 ${!['all', 'parts'].includes(activeCategory) ? 'hidden' : ''}`}>
            {visibleInventory.map(item => (
              <button key={item.id} onClick={() => addItem({
                name: item.partName,
                price: Number(item.sellPrice) || 0,
                originalPrice: Number(item.sellPrice) || 0,
                minimumPrice: Number(item.minSellPrice ?? item.sellPrice) || 0,
                inventoryId: item.id,
                stock: Number(item.quantity) || 0,
                image: item.images?.[0]?.url || item.images?.[0] || '',
              })} disabled={Number(item.quantity) <= 0}
                className="flex min-h-20 items-center justify-between gap-3 rounded-lg border border-white/10 bg-hrr-gray p-3 text-start transition hover:border-emerald-400/50 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40">
                {item.images?.[0] && <img src={item.images[0].url || item.images[0]} alt="" className="h-14 w-14 shrink-0 rounded object-cover" />}
                <span className="min-w-0"><span className="block truncate font-semibold">{item.partName}</span><span className="text-xs text-hrr-silver">{t('pos_stock')}: {item.quantity}</span></span>
                <span className="shrink-0 text-sm font-bold text-emerald-300">{formatCurrency(item.sellPrice || 0)}</span>
              </button>
            ))}
            {visibleInventory.length === 0 && <p className="py-8 text-center text-sm text-hrr-silver">{t('pos_no_parts')}</p>}
          </div>
        </section>

        <aside className="flex min-h-[520px] flex-col rounded-lg border border-white/10 bg-hrr-gray">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div className="flex items-center gap-2"><FiShoppingCart className="text-emerald-300" /><h2 className="font-bold">{t('pos_current_sale')}</h2></div>
            <span className="rounded bg-white/10 px-2 py-1 text-xs">{cart.length} {t('pos_items')}</span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {cart.map((item, index) => (
              <div key={`${item.inventoryId || item.name}-${index}`} className="border-b border-white/10 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2">
                    {item.image && <img src={item.image} alt="" className="h-12 w-12 shrink-0 rounded object-cover" />}
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{getLocalizedItemName(item)}</p>
                      <p className="text-xs text-hrr-silver">{formatCurrency(item.price)} {t('pos_each')}</p>
                      {Number(item.price) < item.originalPrice && <p className="text-xs font-semibold text-emerald-300">{t('invoice_discount')}: {formatCurrency((item.originalPrice - Number(item.price)) * item.quantity)}</p>}
                      {item.includedParts?.length > 0 && <p className="mt-1 text-xs text-hrr-silver">{t('pos_includes_parts')}: {item.includedParts.map(part => `${part.name} ×${part.quantity}`).join('، ')}</p>}
                    </div>
                  </div>
                  <button onClick={() => setCart(current => current.filter((_, itemIndex) => itemIndex !== index))} className="p-1 text-red-300" title={t('delete')}><FiTrash2 /></button>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => changeQuantity(index, -1)} className="grid h-8 w-8 place-items-center rounded border border-white/15" aria-label={t('pos_decrease')}><FiMinus size={13} /></button>
                    <span className="min-w-6 text-center font-bold">{item.quantity}</span>
                    <button onClick={() => changeQuantity(index, 1)} className="grid h-8 w-8 place-items-center rounded border border-white/15" aria-label={t('pos_increase')}><FiPlus size={13} /></button>
                  </div>
                  <input
                    type="number"
                    min={item.inventoryId ? item.minimumPrice : 0}
                    step="0.001"
                    value={item.price}
                    onChange={event => setItemPrice(index, event.target.value)}
                    className={`input-field w-28 py-2 text-end ${item.inventoryId && Number(item.price) < item.minimumPrice ? 'border-red-500 text-red-400 focus:border-red-500' : ''}`}
                    aria-label={t('pos_price')}
                    aria-invalid={Boolean(item.inventoryId && Number(item.price) < item.minimumPrice)}
                  />
                  <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}
            {!cart.length && <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 text-hrr-silver"><FiShoppingCart size={25} /><p>{t('pos_cart_empty')}</p></div>}
          </div>

          <div className="space-y-3 border-t border-white/10 p-4">
            <label className="block text-sm text-hrr-silver">{t('pos_payment_method')}</label>
            <div className="grid grid-cols-4 gap-2">
              {['cash', 'card', 'transfer', 'credit'].map(method => (
                <button key={method} onClick={() => setPaymentMethod(method)} className={`rounded-md border px-2 py-2 text-xs font-bold ${paymentMethod === method ? 'border-emerald-400 bg-emerald-400/15 text-emerald-200' : 'border-white/10 text-hrr-silver'}`}>{t(`pos_${method}`)}</button>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm"><span className="text-hrr-silver">{t('pos_received')}</span><input type="number" min="0" step="0.001" value={paymentMethod === 'credit' ? 0 : paidAmount} onChange={event => setPaidAmount(event.target.value)} disabled={paymentMethod === 'credit'} placeholder={total.toFixed(3)} className="input-field w-32 py-2 text-end" /></div>
            {change > 0 && <div className="flex justify-between text-sm text-emerald-300"><span>{t('pos_change')}</span><span>{formatCurrency(change)}</span></div>}
            <div className="flex items-end justify-between border-t border-white/10 pt-3"><span className="font-bold">{t('total')}</span><span className="text-2xl font-black text-emerald-300">{formatCurrency(total)}</span></div>
            <button onClick={checkout} disabled={saving || !cart.length} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-4 text-base font-black text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40">
              <FiMonitor /> {saving ? t('pos_saving') : t('pos_checkout')}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}