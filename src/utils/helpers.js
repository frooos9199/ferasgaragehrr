import { WHATSAPP_NUMBER } from '../config/constants'

export const formatCurrency = (amount) =>
  `${Number(amount).toFixed(3)} KWD`

export const formatDate = (date) => {
  if (!date) return '-'
  const d = date?.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('en-GB')
}

export const sendWhatsApp = (phone, message) => {
  const cleaned = phone.replace(/\D/g, '')
  window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`, '_blank')
}

export const sendInvoiceWhatsApp = (invoice, customer, car) => {
  const msg = `🏁 *HOT ROD RACING - HRR*
Managed by Firas Al-Otaibi

📄 Invoice #: ${invoice.number}
📅 Date: ${formatDate(invoice.createdAt)}

👤 Customer: ${customer.name}
🚗 Vehicle: Ford ${car.model} ${car.year}
🔢 Plate: ${car.plateNumber}

🔧 Services:
${invoice.items.map(i => `✅ ${i.name}  ${formatCurrency(i.price)}`).join('\n')}

💰 *Total: ${formatCurrency(invoice.total)}*

📞 +${WHATSAPP_NUMBER}
Thank you for choosing HRR! 🏁`

  sendWhatsApp(customer.phone, msg)
}

export const generateOrderNumber = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const r = String(Math.floor(Math.random() * 9999)).padStart(4, '0')
  return `HRR-${y}${m}-${r}`
}
