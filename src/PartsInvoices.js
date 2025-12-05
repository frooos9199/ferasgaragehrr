import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function PartsInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Purchase', // Purchase or Sale
    supplierName: '',
    supplierPhone: '',
    items: [],
    notes: '',
    paid: false,
    paymentMethod: 'Cash'
  });
  const [currentItem, setCurrentItem] = useState({ partName: '', quantity: 1, price: '' });
  const [editingId, setEditingId] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load invoices from Firestore
  useEffect(() => {
    const q = query(collection(db, 'partsInvoices'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invoicesData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setInvoices(invoicesData);
      
      // Auto-generate next invoice number
      if (invoicesData.length > 0 && !editingId) {
        const lastInvoiceNum = invoicesData[0].invoiceNumber || 'INV-000';
        const nextNum = parseInt(lastInvoiceNum.split('-')[1]) + 1;
        setForm(prev => ({ ...prev, invoiceNumber: `INV-${String(nextNum).padStart(3, '0')}` }));
      } else if (invoicesData.length === 0 && !editingId) {
        setForm(prev => ({ ...prev, invoiceNumber: 'INV-001' }));
      }
      
      setLoading(false);
    }, (error) => {
      console.error('Error fetching invoices:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [editingId]);

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const typeMatch = filterType === 'all' || invoice.type === filterType;
    const searchMatch = 
      invoice.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.supplierPhone?.toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && searchMatch;
  });

  function addItem() {
    if (!currentItem.partName || !currentItem.price) {
      alert('⚠️ الرجاء إدخال اسم القطعة والسعر');
      return;
    }

    setForm({
      ...form,
      items: [...form.items, { ...currentItem, price: parseFloat(currentItem.price) }]
    });
    setCurrentItem({ partName: '', quantity: 1, price: '' });
  }

  function removeItem(index) {
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index)
    });
  }

  function calculateTotal() {
    return form.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.items.length === 0) {
      alert('⚠️ الرجاء إضافة قطعة واحدة على الأقل');
      return;
    }

    try {
      const invoiceData = {
        ...form,
        total: calculateTotal(),
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, 'partsInvoices', editingId), invoiceData);
        alert('✅ تم تحديث الفاتورة بنجاح!');
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'partsInvoices'), {
          ...invoiceData,
          createdAt: serverTimestamp()
        });
        alert('✅ تم إضافة الفاتورة بنجاح!');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving invoice:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        name: error.name
      });
      
      if (error.code === 'permission-denied') {
        alert('❌ خطأ في الصلاحيات. تحقق من إعدادات Firestore Security Rules.');
      } else if (error.code === 'unavailable') {
        alert('❌ لا يوجد اتصال بالإنترنت. تحقق من الاتصال.');
      } else {
        alert(`❌ خطأ في حفظ الفاتورة: ${error.message}`);
      }
    }
  }

  function resetForm() {
    const lastInvoiceNum = invoices.length > 0 ? invoices[0].invoiceNumber : 'INV-000';
    const nextNum = parseInt(lastInvoiceNum.split('-')[1]) + 1;
    
    setForm({
      invoiceNumber: `INV-${String(nextNum).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      type: 'Purchase',
      supplierName: '',
      supplierPhone: '',
      items: [],
      notes: '',
      paid: false,
      paymentMethod: 'Cash'
    });
    setCurrentItem({ partName: '', quantity: 1, price: '' });
  }

  function handleEdit(invoice) {
    setForm({
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.date,
      type: invoice.type,
      supplierName: invoice.supplierName,
      supplierPhone: invoice.supplierPhone,
      items: invoice.items || [],
      notes: invoice.notes || '',
      paid: invoice.paid || false,
      paymentMethod: invoice.paymentMethod || 'Cash'
    });
    setEditingId(invoice.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (window.confirm('⚠️ هل أنت متأكد من حذف هذه الفاتورة؟\n\nلا يمكن التراجع عن هذا الإجراء!')) {
      try {
        await deleteDoc(doc(db, 'partsInvoices', id));
        alert('✅ تم حذف الفاتورة بنجاح');
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('❌ خطأ في الحذف. حاول مرة أخرى.');
      }
    }
  }

  function printInvoice(invoice) {
    const printWindow = window.open('', '_blank');
    const total = invoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>فاتورة قطع غيار - ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; direction: rtl; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #00D9FF; padding-bottom: 20px; }
          .header h1 { color: #00D9FF; margin: 0; }
          .header h2 { color: #FF6B00; margin: 5px 0; }
          .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .info-box { flex: 1; padding: 10px; background: #f5f5f5; border-radius: 8px; margin: 0 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
          th { background: linear-gradient(135deg, #00D9FF 0%, #FF6B00 100%); color: white; }
          .total-row { background: #f9f9f9; font-weight: bold; font-size: 1.2em; }
          .footer { margin-top: 30px; text-align: center; color: #666; border-top: 2px solid #ddd; padding-top: 20px; }
          .type-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; color: white; font-weight: bold; }
          .purchase { background: #ef4444; }
          .sale { background: #10b981; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏁 HOT ROD RACING (HRR)</h1>
          <h2>Ford Specialist Garage</h2>
          <p>📞 +965 50540999 | 📍 الشويخ الصناعية، خلف سوق راميز</p>
        </div>

        <div class="info">
          <div class="info-box">
            <strong>رقم الفاتورة:</strong> ${invoice.invoiceNumber}<br>
            <strong>التاريخ:</strong> ${new Date(invoice.date).toLocaleDateString('ar-SA')}<br>
            <strong>النوع:</strong> <span class="type-badge ${invoice.type.toLowerCase()}">${invoice.type === 'Purchase' ? '🛒 شراء' : '💰 بيع'}</span>
          </div>
          <div class="info-box">
            <strong>${invoice.type === 'Purchase' ? 'المورد' : 'العميل'}:</strong> ${invoice.supplierName}<br>
            <strong>الهاتف:</strong> ${invoice.supplierPhone}<br>
            <strong>الدفع:</strong> ${invoice.paid ? '✅ مدفوع' : '⏳ غير مدفوع'} (${invoice.paymentMethod})
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>اسم القطعة</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${item.partName}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toFixed(3)} KD</td>
                <td>${(item.price * item.quantity).toFixed(3)} KD</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="4">الإجمالي الكلي</td>
              <td>${total.toFixed(3)} KD</td>
            </tr>
          </tbody>
        </table>

        ${invoice.notes ? `<div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;"><strong>ملاحظات:</strong> ${invoice.notes}</div>` : ''}

        <div class="footer">
          <p><strong>شكراً لتعاملكم معنا!</strong></p>
          <p style="font-size: 0.9em;">www.q8hrr.com | hot_rod_racing@ | @hotrodracing</p>
        </div>

        <button onclick="window.print()" style="position: fixed; top: 20px; left: 20px; padding: 10px 20px; background: #00D9FF; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
          🖨️ طباعة
        </button>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  function sendWhatsApp(invoice) {
    const total = invoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // تكوين رسالة واتساب
    let message = `*🏁 HOT ROD RACING (HRR)*\n`;
    message += `*Ford Specialist Garage*\n`;
    message += `📞 +965 50540999\n`;
    message += `🌐 www.q8hrr.com\n\n`;
    message += `━━━━━━━━━━━━━━━━\n\n`;
    message += `*📋 فاتورة قطع غيار*\n\n`;
    message += `*رقم الفاتورة:* ${invoice.invoiceNumber}\n`;
    message += `*التاريخ:* ${new Date(invoice.date).toLocaleDateString('ar-SA')}\n`;
    message += `*النوع:* ${invoice.type === 'Purchase' ? '🛒 شراء من مورد' : '💰 بيع لعميل'}\n\n`;
    message += `*${invoice.type === 'Purchase' ? 'المورد' : 'العميل'}:* ${invoice.supplierName}\n`;
    message += `*الهاتف:* ${invoice.supplierPhone}\n\n`;
    message += `━━━━━━━━━━━━━━━━\n\n`;
    message += `*🔧 قطع الغيار:*\n\n`;
    
    invoice.items.forEach((item, idx) => {
      message += `${idx + 1}. *${item.partName}*\n`;
      message += `   الكمية: ${item.quantity} | السعر: ${item.price.toFixed(3)} KD\n`;
      message += `   الإجمالي: ${(item.price * item.quantity).toFixed(3)} KD\n\n`;
    });
    
    message += `━━━━━━━━━━━━━━━━\n\n`;
    message += `*💰 الإجمالي الكلي:* ${total.toFixed(3)} KD\n\n`;
    message += `*حالة الدفع:* ${invoice.paid ? '✅ مدفوع' : '⏳ غير مدفوع'}\n`;
    message += `*طريقة الدفع:* ${invoice.paymentMethod}\n`;
    
    if (invoice.notes) {
      message += `\n*📝 ملاحظات:*\n${invoice.notes}\n`;
    }
    
    message += `\n━━━━━━━━━━━━━━━━\n`;
    message += `شكراً لتعاملكم معنا! 🙏\n`;
    
    // إنشاء رابط واتساب
    const phoneNumber = invoice.supplierPhone.replace(/[^0-9]/g, ''); // إزالة أي أحرف غير رقمية
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // فتح واتساب
    window.open(whatsappUrl, '_blank');
  }

  function exportToExcel() {
    const exportData = filteredInvoices.map(inv => ({
      'رقم الفاتورة': inv.invoiceNumber,
      'التاريخ': new Date(inv.date).toLocaleDateString('ar-SA'),
      'النوع': inv.type === 'Purchase' ? 'شراء' : 'بيع',
      'المورد/العميل': inv.supplierName,
      'الهاتف': inv.supplierPhone,
      'عدد القطع': inv.items.length,
      'الإجمالي': inv.total?.toFixed(3) + ' KD',
      'الدفع': inv.paid ? 'مدفوع' : 'غير مدفوع',
      'طريقة الدفع': inv.paymentMethod
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Parts Invoices');
    XLSX.writeFile(wb, `HRR_Parts_Invoices_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  function exportToPDF() {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('HRR - Parts Invoices', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });

    // Table
    const tableData = filteredInvoices.map(inv => [
      inv.invoiceNumber,
      new Date(inv.date).toLocaleDateString(),
      inv.type,
      inv.supplierName,
      inv.items.length,
      (inv.total || 0).toFixed(3) + ' KD',
      inv.paid ? 'Paid' : 'Unpaid'
    ]);

    doc.autoTable({
      startY: 40,
      head: [['Invoice #', 'Date', 'Type', 'Supplier', 'Items', 'Total', 'Payment']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 217, 255] }
    });

    doc.save(`HRR_Parts_Invoices_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  if (loading) {
    return (
      <main style={{ maxWidth: 1200, margin: '2rem auto', background: 'rgba(26,26,46,0.95)', borderRadius: 18, boxShadow: '0 8px 32px #00D9FF44', padding: '2.5rem 1.5rem', color: '#fff', textAlign: 'center' }}>
        <h2 style={{ color: '#00D9FF', marginTop: '4rem' }}>جاري التحميل...</h2>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1200, margin: '2rem auto', background: 'rgba(26,26,46,0.95)', borderRadius: 18, boxShadow: '0 8px 32px #00D9FF44', padding: '2.5rem 1.5rem', color: '#fff' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#00D9FF', fontWeight: 900, fontSize: '2rem', marginBottom: '0.5rem' }}>
          {editingId ? '✏️ تعديل فاتورة قطع غيار' : '🔧 فواتير قطع الغيار'}
        </h1>
        <p style={{ color: '#FF6B00', fontSize: '1.1rem' }}>إدارة فواتير الشراء والبيع</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #00D9FF 0%, #0ea5e9 100%)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{invoices.length}</div>
          <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>إجمالي الفواتير</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{invoices.filter(i => i.type === 'Purchase').length}</div>
          <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>فواتير شراء</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{invoices.filter(i => i.type === 'Sale').length}</div>
          <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>فواتير بيع</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{invoices.filter(i => !i.paid).length}</div>
          <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>غير مدفوع</div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ color: '#FFD700', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          {editingId ? '✏️ تعديل الفاتورة' : '➕ فاتورة جديدة'}
        </h2>

        {/* Invoice Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#00D9FF' }}>رقم الفاتورة</label>
            <input
              type="text"
              value={form.invoiceNumber}
              onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#00D9FF' }}>التاريخ</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#00D9FF' }}>نوع الفاتورة</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              style={inputStyle}
              required
            >
              <option value="Purchase">🛒 شراء (من مورد)</option>
              <option value="Sale">💰 بيع (لعميل)</option>
            </select>
          </div>
        </div>

        {/* Supplier Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#00D9FF' }}>
              {form.type === 'Purchase' ? 'اسم المورد' : 'اسم العميل'}
            </label>
            <input
              type="text"
              value={form.supplierName}
              onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#00D9FF' }}>رقم الهاتف</label>
            <input
              type="tel"
              value={form.supplierPhone}
              onChange={(e) => setForm({ ...form, supplierPhone: e.target.value })}
              style={inputStyle}
              required
            />
          </div>
        </div>

        {/* Payment Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#00D9FF' }}>طريقة الدفع</label>
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              style={inputStyle}
            >
              <option value="Cash">💵 نقدي</option>
              <option value="K-Net">💳 كي نت</option>
              <option value="Bank Transfer">🏦 تحويل بنكي</option>
              <option value="Credit">📝 آجل</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1.8rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.paid}
                onChange={(e) => setForm({ ...form, paid: e.target.checked })}
                style={{ width: 20, height: 20, cursor: 'pointer' }}
              />
              <span style={{ color: '#FFD700', fontWeight: 'bold' }}>✅ مدفوع</span>
            </label>
          </div>
        </div>

        {/* Add Items */}
        <div style={{ background: 'rgba(0,217,255,0.1)', borderRadius: 10, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#FFD700', marginBottom: '1rem' }}>➕ إضافة قطعة</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr auto', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#00D9FF' }}>اسم القطعة</label>
              <input
                type="text"
                value={currentItem.partName}
                onChange={(e) => setCurrentItem({ ...currentItem, partName: e.target.value })}
                placeholder="مثال: فلتر زيت، بواجي، إلخ"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#00D9FF' }}>الكمية</label>
              <input
                type="number"
                min="1"
                value={currentItem.quantity}
                onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#00D9FF' }}>السعر (KD)</label>
              <input
                type="number"
                step="0.001"
                value={currentItem.price}
                onChange={(e) => setCurrentItem({ ...currentItem, price: e.target.value })}
                placeholder="0.000"
                style={inputStyle}
              />
            </div>
            <button
              type="button"
              onClick={addItem}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0.85rem 1.5rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              ➕ إضافة
            </button>
          </div>
        </div>

        {/* Items List */}
        {form.items.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#FFD700', marginBottom: '1rem' }}>📋 قائمة القطع ({form.items.length})</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #00D9FF 0%, #FF6B00 100%)' }}>
                    <th style={{ padding: '1rem', textAlign: 'right', borderRadius: '8px 0 0 0' }}>#</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>اسم القطعة</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>الكمية</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>السعر</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>الإجمالي</th>
                    <th style={{ padding: '1rem', textAlign: 'center', borderRadius: '0 8px 0 0' }}>حذف</th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((item, idx) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                      <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{idx + 1}</td>
                      <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{item.partName}</td>
                      <td style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{item.quantity}</td>
                      <td style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{item.price.toFixed(3)} KD</td>
                      <td style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold', color: '#FFD700' }}>
                        {(item.price * item.quantity).toFixed(3)} KD
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          style={{
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '0.5rem 1rem',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FF6B00 100%)' }}>
                    <td colSpan="4" style={{ padding: '1rem', fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'right' }}>
                      الإجمالي الكلي:
                    </td>
                    <td colSpan="2" style={{ padding: '1rem', fontWeight: 'bold', fontSize: '1.3rem', textAlign: 'center' }}>
                      {calculateTotal().toFixed(3)} KD
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notes */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#00D9FF' }}>ملاحظات</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="أي ملاحظات إضافية..."
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
          />
        </div>

        {/* Submit Buttons */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            style={{
              flex: 1,
              background: editingId ? 'linear-gradient(90deg, #ffa500 60%, #ff8c00 100%)' : 'linear-gradient(90deg, #00D9FF 60%, #FF6B00 100%)',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              border: 'none',
              borderRadius: 8,
              padding: '1rem 2rem',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,217,255,0.4)'
            }}
          >
            {editingId ? '💾 تحديث الفاتورة' : '✓ حفظ الفاتورة'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                resetForm();
              }}
              style={{
                background: '#6b7280',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                border: 'none',
                borderRadius: 8,
                padding: '1rem 2rem',
                cursor: 'pointer'
              }}
            >
              ✕ إلغاء
            </button>
          )}
        </div>
      </form>

      {/* Filters & Export */}
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="🔍 بحث (رقم الفاتورة، المورد، الهاتف...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={inputStyle}
          >
            <option value="all">جميع الفواتير</option>
            <option value="Purchase">🛒 فواتير شراء فقط</option>
            <option value="Sale">💰 فواتير بيع فقط</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={exportToExcel}
            disabled={filteredInvoices.length === 0}
            style={{
              flex: 1,
              minWidth: 200,
              background: filteredInvoices.length === 0 ? '#666' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '0.9rem',
              cursor: filteredInvoices.length === 0 ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: filteredInvoices.length === 0 ? 0.5 : 1
            }}
          >
            📊 تصدير Excel
          </button>
          <button
            onClick={exportToPDF}
            disabled={filteredInvoices.length === 0}
            style={{
              flex: 1,
              minWidth: 200,
              background: filteredInvoices.length === 0 ? '#666' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '0.9rem',
              cursor: filteredInvoices.length === 0 ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: filteredInvoices.length === 0 ? 0.5 : 1
            }}
          >
            📄 تصدير PDF
          </button>
        </div>
      </div>

      {/* Invoices List */}
      <h2 style={{ color: '#FFD700', marginBottom: '1rem', fontSize: '1.5rem' }}>
        📋 قائمة الفواتير ({filteredInvoices.length})
      </h2>

      {filteredInvoices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
          <h3 style={{ color: '#00D9FF', marginBottom: '0.5rem' }}>لا توجد فواتير</h3>
          <p style={{ color: '#999' }}>ابدأ بإنشاء فاتورة جديدة!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredInvoices.map(invoice => (
            <div
              key={invoice.id}
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 12,
                padding: '1.5rem',
                border: '2px solid rgba(0,217,255,0.3)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00D9FF'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0,217,255,0.3)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ color: '#00D9FF', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                    {invoice.invoiceNumber}
                  </h3>
                  <div style={{ color: '#999', fontSize: '0.9rem' }}>
                    📅 {new Date(invoice.date).toLocaleDateString('ar-SA')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '0.4rem 1rem',
                    borderRadius: 20,
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    background: invoice.type === 'Purchase' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  }}>
                    {invoice.type === 'Purchase' ? '🛒 شراء' : '💰 بيع'}
                  </span>
                  <span style={{
                    padding: '0.4rem 1rem',
                    borderRadius: 20,
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    background: invoice.paid ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  }}>
                    {invoice.paid ? '✅ مدفوع' : '⏳ غير مدفوع'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ color: '#00D9FF', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    {invoice.type === 'Purchase' ? 'المورد' : 'العميل'}
                  </div>
                  <div style={{ fontWeight: 'bold' }}>{invoice.supplierName}</div>
                  <div style={{ color: '#999', fontSize: '0.9rem' }}>📞 {invoice.supplierPhone}</div>
                </div>
                <div>
                  <div style={{ color: '#00D9FF', fontSize: '0.85rem', marginBottom: '0.3rem' }}>عدد القطع</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>{invoice.items?.length || 0}</div>
                </div>
                <div>
                  <div style={{ color: '#00D9FF', fontSize: '0.85rem', marginBottom: '0.3rem' }}>الإجمالي</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#FFD700' }}>
                    {(invoice.total || 0).toFixed(3)} KD
                  </div>
                </div>
                <div>
                  <div style={{ color: '#00D9FF', fontSize: '0.85rem', marginBottom: '0.3rem' }}>طريقة الدفع</div>
                  <div style={{ fontWeight: 'bold' }}>{invoice.paymentMethod}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                <button
                  onClick={() => printInvoice(invoice)}
                  style={{
                    flex: 1,
                    minWidth: 120,
                    background: 'linear-gradient(135deg, #00D9FF 0%, #0ea5e9 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '0.7rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🖨️ طباعة
                </button>
                <button
                  onClick={() => sendWhatsApp(invoice)}
                  style={{
                    flex: 1,
                    minWidth: 120,
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '0.7rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  📱 واتساب
                </button>
                <button
                  onClick={() => handleEdit(invoice)}
                  style={{
                    flex: 1,
                    minWidth: 120,
                    background: 'linear-gradient(135deg, #ffa500 0%, #ff8c00 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '0.7rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  ✏️ تعديل
                </button>
                <button
                  onClick={() => handleDelete(invoice.id)}
                  style={{
                    flex: 1,
                    minWidth: 120,
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '0.7rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🗑️ حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.7rem',
  borderRadius: 8,
  border: '1.5px solid #00D9FF',
  fontSize: '1rem',
  background: 'rgba(255,255,255,0.08)',
  color: '#fff'
};

export default PartsInvoices;
