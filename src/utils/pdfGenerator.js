import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { formatCurrency, formatDate } from './helpers'
import { INVOICE_WARRANTY_NOTE_EN } from '../config/constants'

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;')

const buildInvoiceMarkup = (inv) => {
  const items = inv.items || []
  const warrantyHtml = escapeHtml(INVOICE_WARRANTY_NOTE_EN).replaceAll('\n', '<br/>')
  const invoiceNumber = escapeHtml(inv.number || '-')
  const customerName = escapeHtml(inv.customerName || '-')
  const customerPhone = escapeHtml(inv.customerPhone || '-')
  const vehicle = escapeHtml(`Ford ${inv.carModel || ''} ${inv.carYear || ''}`.trim())
  const plateNumber = escapeHtml(inv.carPlate || '-')
  const workOrderNumber = escapeHtml(inv.orderNumber || '-')
  const totalAmount = formatCurrency(Number(inv.total) || 0)
  const notesSection = inv.notes
    ? `
      <div style="padding:0 40px 20px;">
        <div style="color:#999999;font-size:11px;margin-bottom:6px;">Notes</div>
        <div dir="auto" style="background:#f5f5f5;border-radius:10px;padding:14px 16px;font-size:13px;line-height:1.9;color:#222222;white-space:pre-wrap;unicode-bidi:plaintext;text-align:start;font-family:'Cairo',sans-serif;">${escapeHtml(inv.notes)}</div>
      </div>`
    : ''
  let rowsHTML = ''
  items.forEach((item, i) => {
    const arabicName = item.nameAr || item.name || ''
    const englishName = item.nameEn || ''
    const descriptionHTML = englishName && englishName !== arabicName
      ? `<div dir="rtl" style="text-align:right;">${escapeHtml(arabicName)}</div><div dir="ltr" style="text-align:left;color:#666;font-size:12px;margin-top:3px;">${escapeHtml(englishName)}</div>`
      : escapeHtml(arabicName)
    rowsHTML += `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#888;width:40px;font-size:13px;">${i + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px;color:#222;">${descriptionHTML}</td>
        <td dir="ltr" style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;font-weight:bold;font-size:14px;color:#222;unicode-bidi:isolate;">${formatCurrency(Number(item.price) || 0)}</td>
      </tr>`
  })
  if (inv.laborCost > 0) {
    rowsHTML += `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#888;font-size:13px;">${items.length + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px;color:#222;">Labor Cost</td>
        <td dir="ltr" style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;font-weight:bold;font-size:14px;color:#222;unicode-bidi:isolate;">${formatCurrency(Number(inv.laborCost) || 0)}</td>
      </tr>`
  }

  return `
    <div dir="ltr" style="width:794px;min-height:1123px;display:flex;flex-direction:column;background:#fff;color:#000;font-family:'Cairo',sans-serif;">
      <div style="height:8px;background:#DC2626;"></div>
      
      <div style="background:#111111;padding:30px 40px;text-align:center;">
        <div style="font-size:40px;font-weight:900;color:#DC2626;letter-spacing:6px;">HRR</div>
        <div style="color:#aaaaaa;font-size:12px;margin-top:6px;letter-spacing:3px;">HOT ROD RACING</div>
        <div style="color:#777777;font-size:11px;margin-top:4px;">Managed by Firas Al-Otaibi</div>
      </div>

      <table dir="ltr" style="width:100%;border-collapse:collapse;background:#1E1E1E;">
        <tr>
          <td style="padding:12px 40px;color:#ffffff;font-size:16px;font-weight:bold;letter-spacing:2px;">INVOICE</td>
          <td dir="ltr" style="padding:12px 40px;color:#DC2626;font-size:16px;font-weight:bold;text-align:right;unicode-bidi:isolate;">#${invoiceNumber}</td>
        </tr>
      </table>

      <table dir="ltr" style="width:100%;border-collapse:collapse;padding:0;table-layout:fixed;">
        <tr>
          <td style="padding:20px 40px 4px;color:#999999;font-size:11px;width:33%;">Date</td>
          <td style="padding:20px 40px 4px;color:#999999;font-size:11px;width:33%;">Customer</td>
          <td style="padding:20px 40px 4px;color:#999999;font-size:11px;width:33%;">Phone</td>
        </tr>
        <tr>
          <td dir="ltr" style="padding:2px 40px 16px;font-size:14px;font-weight:bold;color:#000000;unicode-bidi:isolate;">${formatDate(inv.createdAt)}</td>
          <td style="padding:2px 40px 16px;font-size:14px;font-weight:bold;color:#000000;" dir="auto">${customerName}</td>
          <td dir="ltr" style="padding:2px 40px 16px;font-size:14px;font-weight:bold;color:#000000;unicode-bidi:isolate;">${customerPhone}</td>
        </tr>
        <tr>
          <td style="padding:0 40px 4px;color:#999999;font-size:11px;">Vehicle Received</td>
          <td style="padding:0 40px 4px;color:#999999;font-size:11px;"></td>
          <td style="padding:0 40px 4px;color:#999999;font-size:11px;"></td>
        </tr>
        <tr>
          <td dir="ltr" style="padding:2px 40px 16px;font-size:14px;font-weight:bold;color:#000000;unicode-bidi:isolate;">${formatDate(inv.receivedAt || inv.createdAt)}</td>
          <td style="padding:2px 40px 16px;font-size:14px;font-weight:bold;color:#000000;"></td>
          <td style="padding:2px 40px 16px;font-size:14px;font-weight:bold;color:#000000;"></td>
        </tr>
        <tr>
          <td style="padding:0 40px 4px;color:#999999;font-size:11px;">Vehicle</td>
          <td style="padding:0 40px 4px;color:#999999;font-size:11px;">Plate Number</td>
          <td style="padding:0 40px 4px;color:#999999;font-size:11px;">Work Order</td>
        </tr>
        <tr>
          <td dir="ltr" style="padding:2px 40px 20px;font-size:14px;font-weight:bold;color:#000000;unicode-bidi:isolate;">${vehicle}</td>
          <td dir="ltr" style="padding:2px 40px 20px;font-size:14px;font-weight:bold;color:#000000;unicode-bidi:isolate;">${plateNumber}</td>
          <td dir="ltr" style="padding:2px 40px 20px;font-size:14px;font-weight:bold;color:#000000;unicode-bidi:isolate;">${workOrderNumber}</td>
        </tr>
      </table>

      <div style="margin:0 40px;height:2px;background:#DC2626;"></div>

      <div style="padding:20px 28px;">
        <table dir="ltr" style="width:100%;border-collapse:collapse;table-layout:fixed;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:10px 12px;text-align:left;color:#666666;font-size:12px;font-weight:bold;width:40px;">#</th>
              <th style="padding:10px 12px;text-align:left;color:#666666;font-size:12px;font-weight:bold;">Description</th>
              <th dir="ltr" style="padding:10px 12px;text-align:right;color:#666666;font-size:12px;font-weight:bold;white-space:nowrap;unicode-bidi:isolate;">Amount (KWD)</th>
            </tr>
          </thead>
          <tbody>${rowsHTML}</tbody>
        </table>
      </div>

      ${notesSection}

      <table dir="ltr" style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:10px 40px;text-align:right;">
            <table dir="ltr" style="margin-left:auto;border-collapse:collapse;">
              <tr>
                <td style="background:#DC2626;color:#ffffff;padding:14px 24px;font-size:14px;font-weight:bold;border-radius:8px 0 0 8px;">TOTAL</td>
                <td dir="ltr" style="background:#DC2626;color:#ffffff;padding:14px 24px;font-size:22px;font-weight:900;border-radius:0 8px 8px 0;white-space:nowrap;unicode-bidi:isolate;">${totalAmount}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <div style="padding:12px 40px 0;">
        <div dir="ltr" style="color:#777777;font-size:9.5px;line-height:1.6;white-space:normal;text-align:left;unicode-bidi:isolate;">${warrantyHtml}</div>
      </div>

      <div style="margin:auto 40px 0;border-top:1px solid #DC2626;padding:12px 0 0;">
        <table dir="ltr" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#999999;font-size:10px;">HOT ROD RACING - HRR | Ford Specialist Workshop</td>
            <td style="color:#999999;font-size:10px;text-align:right;">+96550540999 | Kuwait</td>
          </tr>
        </table>
        <div style="text-align:center;padding:8px 0;color:#aaaaaa;font-size:10px;">Thank you for choosing HRR!</div>
      </div>

      <div style="height:8px;background:#DC2626;"></div>
    </div>
  `
}

const buildInvoicePDF = async (inv) => {
  const container = document.createElement('div')
  container.style.cssText = 'position:absolute;top:-9999px;left:0;width:794px;background:#fff;z-index:-1;'
  container.innerHTML = buildInvoiceMarkup(inv)
  document.body.appendChild(container)

  try {
    await new Promise(r => setTimeout(r, 300))
    const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false })
    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfW = pdf.internal.pageSize.getWidth()
    const pdfH = (canvas.height * pdfW) / canvas.width
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH)
    return pdf
  } finally {
    document.body.removeChild(container)
  }
}

export const generateInvoicePDFBlob = async (inv) => {
  const pdf = await buildInvoicePDF(inv)
  return pdf.output('blob')
}

export const generateInvoicePDF = async (inv) => {
  const pdf = await buildInvoicePDF(inv)
    pdf.save(`HRR-Invoice-${inv.number}.pdf`)
}
