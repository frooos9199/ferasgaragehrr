import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { formatCurrency, formatDate } from './helpers'

export const generateInvoicePDF = async (inv) => {
  const container = document.createElement('div')
  container.style.cssText = 'position:absolute;top:-9999px;left:0;width:794px;background:#fff;z-index:-1;'

  const items = inv.items || []
  let rowsHTML = ''
  items.forEach((item, i) => {
    rowsHTML += `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#888;width:40px;font-size:13px;">${i + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px;color:#222;">${item.name || ''}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:bold;font-size:14px;color:#222;">${formatCurrency(item.price)}</td>
      </tr>`
  })
  if (inv.laborCost > 0) {
    rowsHTML += `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#888;font-size:13px;">${items.length + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px;color:#222;">Labor Cost</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:bold;font-size:14px;color:#222;">${formatCurrency(inv.laborCost)}</td>
      </tr>`
  }

  container.innerHTML = `
    <div style="width:794px;background:#fff;color:#000;">
      <div style="height:8px;background:#DC2626;"></div>
      
      <div style="background:#111111;padding:30px 40px;text-align:center;">
        <div style="font-size:40px;font-weight:900;color:#DC2626;letter-spacing:6px;">HRR</div>
        <div style="color:#aaaaaa;font-size:12px;margin-top:6px;letter-spacing:3px;">HOT ROD RACING</div>
        <div style="color:#777777;font-size:11px;margin-top:4px;">Managed by Firas Al-Otaibi</div>
      </div>

      <table style="width:100%;border-collapse:collapse;background:#1E1E1E;">
        <tr>
          <td style="padding:12px 40px;color:#ffffff;font-size:16px;font-weight:bold;letter-spacing:2px;">INVOICE</td>
          <td style="padding:12px 40px;color:#DC2626;font-size:16px;font-weight:bold;text-align:right;">#${inv.number}</td>
        </tr>
      </table>

      <table style="width:100%;border-collapse:collapse;padding:0;">
        <tr>
          <td style="padding:20px 40px 4px;color:#999999;font-size:11px;width:33%;">Date</td>
          <td style="padding:20px 40px 4px;color:#999999;font-size:11px;width:33%;">Customer</td>
          <td style="padding:20px 40px 4px;color:#999999;font-size:11px;width:33%;">Phone</td>
        </tr>
        <tr>
          <td style="padding:2px 40px 16px;font-size:14px;font-weight:bold;color:#000000;">${formatDate(inv.createdAt)}</td>
          <td style="padding:2px 40px 16px;font-size:14px;font-weight:bold;color:#000000;" dir="auto">${inv.customerName || '-'}</td>
          <td style="padding:2px 40px 16px;font-size:14px;font-weight:bold;color:#000000;" dir="ltr">${inv.customerPhone || '-'}</td>
        </tr>
        <tr>
          <td style="padding:0 40px 4px;color:#999999;font-size:11px;">Vehicle</td>
          <td style="padding:0 40px 4px;color:#999999;font-size:11px;">Plate Number</td>
          <td style="padding:0 40px 4px;color:#999999;font-size:11px;">Work Order</td>
        </tr>
        <tr>
          <td style="padding:2px 40px 20px;font-size:14px;font-weight:bold;color:#000000;">Ford ${inv.carModel || ''} ${inv.carYear || ''}</td>
          <td style="padding:2px 40px 20px;font-size:14px;font-weight:bold;color:#000000;">${inv.carPlate || '-'}</td>
          <td style="padding:2px 40px 20px;font-size:14px;font-weight:bold;color:#000000;">${inv.orderNumber || '-'}</td>
        </tr>
      </table>

      <div style="margin:0 40px;height:2px;background:#DC2626;"></div>

      <div style="padding:20px 28px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:10px 12px;text-align:left;color:#666666;font-size:12px;font-weight:bold;width:40px;">#</th>
              <th style="padding:10px 12px;text-align:left;color:#666666;font-size:12px;font-weight:bold;">Description</th>
              <th style="padding:10px 12px;text-align:right;color:#666666;font-size:12px;font-weight:bold;">Amount (KWD)</th>
            </tr>
          </thead>
          <tbody>${rowsHTML}</tbody>
        </table>
      </div>

      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:10px 40px;text-align:right;">
            <table style="margin-left:auto;border-collapse:collapse;">
              <tr>
                <td style="background:#DC2626;color:#ffffff;padding:14px 24px;font-size:14px;font-weight:bold;border-radius:8px 0 0 8px;">TOTAL</td>
                <td style="background:#DC2626;color:#ffffff;padding:14px 24px;font-size:22px;font-weight:900;border-radius:0 8px 8px 0;">${formatCurrency(inv.total)}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <div style="margin:20px 40px 0;border-top:1px solid #DC2626;padding:12px 0;">
        <table style="width:100%;border-collapse:collapse;">
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

  document.body.appendChild(container)

  try {
    await new Promise(r => setTimeout(r, 300))
    const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false })
    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfW = pdf.internal.pageSize.getWidth()
    const pdfH = (canvas.height * pdfW) / canvas.width
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH)
    pdf.save(`HRR-Invoice-${inv.number}.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}
