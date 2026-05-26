import { WHATSAPP_NUMBER } from '../config/constants'

export const formatCurrency = (amount) =>
  `${Number(amount).toFixed(3)} KWD`

export const formatDate = (date) => {
  if (!date) return '-'
  const d = date?.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('en-GB')
}

export const normalizeWhatsAppPhone = (phone, defaultCountryCode = '965') => {
  if (phone === null || phone === undefined) return ''

  let cleaned = String(phone).trim()
  if (!cleaned) return ''

  // Remove spaces/dashes/etc, keep digits.
  cleaned = cleaned.replace(/[^0-9+]/g, '')
  if (cleaned.startsWith('+')) cleaned = cleaned.slice(1)
  cleaned = cleaned.replace(/\D/g, '')

  // Convert 00CC... to CC...
  if (cleaned.startsWith('00')) cleaned = cleaned.slice(2)

  // If no country code, assume Kuwait (965) by default.
  if (defaultCountryCode && !cleaned.startsWith(defaultCountryCode)) {
    // Kuwait local numbers are typically 8 digits; sometimes stored as 0XXXXXXXX.
    if (cleaned.length === 8) cleaned = `${defaultCountryCode}${cleaned}`
    else if (cleaned.length === 9 && cleaned.startsWith('0')) cleaned = `${defaultCountryCode}${cleaned.slice(1)}`
  }

  return cleaned
}

export const sendWhatsApp = (phone, message) => {
  const cleaned = normalizeWhatsAppPhone(phone)
  if (!cleaned || cleaned.length < 8) {
    console.warn('WhatsApp send skipped: invalid phone', { phone, cleaned })
    return false
  }

  const text = encodeURIComponent(message ?? '')
  const url = `https://wa.me/${cleaned}?text=${text}`
  window.open(url, '_blank', 'noopener,noreferrer')
  return true
}

export const formatWhatsAppNotes = (notes) => {
  if (!notes?.trim()) return ''
  return `📝 *Notes:*
\u202B${notes.trim()}\u202C

`
}

export const sendInvoiceWhatsApp = (invoice, customer, car) => {
  const items = Array.isArray(invoice?.items) ? invoice.items : []
  const origin = window.location.origin
  const workshopLink = invoice?.orderId ? `${origin}/client/${invoice.orderId}` : origin
  const invoiceLink = invoice?.id ? `${origin}/invoice/${invoice.id}` : origin
  const msg = `🏁 *HOT ROD RACING - HRR*
Managed by Firas Al-Otaibi

📄 Invoice #: ${invoice?.number || '-'}
📅 Date: ${formatDate(invoice?.createdAt)}

👤 Customer: ${customer?.name || '-'}
🚗 Vehicle: Ford ${car?.model || '-'} ${car?.year || ''}
🔢 Plate: ${car?.plateNumber || '-'}

🔧 Services:
${items.map(i => `✅ ${i?.name || '-'}  ${formatCurrency(i?.price)}`).join('\n')}

${formatWhatsAppNotes(invoice.notes)}

💰 *Total: ${formatCurrency(invoice?.total || 0)}*

🔗 Workshop: ${workshopLink}
🧾 Invoice: ${invoiceLink}

📞 +${WHATSAPP_NUMBER}
Thank you for choosing HRR! 🏁`

  return sendWhatsApp(customer?.phone, msg)
}

export const sendWorkOrderWhatsApp = (order) => {
  const link = `${window.location.origin}/client/${order.id}`
  const msg = `🏁 *HOT ROD RACING - HRR*

Hi ${order.customerName},
Your vehicle Ford ${order.carModel} ${order.carYear} is being serviced.

${formatWhatsAppNotes(order.notes)}Track status here:
${link}

📞 +${WHATSAPP_NUMBER}`

  return sendWhatsApp(order?.customerPhone, msg)
}

export const generateOrderNumber = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const r = String(Math.floor(Math.random() * 9999)).padStart(4, '0')
  return `HRR-${y}${m}-${r}`
}
