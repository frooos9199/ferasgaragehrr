import jsPDF from 'jspdf'
import { AMIRI_FONT } from '../assets/amiriFont'
import { formatCurrency, formatDate } from './helpers'
import { convertArabic } from 'arabic-reshaper'

const isArabic = (text) => /[\u0600-\u06FF]/.test(text)

const fixArabic = (text) => {
  if (!text) return ''
  const str = String(text)
  if (!isArabic(str)) return str
  // Shape Arabic letters (connect them) then reverse for LTR PDF rendering
  const words = str.split(' ')
  const processed = words.map(word => {
    if (isArabic(word)) {
      return convertArabic(word).split('').reverse().join('')
    }
    return word
  })
  return processed.reverse().join(' ')
}

export const generateInvoicePDF = (inv) => {
  const doc = new jsPDF()
  const w = doc.internal.pageSize.getWidth()

  doc.addFileToVFS('Amiri-Regular.ttf', AMIRI_FONT)
  doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal')

  const setFont = (size, color = [0, 0, 0]) => {
    doc.setFont('Amiri', 'normal')
    doc.setFontSize(size)
    doc.setTextColor(...color)
  }

  // === RED TOP BAR ===
  doc.setFillColor(220, 38, 38)
  doc.rect(0, 0, w, 4, 'F')

  // === LOGO AREA ===
  doc.setFillColor(17, 17, 17)
  doc.rect(0, 4, w, 40, 'F')

  setFont(28, [220, 38, 38])
  doc.text('HRR', w / 2, 22, { align: 'center' })
  setFont(9, [180, 180, 180])
  doc.text('HOT ROD RACING', w / 2, 30, { align: 'center' })
  setFont(8, [180, 180, 180])
  doc.text('Managed by Firas Al-Otaibi', w / 2, 36, { align: 'center' })

  // === INVOICE TITLE ===
  doc.setFillColor(30, 30, 30)
  doc.rect(0, 44, w, 12, 'F')
  setFont(12, [255, 255, 255])
  doc.text('INVOICE', 20, 52)
  setFont(12, [220, 38, 38])
  doc.text(`#${inv.number}`, w - 20, 52, { align: 'right' })

  // === INFO SECTION ===
  let y = 66
  setFont(9, [120, 120, 120])
  doc.text('Date', 20, y)
  doc.text('Customer', 80, y)
  doc.text('Phone', 145, y)
  y += 6
  setFont(10, [0, 0, 0])
  doc.text(formatDate(inv.createdAt), 20, y)
  doc.text(fixArabic(inv.customerName || '-'), 80, y)
  doc.text(inv.customerPhone || '-', 145, y)

  y += 12
  setFont(9, [120, 120, 120])
  doc.text('Vehicle', 20, y)
  doc.text('Plate Number', 80, y)
  doc.text('Work Order', 145, y)
  y += 6
  setFont(10, [0, 0, 0])
  doc.text(`Ford ${inv.carModel || ''} ${inv.carYear || ''}`, 20, y)
  doc.text(inv.carPlate || '-', 80, y)
  doc.text(inv.orderNumber || '-', 145, y)

  // === DIVIDER ===
  y += 10
  doc.setDrawColor(220, 38, 38)
  doc.setLineWidth(0.5)
  doc.line(20, y, w - 20, y)

  // === TABLE HEADER ===
  y += 8
  doc.setFillColor(245, 245, 245)
  doc.rect(20, y - 5, w - 40, 10, 'F')
  setFont(9, [80, 80, 80])
  doc.text('#', 25, y + 1)
  doc.text('Description', 35, y + 1)
  doc.text('Amount (KWD)', w - 25, y + 1, { align: 'right' })

  // === TABLE ROWS ===
  y += 12
  let itemNum = 1
  ;(inv.items || []).forEach(item => {
    setFont(9, [120, 120, 120])
    doc.text(String(itemNum), 25, y)
    setFont(10, [30, 30, 30])
    doc.text(fixArabic(item.name), 35, y)
    doc.text(formatCurrency(item.price), w - 25, y, { align: 'right' })
    doc.setDrawColor(230, 230, 230)
    doc.setLineWidth(0.2)
    doc.line(20, y + 3, w - 20, y + 3)
    y += 9
    itemNum++
  })

  if (inv.laborCost > 0) {
    setFont(9, [120, 120, 120])
    doc.text(String(itemNum), 25, y)
    setFont(10, [30, 30, 30])
    doc.text('Labor Cost', 35, y)
    doc.text(formatCurrency(inv.laborCost), w - 25, y, { align: 'right' })
    y += 9
  }

  // === TOTAL BOX ===
  y += 5
  doc.setFillColor(220, 38, 38)
  doc.roundedRect(w - 90, y - 2, 70, 16, 3, 3, 'F')
  setFont(10, [255, 255, 255])
  doc.text('TOTAL', w - 85, y + 8)
  setFont(13, [255, 255, 255])
  doc.text(formatCurrency(inv.total), w - 25, y + 8, { align: 'right' })

  // === FOOTER ===
  const footerY = 270
  doc.setDrawColor(220, 38, 38)
  doc.setLineWidth(0.3)
  doc.line(20, footerY, w - 20, footerY)

  setFont(8, [150, 150, 150])
  doc.text('HOT ROD RACING - HRR | Ford Specialist Workshop', 20, footerY + 6)
  doc.text('+96550540999 | Kuwait', w - 20, footerY + 6, { align: 'right' })
  doc.text('Thank you for choosing HRR!', w / 2, footerY + 12, { align: 'center' })

  // === RED BOTTOM BAR ===
  doc.setFillColor(220, 38, 38)
  doc.rect(0, 293, w, 4, 'F')

  doc.save(`HRR-Invoice-${inv.number}.pdf`)
}
