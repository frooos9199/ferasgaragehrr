import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { formatCurrency, formatDate } from './helpers'

export const generateInvoicePDF = async (inv) => {
  // Create hidden div with invoice HTML
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;top:-9999px;left:0;width:794px;background:#fff;font-family:Cairo,Arial,sans-serif;'
  
  const items = inv.items || []
  const itemsHTML = items.map((item, i) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#888;width:30px">${i + 1}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px">${item.name || ''}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:bold">${formatCurrency(item.price)}</td>
    </tr>
  `).join('')

  const laborHTML = inv.laborCost > 0 ? `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#888">${items.length + 1}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee">Labor Cost</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:bold">${formatCurrency(inv.laborCost)}</td>
    </tr>
  ` : ''

  container.innerHTML = `
    <div style="padding:0;margin:0;">
      <!-- Red top bar -->
      <div style="height:8px;background:#DC2626;"></div>
      
      <!-- Header -->
      <div style="background:#111;padding:30px 40px;text-align:center;">
        <div style="font-size:42px;font-weight:900;color:#DC2626;letter-spacing:8px;">🏁 HRR</div>
        <div style="color:#aaa;font-size:13px;margin-top:4px;letter-spacing:3px;">HOT ROD RACING</div>
        <div style="color:#777;font-size:11px;margin-top:4px;">Managed by Firas Al-Otaibi</div>
      </div>

      <!-- Invoice title bar -->
      <div style="background:#1E1E1E;padding:14px 40px;display:flex;justify-content:space-between;align-items:center;">
        <span style="color:#fff;font-size:18px;font-weight:bold;letter-spacing:2px;">INVOICE</span>
        <span style="color:#DC2626;font-size:18px;font-weight:bold;">#${inv.number}</span>
      </div>

      <!-- Info section -->
      <div style="padding:25px 40px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="width:33%;padding-bottom:4px;color:#888;font-size:11px;">Date</td>
            <td style="width:33%;padding-bottom:4px;color:#888;font-size:11px;">Customer</td>
            <td style="width:33%;padding-bottom:4px;color:#888;font-size:11px;">Phone</td>
          </tr>
          <tr>
            <td style="padding-bottom:20px;font-size:14px;font-weight:bold;">${formatDate(inv.createdAt)}</td>
            <td style="padding-bottom:20px;font-size:14px;font-weight:bold;" dir="auto">${inv.customerName || '-'}</td>
            <td style="padding-bottom:20px;font-size:14px;font-weight:bold;" dir="ltr">${inv.customerPhone || '-'}</td>
          </tr>
          <tr>
            <td style="padding-bottom:4px;color:#888;font-size:11px;">Vehicle</td>
            <td style="padding-bottom:4px;color:#888;font-size:11px;">Plate Number</td>
            <td style="padding-bottom:4px;color:#888;font-size:11px;">Work Order</td>
          </tr>
          <tr>
            <td style="font-size:14px;font-weight:bold;">Ford ${inv.carModel || ''} ${inv.carYear || ''}</td>
            <td style="font-size:14px;font-weight:bold;">${inv.carPlate || '-'}</td>
            <td style="font-size:14px;font-weight:bold;">${inv.orderNumber || '-'}</td>
          </tr>
        </table>
      </div>

      <!-- Red divider -->
      <div style="margin:0 40px;height:2px;background:#DC2626;"></div>

      <!-- Items table -->
      <div style="padding:20px 40px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:10px 12px;text-align:left;color:#666;font-size:12px;width:30px;">#</th>
              <th style="padding:10px 12px;text-align:left;color:#666;font-size:12px;">Description</th>
              <th style="padding:10px 12px;text-align:right;color:#666;font-size:12px;">Amount (KWD)</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
            ${laborHTML}
          </tbody>
        </table>
      </div>

      <!-- Total -->
      <div style="padding:10px 40px 30px;display:flex;justify-content:flex-end;">
        <div style="background:#DC2626;border-radius:8px;padding:14px 28px;display:flex;align-items:center;gap:20px;min-width:200px;justify-content:space-between;">
          <span style="color:#fff;font-size:14px;font-weight:bold;">TOTAL</span>
          <span style="color:#fff;font-size:22px;font-weight:900;">${formatCurrency(inv.total)}</span>
        </div>
      </div>

      <!-- Footer -->
      <div style="border-top:1px solid #DC2626;margin:0 40px;padding:15px 0;display:flex;justify-content:space-between;">
        <span style="color:#999;font-size:10px;">HOT ROD RACING - HRR | Ford Specialist Workshop</span>
        <span style="color:#999;font-size:10px;">+96550540999 | Kuwait</span>
      </div>
      <div style="text-align:center;padding-bottom:15px;">
        <span style="color:#aaa;font-size:10px;">Thank you for choosing HRR!</span>
      </div>

      <!-- Red bottom bar -->
      <div style="height:8px;background:#DC2626;"></div>
    </div>
  `

  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    })

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
