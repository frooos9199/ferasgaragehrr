import { useMemo, useState } from 'react'
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { FiPlus, FiPackage, FiDollarSign, FiFileText, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { db } from '../../config/firebase'
import { useCollection } from '../../hooks/useCollection'
import { formatCurrency, formatDate } from '../../utils/helpers'

const today = () => new Date().toISOString().slice(0, 10)
const NEW_ITEM = '__new_inventory_item__'
const newLine = () => ({ inventoryId: '', quantity: 1, unitCost: '', isNew: false, partName: '', partNumber: '', sellPrice: '' })

export default function PurchasesExpenses() {
  const { t } = useTranslation()
  const { data: inventory } = useCollection('inventory')
  const { data: purchases } = useCollection('purchases')
  const { data: suppliers, add: addSupplier } = useCollection('suppliers', { sortByCreatedAt: false })
  const { data: expenses, add: addExpense } = useCollection('expenses')
  const [activeTab, setActiveTab] = useState('purchases')
  const [saving, setSaving] = useState(false)
  const [showSupplierForm, setShowSupplierForm] = useState(false)
  const [savingSupplier, setSavingSupplier] = useState(false)
  const [supplierForm, setSupplierForm] = useState({ name: '', phone: '', notes: '' })
  const [settlementPurchaseId, setSettlementPurchaseId] = useState('')
  const [settlementForm, setSettlementForm] = useState({ amount: '', method: 'cash' })
  const [purchaseForm, setPurchaseForm] = useState({ supplierId: '', supplier: '', invoiceNumber: '', date: today(), paymentMethod: 'cash', shippingCost: '', paidAmount: '', notes: '', lines: [newLine()] })
  const [expenseForm, setExpenseForm] = useState({ category: 'other', description: '', date: today(), amount: '', paymentMethod: 'cash', notes: '' })

  const purchaseSubtotal = purchaseForm.lines.reduce((sum, line) => sum + (Number(line.quantity) || 0) * (Number(line.unitCost) || 0), 0)
  const shippingCost = Math.max(0, Number(purchaseForm.shippingCost) || 0)
  const purchaseTotal = purchaseSubtotal + shippingCost
  const paidAmount = purchaseForm.paymentMethod === 'credit'
    ? 0
    : purchaseForm.paidAmount === '' ? purchaseTotal : Math.max(0, Number(purchaseForm.paidAmount) || 0)
  const balance = Math.max(0, purchaseTotal - paidAmount)
  const monthKey = today().slice(0, 7)
  const monthPurchases = useMemo(() => purchases.filter(item => item.date?.slice(0, 7) === monthKey), [purchases, monthKey])
  const monthExpenses = useMemo(() => expenses.filter(item => item.date?.slice(0, 7) === monthKey), [expenses, monthKey])
  const purchasesValue = monthPurchases.reduce((sum, item) => sum + (Number(item.total) || 0), 0)
  const expensesValue = monthExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const supplierBalances = purchases.reduce((sum, item) => sum + (Number(item.balance) || 0), 0)

  const updateLine = (index, field, value) => {
    setPurchaseForm(current => ({
      ...current,
      lines: current.lines.map((line, lineIndex) => lineIndex === index ? { ...line, [field]: value } : line),
    }))
  }

  const saveSupplier = async (event) => {
    event?.preventDefault()
    const name = supplierForm.name.trim()
    if (!name) return toast.error(t('accounting_supplier_required'))
    const duplicate = suppliers.find(item => item.name?.trim().toLowerCase() === name.toLowerCase())
    if (duplicate) {
      setPurchaseForm(current => ({ ...current, supplierId: duplicate.id, supplier: duplicate.name }))
      setShowSupplierForm(false)
      setSupplierForm({ name: '', phone: '', notes: '' })
      return toast.success(t('accounting_supplier_selected'))
    }

    setSavingSupplier(true)
    try {
      const created = await addSupplier({ name, phone: supplierForm.phone.trim(), notes: supplierForm.notes.trim() })
      setPurchaseForm(current => ({ ...current, supplierId: created.id, supplier: name }))
      setSupplierForm({ name: '', phone: '', notes: '' })
      setShowSupplierForm(false)
      toast.success(t('accounting_supplier_saved'))
    } catch (error) {
      console.error('Supplier save failed:', error)
      toast.error(error.code === 'permission-denied' ? t('pos_permission_denied') : t('accounting_save_failed'))
    } finally {
      setSavingSupplier(false)
    }
  }

  const savePurchase = async (event) => {
    event.preventDefault()
    const lines = purchaseForm.lines.map(line => ({
      inventoryId: line.isNew ? '' : line.inventoryId,
      isNew: line.isNew,
      partName: line.partName.trim(),
      partNumber: line.partNumber.trim(),
      sellPrice: Number(line.sellPrice) || 0,
      quantity: Number(line.quantity),
      unitCost: Number(line.unitCost),
    }))
    if (!purchaseForm.supplier.trim()) return toast.error(t('accounting_supplier_required'))
    if (!lines.length || lines.some(line => (!line.isNew && !line.inventoryId) || (line.isNew && !line.partName) || !Number.isInteger(line.quantity) || line.quantity < 1 || !Number.isFinite(line.unitCost) || line.unitCost < 0 || !Number.isFinite(line.sellPrice) || line.sellPrice < 0)) {
      return toast.error(t('accounting_purchase_lines_required'))
    }
    if (purchaseForm.paymentMethod !== 'credit' && purchaseForm.paidAmount !== '') {
      const enteredPaid = Number(purchaseForm.paidAmount)
      if (!Number.isFinite(enteredPaid) || enteredPaid < 0 || enteredPaid > purchaseTotal) return toast.error(t('accounting_paid_exceeds_total'))
    }
    if (!Number.isFinite(Number(purchaseForm.shippingCost || 0)) || Number(purchaseForm.shippingCost || 0) < 0) return toast.error(t('accounting_valid_shipping'))
    if (lines.length > 450) return toast.error(t('accounting_too_many_lines'))

    const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitCost, 0)
    const freight = Number(purchaseForm.shippingCost) || 0
    const total = subtotal + freight
    const paid = purchaseForm.paymentMethod === 'credit' ? 0 : purchaseForm.paidAmount === '' ? total : Number(purchaseForm.paidAmount)
    const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0)
    const landedLines = lines.map(line => {
      const lineSubtotal = line.quantity * line.unitCost
      const shippingShare = subtotal > 0
        ? freight * (lineSubtotal / subtotal)
        : totalQuantity > 0 ? freight * (line.quantity / totalQuantity) : 0
      return { ...line, landedUnitCost: line.unitCost + shippingShare / line.quantity }
    })
    const purchaseData = {
      supplier: purchaseForm.supplier.trim(),
      invoiceNumber: purchaseForm.invoiceNumber.trim(),
      date: purchaseForm.date,
      paymentMethod: purchaseForm.paymentMethod,
      shippingCost: freight,
      lines: [],
      total,
      paidAmount: paid,
      balance: Math.max(0, total - paid),
      payments: paid > 0 ? [{ amount: paid, method: purchaseForm.paymentMethod, date: purchaseForm.date }] : [],
      notes: purchaseForm.notes.trim(),
    }
    setSaving(true)
    try {
      const purchaseRef = doc(collection(db, 'purchases'))
      const resolvedLines = landedLines.map(line => ({
        ...line,
        resolvedInventoryId: line.isNew ? doc(collection(db, 'inventory')).id : line.inventoryId,
        partName: line.isNew ? line.partName : inventory.find(item => item.id === line.inventoryId)?.partName || '',
        partNumber: line.isNew ? line.partNumber : inventory.find(item => item.id === line.inventoryId)?.partNumber || '',
      }))
      const existingIds = [...new Set(resolvedLines.filter(line => !line.isNew).map(line => line.resolvedInventoryId))]
      const existingRefs = existingIds.map(id => doc(db, 'inventory', id))
      await runTransaction(db, async transaction => {
        const snapshots = await Promise.all(existingRefs.map(ref => transaction.get(ref)))
        snapshots.forEach(snapshot => {
          if (!snapshot.exists()) throw new Error('Inventory item not found')
        })

        const mergedLines = new Map()
        resolvedLines.filter(line => !line.isNew).forEach(line => {
          const current = mergedLines.get(line.resolvedInventoryId) || { quantity: 0, value: 0 }
          current.quantity += line.quantity
          current.value += line.quantity * line.landedUnitCost
          mergedLines.set(line.resolvedInventoryId, current)
        })
        const snapshotById = new Map(snapshots.map(snapshot => [snapshot.id, snapshot]))

        transaction.set(purchaseRef, {
          ...purchaseData,
          lines: resolvedLines.map(({ resolvedInventoryId, isNew, sellPrice, ...line }) => ({ ...line, inventoryId: resolvedInventoryId, isNew })),
          createdAt: serverTimestamp(),
        })
        mergedLines.forEach((purchaseLine, inventoryId) => {
          const snapshot = snapshotById.get(inventoryId)
          const stock = snapshot.data()
          const oldQuantity = Number(stock.quantity) || 0
          const newQuantity = oldQuantity + purchaseLine.quantity
          const oldValue = oldQuantity * (Number(stock.buyPrice) || 0)
          transaction.update(snapshot.ref, {
            quantity: newQuantity,
            buyPrice: newQuantity > 0 ? (oldValue + purchaseLine.value) / newQuantity : 0,
          })
        })

        resolvedLines.filter(line => line.isNew).forEach(line => {
          transaction.set(doc(db, 'inventory', line.resolvedInventoryId), {
            partName: line.partName,
            partNumber: line.partNumber,
            quantity: line.quantity,
            minQuantity: 5,
            buyPrice: line.landedUnitCost,
            sellPrice: line.sellPrice,
            createdAt: serverTimestamp(),
          })
        })
      })

      setPurchaseForm({ supplierId: '', supplier: '', invoiceNumber: '', date: today(), paymentMethod: 'cash', shippingCost: '', paidAmount: '', notes: '', lines: [newLine()] })
      toast.success(t('accounting_purchase_saved'))
    } catch (error) {
      console.error('Purchase save failed:', error)
      toast.error(error.code === 'permission-denied' ? t('pos_permission_denied') : t('accounting_save_failed'))
    } finally {
      setSaving(false)
    }
  }

  const recordSupplierPayment = async (purchase) => {
    const amount = Number(settlementForm.amount)
    if (!Number.isFinite(amount) || amount <= 0 || amount > Number(purchase.balance || 0)) return toast.error(t('accounting_invalid_settlement'))
    setSaving(true)
    try {
      const purchaseRef = doc(db, 'purchases', purchase.id)
      await runTransaction(db, async transaction => {
        const snapshot = await transaction.get(purchaseRef)
        if (!snapshot.exists()) throw new Error('Purchase not found')
        const current = snapshot.data()
        const currentBalance = Number(current.balance) || 0
        if (amount > currentBalance) throw new Error('Payment exceeds outstanding balance')
        transaction.update(purchaseRef, {
          paidAmount: (Number(current.paidAmount) || 0) + amount,
          balance: Math.max(0, currentBalance - amount),
          payments: [...(current.payments || []), { amount, method: settlementForm.method, date: today() }],
        })
      })
      setSettlementPurchaseId('')
      setSettlementForm({ amount: '', method: 'cash' })
      toast.success(t('accounting_payment_saved'))
    } catch (error) {
      console.error('Supplier settlement failed:', error)
      toast.error(error.code === 'permission-denied' ? t('pos_permission_denied') : t('accounting_invalid_settlement'))
    } finally {
      setSaving(false)
    }
  }

  const saveExpense = async (event) => {
    event.preventDefault()
    const amount = Number(expenseForm.amount)
    if (!Number.isFinite(amount) || amount <= 0) return toast.error(t('accounting_valid_amount'))
    setSaving(true)
    try {
      await addExpense({
        category: expenseForm.category,
        description: expenseForm.description.trim(),
        date: expenseForm.date,
        amount,
        paymentMethod: expenseForm.paymentMethod,
        notes: expenseForm.notes.trim(),
      })
      setExpenseForm({ category: 'other', description: '', date: today(), amount: '', paymentMethod: 'cash', notes: '' })
      toast.success(t('accounting_expense_saved'))
    } catch (error) {
      console.error('Expense save failed:', error)
      toast.error(error.code === 'permission-denied' ? t('pos_permission_denied') : t('accounting_save_failed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold md:text-2xl">{t('accounting_title')}</h1>
          <p className="mt-1 text-sm text-hrr-silver">{t('accounting_subtitle')}</p>
        </div>
        <div className="flex gap-2" role="tablist" aria-label={t('accounting_title')}>
          {['purchases', 'expenses'].map(tab => (
            <button key={tab} role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`rounded-md border px-3 py-2 text-sm font-bold ${activeTab === tab ? 'border-hrr-red bg-hrr-red/15 text-white' : 'border-white/10 text-hrr-silver'}`}>
              {t(`accounting_${tab}`)}
            </button>
          ))}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="stat-card"><FiPackage className="text-xl text-orange-300" /><span className="font-bold">{formatCurrency(purchasesValue)}</span><span className="text-xs text-hrr-silver">{t('accounting_month_purchases')}</span></div>
        <div className="stat-card"><FiDollarSign className="text-xl text-red-300" /><span className="font-bold">{formatCurrency(expensesValue)}</span><span className="text-xs text-hrr-silver">{t('accounting_month_expenses')}</span></div>
        <div className="stat-card"><FiFileText className="text-xl text-yellow-300" /><span className="font-bold">{formatCurrency(supplierBalances)}</span><span className="text-xs text-hrr-silver">{t('accounting_supplier_balances')}</span></div>
      </section>

      {activeTab === 'purchases' ? (
        <section className="grid gap-5 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]">
          <form onSubmit={savePurchase} className="card space-y-3">
            <h2 className="font-heading text-lg font-bold">{t('accounting_new_purchase')}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex gap-2">
                <select required value={purchaseForm.supplierId} onChange={event => {
                  const supplier = suppliers.find(item => item.id === event.target.value)
                  setPurchaseForm(current => ({ ...current, supplierId: event.target.value, supplier: supplier?.name || '' }))
                }} className="input-field min-w-0 py-2">
                  <option value="">{t('accounting_choose_supplier')}</option>
                  {suppliers.map(supplier => <option key={supplier.id} value={supplier.id}>{supplier.name}{supplier.phone ? ` · ${supplier.phone}` : ''}</option>)}
                </select>
                <button type="button" onClick={() => setShowSupplierForm(value => !value)} className="btn-secondary shrink-0 px-3" title={t('accounting_add_supplier')}><FiPlus /></button>
              </div>
              <input value={purchaseForm.invoiceNumber} onChange={event => setPurchaseForm(current => ({ ...current, invoiceNumber: event.target.value }))} className="input-field py-2" placeholder={t('accounting_supplier_invoice')} />
              <input required type="date" value={purchaseForm.date} onChange={event => setPurchaseForm(current => ({ ...current, date: event.target.value }))} className="input-field py-2" aria-label={t('date')} />
              <select value={purchaseForm.paymentMethod} onChange={event => setPurchaseForm(current => ({ ...current, paymentMethod: event.target.value, paidAmount: event.target.value === 'credit' ? '0' : '' }))} className="input-field py-2">
                {['cash', 'card', 'transfer', 'credit'].map(method => <option key={method} value={method}>{t(`pos_${method}`)}</option>)}
              </select>
              <input type="number" min="0" step="0.001" value={purchaseForm.shippingCost} onChange={event => setPurchaseForm(current => ({ ...current, shippingCost: event.target.value }))} className="input-field py-2" placeholder={`${t('accounting_shipping_optional')} (KWD)`} />
            </div>

            {showSupplierForm && <div className="grid gap-2 rounded-md border border-white/10 bg-black/20 p-3 sm:grid-cols-2">
              <input required value={supplierForm.name} onChange={event => setSupplierForm(current => ({ ...current, name: event.target.value }))} className="input-field py-2" placeholder={t('accounting_supplier')} />
              <input value={supplierForm.phone} onChange={event => setSupplierForm(current => ({ ...current, phone: event.target.value }))} className="input-field py-2" placeholder={t('accounting_supplier_phone_optional')} dir="ltr" />
              <input value={supplierForm.notes} onChange={event => setSupplierForm(current => ({ ...current, notes: event.target.value }))} className="input-field py-2 sm:col-span-2" placeholder={t('notes')} />
              <button type="button" onClick={saveSupplier} disabled={savingSupplier} className="btn-primary py-2 disabled:opacity-50">{savingSupplier ? t('pos_saving') : t('accounting_save_supplier')}</button>
              <button type="button" onClick={() => setShowSupplierForm(false)} className="btn-secondary py-2">{t('cancel')}</button>
            </div>}

            <div className="space-y-2">
              <div className="flex items-center justify-between"><h3 className="text-sm font-bold">{t('accounting_purchase_lines')}</h3><button type="button" onClick={() => setPurchaseForm(current => ({ ...current, lines: [...current.lines, newLine()] }))} className="btn-secondary flex items-center gap-1 px-3 py-2 text-xs"><FiPlus /> {t('add')}</button></div>
              {purchaseForm.lines.map((line, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_74px_110px_34px]">
                  <select value={line.isNew ? NEW_ITEM : line.inventoryId} onChange={event => setPurchaseForm(current => ({
                    ...current,
                    lines: current.lines.map((currentLine, lineIndex) => lineIndex === index
                      ? { ...currentLine, isNew: event.target.value === NEW_ITEM, inventoryId: event.target.value === NEW_ITEM ? '' : event.target.value }
                      : currentLine),
                  }))} className="input-field py-2">
                    <option value="">{t('pos_choose_part')}</option>
                    {inventory.map(item => <option key={item.id} value={item.id}>{item.partName} · {t('pos_stock')}: {item.quantity}</option>)}
                    <option value={NEW_ITEM}>{t('accounting_new_inventory_item')}</option>
                  </select>
                  {line.isNew && <div className="grid gap-2 sm:col-span-4 sm:grid-cols-3">
                    <input required value={line.partName} onChange={event => updateLine(index, 'partName', event.target.value)} className="input-field py-2" placeholder={t('part_name')} />
                    <input value={line.partNumber} onChange={event => updateLine(index, 'partNumber', event.target.value)} className="input-field py-2" placeholder={t('part_number')} />
                    <input type="number" min="0" step="0.001" value={line.sellPrice} onChange={event => updateLine(index, 'sellPrice', event.target.value)} className="input-field py-2" placeholder={t('sell_price')} />
                  </div>}
                  <input required type="number" min="1" step="1" value={line.quantity} onChange={event => updateLine(index, 'quantity', event.target.value)} className="input-field py-2" aria-label={t('quantity')} />
                  <input required type="number" min="0" step="0.001" value={line.unitCost} onChange={event => updateLine(index, 'unitCost', event.target.value)} className="input-field py-2" placeholder={t('accounting_unit_cost')} aria-label={t('accounting_unit_cost')} />
                  <button type="button" onClick={() => setPurchaseForm(current => ({ ...current, lines: current.lines.length === 1 ? [newLine()] : current.lines.filter((_, lineIndex) => lineIndex !== index) }))} className="grid place-items-center text-red-300" title={t('delete')}><FiTrash2 /></button>
                </div>
              ))}
            </div>

            {purchaseForm.paymentMethod !== 'credit' && <label className="block space-y-1 text-sm text-hrr-silver">{t('accounting_paid_now')}<input type="number" min="0" step="0.001" value={purchaseForm.paidAmount} onChange={event => setPurchaseForm(current => ({ ...current, paidAmount: event.target.value }))} placeholder={purchaseTotal.toFixed(3)} className="input-field py-2 text-white" /></label>}
            <textarea value={purchaseForm.notes} onChange={event => setPurchaseForm(current => ({ ...current, notes: event.target.value }))} className="input-field min-h-20 py-2" placeholder={t('notes')} />
            <div className="space-y-1 rounded-md bg-black/20 p-3 text-sm">
              <div className="flex justify-between text-hrr-silver"><span>{t('accounting_items_subtotal')}</span><span>{formatCurrency(purchaseSubtotal)}</span></div>
              {shippingCost > 0 && <div className="flex justify-between text-hrr-silver"><span>{t('accounting_shipping')}</span><span>{formatCurrency(shippingCost)}</span></div>}
              <div className="flex justify-between"><span>{t('accounting_purchase_total')}</span><strong>{formatCurrency(purchaseTotal)}</strong></div>
              <div className="flex justify-between text-hrr-silver"><span>{t('accounting_balance_due')}</span><span>{formatCurrency(balance)}</span></div>
            </div>
            <button disabled={saving} className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-50"><FiPlus /> {saving ? t('pos_saving') : t('accounting_save_purchase')}</button>
          </form>

          <div className="space-y-3">
            <h2 className="font-heading text-lg font-bold">{t('accounting_recent_purchases')}</h2>
            {purchases.slice(0, 30).map(purchase => (
              <article key={purchase.id} className="rounded-lg border border-white/10 bg-hrr-gray p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div><h3 className="font-bold">{purchase.supplier}</h3><p className="text-xs text-hrr-silver">{formatDate(purchase.date)}{purchase.invoiceNumber ? ` · ${purchase.invoiceNumber}` : ''}</p>{Number(purchase.shippingCost) > 0 && <p className="text-xs text-hrr-silver">{t('accounting_shipping')}: {formatCurrency(purchase.shippingCost)}</p>}</div>
                  <strong>{formatCurrency(purchase.total)}</strong>
                </div>
                <p className="mt-2 text-sm text-hrr-silver">{(purchase.lines || []).map(line => `${line.partName} ×${line.quantity}`).join('، ')}</p>
                <div className="mt-2 flex flex-wrap justify-between gap-2 border-t border-white/10 pt-2 text-xs">
                  <span>{t(`pos_${purchase.paymentMethod}`)} · {t('accounting_paid_amount')}: {formatCurrency(purchase.paidAmount || 0)}</span>
                  <span>{t('accounting_balance_due')}: {formatCurrency(purchase.balance || 0)}</span>
                </div>
                {(purchase.payments || []).length > 0 && <div className="mt-2 space-y-1 text-xs text-hrr-silver">{purchase.payments.map((payment, index) => <p key={`${purchase.id}-payment-${index}`}>{formatDate(payment.date)} · {t(`pos_${payment.method}`)} · {formatCurrency(payment.amount)}</p>)}</div>}
                {Number(purchase.balance) > 0 && (
                  <div className="mt-3 border-t border-white/10 pt-3">
                    {settlementPurchaseId === purchase.id ? (
                      <form onSubmit={event => { event.preventDefault(); recordSupplierPayment(purchase) }} className="grid gap-2 sm:grid-cols-[1fr_130px_auto_auto]">
                        <input required type="number" min="0.001" max={purchase.balance} step="0.001" value={settlementForm.amount} onChange={event => setSettlementForm(current => ({ ...current, amount: event.target.value }))} className="input-field py-2" placeholder={t('accounting_payment_amount')} />
                        <select value={settlementForm.method} onChange={event => setSettlementForm(current => ({ ...current, method: event.target.value }))} className="input-field py-2">{['cash', 'card', 'transfer'].map(method => <option key={method} value={method}>{t(`pos_${method}`)}</option>)}</select>
                        <button disabled={saving} className="btn-primary px-3 py-2 text-sm disabled:opacity-50">{t('accounting_record_payment')}</button>
                        <button type="button" onClick={() => setSettlementPurchaseId('')} className="btn-secondary px-3 py-2 text-sm">{t('cancel')}</button>
                      </form>
                    ) : <button onClick={() => { setSettlementPurchaseId(purchase.id); setSettlementForm({ amount: '', method: 'cash' }) }} className="btn-secondary px-3 py-2 text-xs">{t('accounting_record_payment')}</button>}
                  </div>
                )}
              </article>
            ))}
            {!purchases.length && <p className="rounded-lg border border-white/10 p-6 text-center text-hrr-silver">{t('no_results')}</p>}
          </div>
        </section>
      ) : (
        <section className="grid gap-5 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]">
          <form onSubmit={saveExpense} className="card space-y-3">
            <h2 className="font-heading text-lg font-bold">{t('accounting_new_expense')}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <select value={expenseForm.category} onChange={event => setExpenseForm(current => ({ ...current, category: event.target.value }))} className="input-field py-2">
                {['rent', 'salaries', 'utilities', 'transport', 'maintenance', 'supplies', 'other'].map(category => <option key={category} value={category}>{t(`accounting_category_${category}`)}</option>)}
              </select>
              <input required type="number" min="0.001" step="0.001" value={expenseForm.amount} onChange={event => setExpenseForm(current => ({ ...current, amount: event.target.value }))} className="input-field py-2" placeholder={`${t('accounting_amount')} (KWD)`} />
              <input required type="date" value={expenseForm.date} onChange={event => setExpenseForm(current => ({ ...current, date: event.target.value }))} className="input-field py-2" aria-label={t('date')} />
              <select value={expenseForm.paymentMethod} onChange={event => setExpenseForm(current => ({ ...current, paymentMethod: event.target.value }))} className="input-field py-2">
                {['cash', 'card', 'transfer'].map(method => <option key={method} value={method}>{t(`pos_${method}`)}</option>)}
              </select>
            </div>
            <input value={expenseForm.description} onChange={event => setExpenseForm(current => ({ ...current, description: event.target.value }))} className="input-field py-2" placeholder={t('accounting_description_optional')} />
            <textarea value={expenseForm.notes} onChange={event => setExpenseForm(current => ({ ...current, notes: event.target.value }))} className="input-field min-h-20 py-2" placeholder={t('notes')} />
            <button disabled={saving} className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-50"><FiPlus /> {saving ? t('pos_saving') : t('accounting_save_expense')}</button>
          </form>

          <div className="space-y-3">
            <h2 className="font-heading text-lg font-bold">{t('accounting_recent_expenses')}</h2>
            {expenses.slice(0, 30).map(expense => (
              <article key={expense.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-hrr-gray p-4">
                <div><h3 className="font-bold">{t(`accounting_category_${expense.category}`)}</h3><p className="text-sm text-hrr-silver">{expense.description || expense.notes || t('accounting_no_description')}</p><p className="text-xs text-hrr-silver">{formatDate(expense.date)} · {t(`pos_${expense.paymentMethod}`)}</p></div>
                <strong>{formatCurrency(expense.amount)}</strong>
              </article>
            ))}
            {!expenses.length && <p className="rounded-lg border border-white/10 p-6 text-center text-hrr-silver">{t('no_results')}</p>}
          </div>
        </section>
      )}
    </div>
  )
}