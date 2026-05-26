import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { INVOICE_WARRANTY_NOTE_EN } from '../../config/constants'

export default function InvoiceView() {
  const { invoiceId } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [receivedAt, setReceivedAt] = useState(null)

  useEffect(() => {
    if (!invoiceId) {
      setLoading(false)
      return
    }

    const unsubInvoice = onSnapshot(
      doc(db, 'invoices', invoiceId),
      (snap) => {
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() }
          setInvoice(data)
          setReceivedAt(data.receivedAt || null)
        }
        setLoading(false)
      },
      () => setLoading(false)
    )

    return () => unsubInvoice()
  }, [invoiceId])

  useEffect(() => {
    if (!invoice?.orderId) return
    if (invoice?.receivedAt) return

    const unsubOrder = onSnapshot(
      doc(db, 'workOrders', invoice.orderId),
      (snap) => {
        if (snap.exists()) setReceivedAt(snap.data()?.createdAt || null)
      }
    )

    return () => unsubOrder()
  }, [invoice?.orderId, invoice?.receivedAt])

  if (loading) return <div className="min-h-screen bg-hrr-dark flex items-center justify-center text-white text-xl">🏁 Loading...</div>
  if (!invoice) return <div className="min-h-screen bg-hrr-dark flex items-center justify-center text-white text-xl">Invoice not found</div>

  const items = Array.isArray(invoice.items) ? invoice.items : []

  return (
    <div className="min-h-screen bg-hrr-dark text-white p-4 max-w-2xl mx-auto">
      <div className="text-center mb-8 pt-4">
        <h1 className="font-heading text-3xl font-bold text-hrr-red">🏁 HRR</h1>
        <p className="text-hrr-silver">HOT ROD RACING</p>
      </div>

      <div className="card mb-4">
        <h2 className="font-heading text-xl font-bold mb-2">Invoice: {invoice.number || invoice.id}</h2>
        <p className="text-hrr-silver">Date: {formatDate(invoice.createdAt)}</p>
        <p className="text-hrr-silver">Vehicle Received: {formatDate(receivedAt || invoice.createdAt)}</p>
        {invoice.customerName && <p className="text-hrr-silver">Customer: {invoice.customerName}</p>}
        {(invoice.carModel || invoice.carYear || invoice.carPlate) && (
          <p className="text-hrr-silver">Vehicle: Ford {invoice.carModel || '-'} {invoice.carYear || ''} • Plate: {invoice.carPlate || '-'}</p>
        )}
      </div>

      <div className="card mb-4">
        <h3 className="font-bold mb-3">Details</h3>
        {items.length === 0 && <p className="text-hrr-silver">No items</p>}
        {items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm mb-1">
            <span className="text-hrr-silver">{item?.name || '-'}</span>
            <span>{formatCurrency(item?.price || 0)}</span>
          </div>
        ))}

        {Number(invoice.laborCost) > 0 && (
          <div className="flex justify-between text-sm mb-1">
            <span className="text-hrr-silver">Labor</span>
            <span>{formatCurrency(invoice.laborCost)}</span>
          </div>
        )}

        {invoice.notes && (
          <div className="pt-3 mt-3 border-t border-hrr-silver/20">
            <p className="text-xs text-hrr-silver mb-1">Notes</p>
            <p dir="auto" className="text-sm whitespace-pre-wrap leading-7">{invoice.notes}</p>
          </div>
        )}

        <div className="flex justify-between font-bold text-lg pt-2 mt-3 border-t border-hrr-silver/20">
          <span>Total</span>
          <span className="text-hrr-gold">{formatCurrency(invoice.total || 0)}</span>
        </div>

        <div className="pt-3 mt-3 border-t border-hrr-silver/20">
          <p className="text-xs text-hrr-silver mb-1">Warranty Notice</p>
          <p className="text-xs text-hrr-silver whitespace-pre-wrap leading-6">{INVOICE_WARRANTY_NOTE_EN}</p>
        </div>
      </div>

      <p className="text-center text-hrr-silver text-sm mt-8 pb-4">Thank you for choosing HRR! 🏁</p>
    </div>
  )
}
