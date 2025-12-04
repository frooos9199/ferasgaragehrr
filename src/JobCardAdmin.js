import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function JobCardAdmin() {
  // Load cards from localStorage on initial load
  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem('jobCards');
    return saved ? JSON.parse(saved) : [];
  });
  const [form, setForm] = useState({
    carNumber: '',
    vin: '',
    make: 'Ford',
    model: '',
    year: '',
    specs: '',
    ownerName: '',
    ownerPhone: '',
    issues: '',
    fixed: '',
    notes: '',
    status: 'Received',
    entryDate: new Date().toISOString().split('T')[0],
    expectedDelivery: '',
    parts: [],
    laborCost: 0,
    discount: 0,
    images: [], // Array of base64 images
  });
  const [success, setSuccess] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModel, setFilterModel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentPart, setCurrentPart] = useState({ name: '', price: '', qty: 1 });

  // Calculate statistics
  const stats = {
    total: cards.length,
    received: cards.filter(c => c.status === 'Received').length,
    diagnosing: cards.filter(c => c.status === 'Diagnosing').length,
    waitingParts: cards.filter(c => c.status === 'Waiting Parts').length,
    inProgress: cards.filter(c => c.status === 'In Progress').length,
    completed: cards.filter(c => c.status === 'Completed').length,
    delivered: cards.filter(c => c.status === 'Delivered').length,
    byModel: {
      Mustang: cards.filter(c => c.model === 'Mustang').length,
      'F-150': cards.filter(c => c.model === 'F-150').length,
      'F-250': cards.filter(c => c.model === 'F-250').length,
      Shelby: cards.filter(c => c.model === 'Shelby').length,
    }
  };

  // Save to localStorage whenever cards change
  useEffect(() => {
    localStorage.setItem('jobCards', JSON.stringify(cards));
  }, [cards]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    if (editingId) {
      // Update existing card
      const updatedCards = cards.map(card => 
        card.id === editingId 
          ? {
              ...form,
              id: editingId,
              year: Number(form.year),
              issues: form.issues.split(',').map(s => s.trim()).filter(Boolean),
              fixed: form.fixed.split(',').map(s => s.trim()).filter(Boolean),
              createdAt: card.createdAt,
              updatedAt: new Date().toISOString(),
            }
          : card
      );
      setCards(updatedCards);
      setEditingId(null);
    } else {
      // Create new card
      const newCard = {
        ...form,
        id: Date.now().toString(),
        year: Number(form.year),
        issues: form.issues.split(',').map(s => s.trim()).filter(Boolean),
        fixed: form.fixed.split(',').map(s => s.trim()).filter(Boolean),
        createdAt: new Date().toISOString(),
      };
      setCards([newCard, ...cards]);
    }
    
    setForm({ carNumber: '', vin: '', make: 'Ford', model: '', year: '', specs: '', ownerName: '', ownerPhone: '', issues: '', fixed: '', notes: '', status: 'Received', entryDate: new Date().toISOString().split('T')[0], expectedDelivery: '', parts: [], laborCost: 0, discount: 0, images: [] });
    setShowInvoice(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  function handleEdit(card) {
    setForm({
      carNumber: card.carNumber,
      vin: card.vin,
      make: card.make,
      model: card.model,
      year: card.year.toString(),
      specs: card.specs || '',
      ownerName: card.ownerName,
      ownerPhone: card.ownerPhone,
      issues: card.issues ? card.issues.join(', ') : '',
      fixed: card.fixed ? card.fixed.join(', ') : '',
      notes: card.notes || '',
      status: card.status || 'Received',
      entryDate: card.entryDate || new Date().toISOString().split('T')[0],
      expectedDelivery: card.expectedDelivery || '',
      parts: card.parts || [],
      laborCost: card.laborCost || 0,
      discount: card.discount || 0,
      images: card.images || [],
    });
    setEditingId(card.id);
    if (card.parts && card.parts.length > 0) {
      setShowInvoice(true);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setForm({ carNumber: '', vin: '', make: 'Ford', model: '', year: '', specs: '', ownerName: '', ownerPhone: '', issues: '', fixed: '', notes: '', status: 'Received', entryDate: new Date().toISOString().split('T')[0], expectedDelivery: '', parts: [], laborCost: 0, discount: 0, images: [] });
    setEditingId(null);
    setShowInvoice(false);
  }

  function handleDelete(id) {
    if (window.confirm('Are you sure you want to delete this Job Card?')) {
      setCards(cards.filter(card => card.id !== id));
    }
  }

  function addPart() {
    if (currentPart.name && currentPart.price) {
      setForm({
        ...form,
        parts: [...form.parts, { ...currentPart, price: Number(currentPart.price), qty: Number(currentPart.qty) }]
      });
      setCurrentPart({ name: '', price: '', qty: 1 });
    }
  }

  function removePart(index) {
    setForm({
      ...form,
      parts: form.parts.filter((_, i) => i !== index)
    });
  }

  // Handle image upload
  function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    const maxSize = 2 * 1024 * 1024; // 2MB max per image
    const maxImages = 10;

    if (form.images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    files.forEach(file => {
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Max size is 2MB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({
          ...prev,
          images: [...prev.images, { data: reader.result, name: file.name, timestamp: Date.now() }]
        }));
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index) {
    setForm({
      ...form,
      images: form.images.filter((_, i) => i !== index)
    });
  }

  function calculateInvoice() {
    const partsTotal = form.parts.reduce((sum, part) => sum + (part.price * part.qty), 0);
    const laborCost = Number(form.laborCost) || 0;
    const subtotal = partsTotal + laborCost;
    const discount = Number(form.discount) || 0;
    const total = subtotal - discount;
    
    return {
      partsTotal,
      laborCost,
      subtotal,
      discount,
      total
    };
  }

  // Export to Excel
  function exportToExcel() {
    const exportData = filteredCards.map(card => {
      const partsTotal = card.parts ? card.parts.reduce((sum, p) => sum + (p.price * p.qty), 0) : 0;
      const labor = parseFloat(card.laborCost) || 0;
      const disc = parseFloat(card.discount) || 0;
      const total = partsTotal + labor - disc;
      
      return {
        'Car Number': card.carNumber,
        'VIN': card.vin,
        'Make': card.make,
        'Model': card.model,
        'Year': card.year,
        'Status': card.status,
        'Owner Name': card.ownerName,
        'Owner Phone': card.ownerPhone,
        'Entry Date': card.entryDate || '',
        'Expected Delivery': card.expectedDelivery || '',
        'Parts Total': `$${partsTotal.toFixed(2)}`,
        'Labor Cost': `$${labor.toFixed(2)}`,
        'Discount': `$${disc.toFixed(2)}`,
        'Total Amount': `$${total.toFixed(2)}`,
        'Issues': card.issues ? card.issues.join(', ') : '',
        'Fixed': card.fixed ? card.fixed.join(', ') : '',
        'Notes': card.notes || '',
        'Created At': new Date(card.createdAt).toLocaleString()
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Job Cards');
    
    // Auto-size columns
    const maxWidth = exportData.reduce((w, r) => {
      return Object.keys(r).map(k => k.length).reduce((a, b) => Math.max(a, b));
    }, 10);
    ws['!cols'] = Array(Object.keys(exportData[0] || {}).length).fill({ wch: maxWidth });
    
    const fileName = `HRR_JobCards_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  // Export to PDF
  function exportToPDF() {
    const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(220, 20, 60);
    doc.text('HRR Garage - Job Cards Report', 14, 15);
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
    
    // Statistics
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Cards: ${filteredCards.length} | Received: ${stats.received} | In Progress: ${stats.inProgress} | Completed: ${stats.completed}`, 14, 29);
    
    // Table data
    const tableData = filteredCards.map(card => {
      const partsTotal = card.parts ? card.parts.reduce((sum, p) => sum + (p.price * p.qty), 0) : 0;
      const labor = parseFloat(card.laborCost) || 0;
      const disc = parseFloat(card.discount) || 0;
      const total = partsTotal + labor - disc;
      
      return [
        card.carNumber,
        `${card.make} ${card.model}`,
        card.year,
        card.status,
        card.ownerName,
        card.entryDate || '-',
        card.expectedDelivery || '-',
        `$${total.toFixed(2)}`
      ];
    });
    
    doc.autoTable({
      head: [['Car #', 'Vehicle', 'Year', 'Status', 'Owner', 'Entry', 'Delivery', 'Total']],
      body: tableData,
      startY: 35,
      theme: 'striped',
      headStyles: { fillColor: [220, 20, 60], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 15 },
        3: { cellWidth: 30 },
        4: { cellWidth: 35 },
        5: { cellWidth: 25 },
        6: { cellWidth: 25 },
        7: { cellWidth: 20 }
      }
    });
    
    const fileName = `HRR_JobCards_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  return (
    <main style={{ maxWidth: 900, margin: '2rem auto', background: 'rgba(26,26,46,0.95)', borderRadius: 18, boxShadow: '0 8px 32px #dc143c44', padding: '2.5rem 1.5rem', color: '#fff' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <img 
          src="/mustang-parts.png" 
          alt="HRR Logo" 
          style={{ 
            width: 150, 
            borderRadius: '15px',
            border: '2px solid #dc143c',
            padding: '10px',
            background: 'rgba(26,26,46,0.8)',
            boxShadow: '0 10px 30px rgba(220,20,60,0.4)'
          }} 
        />
      </div>
      <h1 style={{ color: '#dc143c', fontWeight: 900, fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center', letterSpacing: 2 }}>
        {editingId ? '✏️ Edit Job Card' : 'Workshop Dashboard'}
      </h1>

      {/* Statistics Dashboard */}
      {!editingId && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '1rem', fontWeight: 700 }}>📊 Statistics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #dc143c 0%, #ff1744 100%)', borderRadius: '12px', padding: '1.2rem', textAlign: 'center', boxShadow: '0 4px 12px rgba(220,20,60,0.3)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>{stats.total}</div>
              <div style={{ fontSize: '0.9rem', color: '#fff', marginTop: '0.3rem', fontWeight: 600 }}>Total Cars</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '12px', padding: '1.2rem', textAlign: 'center', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>{stats.received}</div>
              <div style={{ fontSize: '0.9rem', color: '#fff', marginTop: '0.3rem', fontWeight: 600 }}>Received</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', borderRadius: '12px', padding: '1.2rem', textAlign: 'center', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>{stats.diagnosing}</div>
              <div style={{ fontSize: '0.9rem', color: '#fff', marginTop: '0.3rem', fontWeight: 600 }}>Diagnosing</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '12px', padding: '1.2rem', textAlign: 'center', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>{stats.waitingParts}</div>
              <div style={{ fontSize: '0.9rem', color: '#fff', marginTop: '0.3rem', fontWeight: 600 }}>Waiting Parts</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', borderRadius: '12px', padding: '1.2rem', textAlign: 'center', boxShadow: '0 4px 12px rgba(236,72,153,0.3)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>{stats.inProgress}</div>
              <div style={{ fontSize: '0.9rem', color: '#fff', marginTop: '0.3rem', fontWeight: 600 }}>In Progress</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '12px', padding: '1.2rem', textAlign: 'center', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>{stats.completed}</div>
              <div style={{ fontSize: '0.9rem', color: '#fff', marginTop: '0.3rem', fontWeight: 600 }}>Completed</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', borderRadius: '12px', padding: '1.2rem', textAlign: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>{stats.delivered}</div>
              <div style={{ fontSize: '0.9rem', color: '#fff', marginTop: '0.3rem', fontWeight: 600 }}>Delivered</div>
            </div>
          </div>

          {/* Models Statistics */}
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.8rem', fontWeight: 700 }}>🏎️ By Model</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
            {Object.entries(stats.byModel).map(([model, count]) => (
              <div key={model} style={{ background: 'rgba(220,20,60,0.1)', border: '2px solid rgba(220,20,60,0.3)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#dc143c' }}>{count}</div>
                <div style={{ fontSize: '0.9rem', color: '#fff', marginTop: '0.3rem' }}>{model}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {editingId && (
        <div style={{ 
          background: 'rgba(255,165,0,0.1)', 
          border: '2px solid rgba(255,165,0,0.5)',
          borderRadius: '10px',
          padding: '1rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
          color: '#ffa500',
          fontWeight: 'bold'
        }}>
          ⚠️ Editing Mode - Update the form below
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.2rem', marginBottom: '2.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '1.5rem' }}>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
          <input name="carNumber" value={form.carNumber} onChange={handleChange} required placeholder="Car Number" style={inputStyle} />
          <input name="vin" value={form.vin} onChange={handleChange} required placeholder="VIN" style={inputStyle} />
          
          {/* Ford Model Dropdown */}
          <div style={{ gridColumn: '1 / -1', display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 2fr' }}>
            <select name="model" value={form.model} onChange={handleChange} required style={{...inputStyle, cursor: 'pointer'}}>
              <option value="">Select Model</option>
              <option value="Mustang">Mustang</option>
              <option value="F-150">F-150</option>
              <option value="F-250">F-250</option>
              <option value="Shelby">Shelby</option>
            </select>
            <input name="specs" value={form.specs} onChange={handleChange} placeholder="Specs (e.g. GT 5.0L V8, Premium, Lariat...)" style={inputStyle} />
          </div>
          
          <input name="year" value={form.year} onChange={handleChange} required placeholder="Year" type="number" min="1960" max="2026" style={inputStyle} />
          
          {/* Status Dropdown */}
          <select name="status" value={form.status} onChange={handleChange} required style={{...inputStyle, cursor: 'pointer'}}>
            <option value="Received">🔵 Received</option>
            <option value="Diagnosing">🔍 Diagnosing</option>
            <option value="Waiting Parts">⏳ Waiting Parts</option>
            <option value="In Progress">🔧 In Progress</option>
            <option value="Completed">✅ Completed</option>
            <option value="Delivered">📦 Delivered</option>
          </select>
          
          <input name="ownerName" value={form.ownerName} onChange={handleChange} required placeholder="Owner Name" style={inputStyle} />
          <input name="ownerPhone" value={form.ownerPhone} onChange={handleChange} required placeholder="Owner Phone" type="tel" style={inputStyle} />
          
          {/* Timeline Fields */}
          <input name="entryDate" value={form.entryDate} onChange={handleChange} required type="date" style={inputStyle} title="Entry Date" />
          <input name="expectedDelivery" value={form.expectedDelivery} onChange={handleChange} type="date" style={inputStyle} placeholder="Expected Delivery" title="Expected Delivery Date" />
        </div>
        <textarea name="issues" value={form.issues} onChange={handleChange} placeholder="Issues (e.g. Engine noise, Brake worn, Check engine light...)" style={{...inputStyle, minHeight: '80px'}} rows="3" />
        <textarea name="fixed" value={form.fixed} onChange={handleChange} placeholder="Fixed (e.g. Oil change completed, New brake pads, Spark plugs replaced...)" style={{...inputStyle, minHeight: '80px'}} rows="3" />
        <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Additional Notes (Optional)" style={{...inputStyle, minHeight: '60px'}} rows="2" />
        
        {/* Invoice Section Toggle */}
        <div style={{ marginTop: '1rem' }}>
          <button
            type="button"
            onClick={() => setShowInvoice(!showInvoice)}
            style={{
              width: '100%',
              background: 'rgba(16,185,129,0.2)',
              border: '2px solid rgba(16,185,129,0.5)',
              color: '#10b981',
              padding: '0.8rem',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            {showInvoice ? '📋 Hide Invoice' : '💰 Add Invoice / Pricing'}
          </button>
        </div>

        {/* Invoice Section */}
        {showInvoice && (
          <div style={{ 
            background: 'rgba(16,185,129,0.05)', 
            border: '2px solid rgba(16,185,129,0.3)', 
            borderRadius: '12px', 
            padding: '1.5rem',
            marginTop: '1rem'
          }}>
            <h3 style={{ color: '#10b981', marginBottom: '1rem', fontSize: '1.2rem' }}>💰 Invoice & Pricing</h3>
            
            {/* Add Parts */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.5rem', display: 'block', fontWeight: 'bold' }}>
                Parts & Materials
              </label>
              <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: '2fr 1fr 1fr auto' }}>
                <input
                  type="text"
                  placeholder="Part name"
                  value={currentPart.name}
                  onChange={(e) => setCurrentPart({ ...currentPart, name: e.target.value })}
                  style={inputStyle}
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={currentPart.price}
                  onChange={(e) => setCurrentPart({ ...currentPart, price: e.target.value })}
                  style={inputStyle}
                  min="0"
                  step="0.01"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={currentPart.qty}
                  onChange={(e) => setCurrentPart({ ...currentPart, qty: e.target.value })}
                  style={inputStyle}
                  min="1"
                />
                <button
                  type="button"
                  onClick={addPart}
                  style={{
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.8rem 1.2rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  ➕
                </button>
              </div>

              {/* Parts List */}
              {form.parts.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  {form.parts.map((part, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.05)', 
                      padding: '0.8rem', 
                      borderRadius: '8px',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{ flex: 1, color: '#fff' }}>
                        <strong>{part.name}</strong> - ${part.price} × {part.qty}
                      </div>
                      <div style={{ color: '#10b981', fontWeight: 'bold', marginRight: '1rem' }}>
                        ${(part.price * part.qty).toFixed(2)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removePart(index)}
                        style={{
                          background: '#dc143c',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.4rem 0.8rem',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Labor & Discount */}
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>
                  Labor Cost ($)
                </label>
                <input
                  type="number"
                  name="laborCost"
                  value={form.laborCost}
                  onChange={handleChange}
                  placeholder="0.00"
                  style={inputStyle}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>
                  Discount ($)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={form.discount}
                  onChange={handleChange}
                  placeholder="0.00"
                  style={inputStyle}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Invoice Summary */}
            {(form.parts.length > 0 || form.laborCost > 0) && (
              <div style={{ 
                marginTop: '1.5rem', 
                padding: '1rem', 
                background: 'rgba(16,185,129,0.1)', 
                borderRadius: '8px',
                border: '2px solid rgba(16,185,129,0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#fff' }}>
                  <span>Parts Total:</span>
                  <span>${calculateInvoice().partsTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#fff' }}>
                  <span>Labor:</span>
                  <span>${calculateInvoice().laborCost.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#fff' }}>
                  <span>Subtotal:</span>
                  <span>${calculateInvoice().subtotal.toFixed(2)}</span>
                </div>
                {form.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#ffa500' }}>
                    <span>Discount:</span>
                    <span>-${calculateInvoice().discount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  paddingTop: '0.5rem', 
                  borderTop: '2px solid rgba(16,185,129,0.5)',
                  marginTop: '0.5rem',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#10b981'
                }}>
                  <span>TOTAL:</span>
                  <span>${calculateInvoice().total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Image Upload Section */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#dc143c', fontSize: '1rem' }}>
            📸 Vehicle Photos (Max 10 images, 2MB each)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: 8,
              border: '2px dashed #dc143c',
              background: 'rgba(220,20,60,0.05)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          />
          {form.images.length > 0 && (
            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.8rem' }}>
              {form.images.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '2px solid rgba(220,20,60,0.3)' }}>
                  <img src={img.data} alt={`Upload ${idx + 1}`} style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      background: '#dc143c',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                  <div style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    background: 'rgba(0,0,0,0.7)', 
                    padding: '0.2rem', 
                    fontSize: '0.7rem', 
                    color: '#fff',
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {img.name}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#aaa' }}>
            {form.images.length}/10 images uploaded
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <button type="submit" style={{ 
            flex: 1,
            background: editingId ? 'linear-gradient(90deg, #ffa500 60%, #ff8c00 100%)' : 'linear-gradient(90deg, #dc143c 60%, #ff1744 100%)', 
            color: '#fff', 
            fontWeight: 'bold', 
            fontSize: '1.1rem', 
            border: 'none', 
            borderRadius: 8, 
            padding: '1rem 2.5rem', 
            cursor: 'pointer', 
            boxShadow: '0 4px 16px rgba(220,20,60,0.4)', 
            letterSpacing: 1, 
            transition: 'all 0.3s' 
          }}>
            {editingId ? '💾 Update Job Card' : '✓ Create Job Card'}
          </button>
          
          {editingId && (
            <button 
              type="button"
              onClick={handleCancelEdit}
              style={{ 
                background: 'rgba(128,128,128,0.2)', 
                color: '#aaa', 
                fontWeight: 'bold', 
                fontSize: '1.1rem', 
                border: '2px solid rgba(128,128,128,0.5)', 
                borderRadius: 8, 
                padding: '1rem 2rem', 
                cursor: 'pointer', 
                letterSpacing: 1, 
                transition: 'all 0.3s' 
              }}
            >
              ✕ Cancel
            </button>
          )}
        </div>
        
        {success && <div style={{ color: '#fff', background: editingId ? '#ffa500' : '#dc143c', borderRadius: 8, padding: '0.7rem', textAlign: 'center', fontWeight: 'bold' }}>
          {editingId ? 'Job Card Updated!' : 'Job Card Added!'}
        </div>}
      </form>
      
      {/* Search & Filter Section */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>🔍 Search & Filter</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={exportToExcel}
              disabled={filteredCards.length === 0}
              style={{
                background: filteredCards.length === 0 ? '#555' : 'linear-gradient(135deg, #059669, #10b981)',
                color: '#fff',
                border: 'none',
                padding: '0.6rem 1.2rem',
                borderRadius: 8,
                fontWeight: 'bold',
                cursor: filteredCards.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                fontSize: '0.9rem',
                opacity: filteredCards.length === 0 ? 0.5 : 1
              }}
              onMouseOver={(e) => filteredCards.length > 0 && (e.target.style.transform = 'scale(1.05)')}
              onMouseOut={(e) => (e.target.style.transform = 'scale(1)')}
            >
              � Export Excel
            </button>
            <button
              onClick={exportToPDF}
              disabled={filteredCards.length === 0}
              style={{
                background: filteredCards.length === 0 ? '#555' : 'linear-gradient(135deg, #dc143c, #ff1744)',
                color: '#fff',
                border: 'none',
                padding: '0.6rem 1.2rem',
                borderRadius: 8,
                fontWeight: 'bold',
                cursor: filteredCards.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                fontSize: '0.9rem',
                opacity: filteredCards.length === 0 ? 0.5 : 1
              }}
              onMouseOver={(e) => filteredCards.length > 0 && (e.target.style.transform = 'scale(1.05)')}
              onMouseOut={(e) => (e.target.style.transform = 'scale(1)')}
            >
              📄 Export PDF
            </button>
          </div>
        </div>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '2fr 1fr 1fr' }}>
          <input
            type="text"
            placeholder="Search by car number, owner name, VIN, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
          />
          <select value={filterModel} onChange={(e) => setFilterModel(e.target.value)} style={{...inputStyle, cursor: 'pointer'}}>
            <option value="all">All Models</option>
            <option value="Mustang">Mustang</option>
            <option value="F-150">F-150</option>
            <option value="F-250">F-250</option>
            <option value="Shelby">Shelby</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{...inputStyle, cursor: 'pointer'}}>
            <option value="all">All Status</option>
            <option value="Received">🔵 Received</option>
            <option value="Diagnosing">🔍 Diagnosing</option>
            <option value="Waiting Parts">⏳ Waiting Parts</option>
            <option value="In Progress">🔧 In Progress</option>
            <option value="Completed">✅ Completed</option>
            <option value="Delivered">📦 Delivered</option>
          </select>
        </div>
      </div>
      
      <section>
        <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem' }}>
          All Job Cards {(() => {
            const filtered = cards.filter(card => {
              const matchesSearch = 
                card.carNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                card.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                card.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                card.ownerPhone.includes(searchTerm);
              const matchesModel = filterModel === 'all' || card.model === filterModel;
              const matchesStatus = filterStatus === 'all' || card.status === filterStatus;
              return matchesSearch && matchesModel && matchesStatus;
            });
            return filtered.length !== cards.length ? `(${filtered.length} of ${cards.length})` : `(${cards.length})`;
          })()}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {cards.filter(card => {
            const matchesSearch = 
              card.carNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
              card.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              card.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
              card.ownerPhone.includes(searchTerm);
            const matchesModel = filterModel === 'all' || card.model === filterModel;
            const matchesStatus = filterStatus === 'all' || card.status === filterStatus;
            return matchesSearch && matchesModel && matchesStatus;
          }).length === 0 && <div style={{ color: '#aaa', textAlign: 'center', padding: '2rem' }}>
            {cards.length === 0 ? 'No job cards yet.' : 'No matching job cards found.'}
          </div>}
          {cards.filter(card => {
            const matchesSearch = 
              card.carNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
              card.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              card.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
              card.ownerPhone.includes(searchTerm);
            const matchesModel = filterModel === 'all' || card.model === filterModel;
            const matchesStatus = filterStatus === 'all' || card.status === filterStatus;
            return matchesSearch && matchesModel && matchesStatus;
          }).map(card => {
            // Status color mapping
            const statusColors = {
              'Received': '#3b82f6',
              'Diagnosing': '#8b5cf6',
              'Waiting Parts': '#f59e0b',
              'In Progress': '#ec4899',
              'Completed': '#10b981',
              'Delivered': '#6366f1'
            };
            const statusColor = statusColors[card.status] || '#dc143c';
            
            return (
            <div key={card.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '1.5rem', border: '1.5px solid #dc143c55', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900, fontSize: '1.3rem', color: '#dc143c', marginBottom: '0.3rem' }}>
                    🏎️ Ford {card.model} {card.year}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#aaa' }}>Plate: {card.carNumber} | VIN: {card.vin}</div>
                </div>
                <div style={{ 
                  background: statusColor + '33', 
                  border: `2px solid ${statusColor}`, 
                  borderRadius: '8px', 
                  padding: '0.5rem 1rem', 
                  fontWeight: 'bold', 
                  fontSize: '0.85rem',
                  color: statusColor,
                  whiteSpace: 'nowrap'
                }}>
                  {card.status || 'Received'}
                </div>
              </div>
              
              {/* Timeline Info */}
              {(card.entryDate || card.expectedDelivery) && (
                <div style={{ 
                  background: 'rgba(59,130,246,0.1)', 
                  borderLeft: '3px solid #3b82f6', 
                  padding: '0.8rem', 
                  marginBottom: '1rem', 
                  borderRadius: '4px' 
                }}>
                  {card.entryDate && (
                    <div style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#3b82f6' }}>📅 Entry:</strong> {new Date(card.entryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      {(() => {
                        const days = Math.floor((new Date() - new Date(card.entryDate)) / (1000 * 60 * 60 * 24));
                        return days > 0 ? <span style={{ color: '#aaa', marginLeft: '0.5rem' }}>({days} days ago)</span> : null;
                      })()}
                    </div>
                  )}
                  {card.expectedDelivery && (
                    <div style={{ fontSize: '0.95rem', color: '#fff' }}>
                      <strong style={{ color: '#3b82f6' }}>🎯 Expected:</strong> {new Date(card.expectedDelivery).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      {(() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const delivery = new Date(card.expectedDelivery);
                        delivery.setHours(0, 0, 0, 0);
                        const daysRemaining = Math.ceil((delivery - today) / (1000 * 60 * 60 * 24));
                        
                        if (daysRemaining < 0) {
                          return <span style={{ color: '#ff4444', marginLeft: '0.5rem', fontWeight: 'bold' }}>⚠️ OVERDUE by {Math.abs(daysRemaining)} days!</span>;
                        } else if (daysRemaining === 0) {
                          return <span style={{ color: '#ffa500', marginLeft: '0.5rem', fontWeight: 'bold' }}>📍 TODAY</span>;
                        } else if (daysRemaining === 1) {
                          return <span style={{ color: '#ffa500', marginLeft: '0.5rem', fontWeight: 'bold' }}>⏰ TOMORROW</span>;
                        } else if (daysRemaining <= 3) {
                          return <span style={{ color: '#ffa500', marginLeft: '0.5rem' }}>⏳ {daysRemaining} days left</span>;
                        } else {
                          return <span style={{ color: '#4ade80', marginLeft: '0.5rem' }}>✓ {daysRemaining} days left</span>;
                        }
                      })()}
                    </div>
                  )}
                </div>
              )}
              
              {/* Owner Info */}
              <div style={{ background: 'rgba(220,20,60,0.1)', borderLeft: '3px solid #dc143c', padding: '0.8rem', marginBottom: '1rem', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.95rem', color: '#fff' }}>
                  <strong style={{ color: '#dc143c' }}>👤 Owner:</strong> {card.ownerName}
                </div>
                <div style={{ fontSize: '0.95rem', color: '#fff' }}>
                  <strong style={{ color: '#dc143c' }}>📞 Phone:</strong> {card.ownerPhone}
                </div>
              </div>
              
              {/* Invoice Summary */}
              {(card.parts && card.parts.length > 0) || card.laborCost > 0 || card.discount > 0 ? (
                <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.15))', borderLeft: '3px solid #10b981', padding: '0.8rem', marginBottom: '1rem', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.95rem', color: '#10b981', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    💰 Invoice Summary
                  </div>
                  {card.parts && card.parts.length > 0 && (
                    <div style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '0.3rem' }}>
                      <strong style={{ color: '#10b981' }}>Parts:</strong> ${card.parts.reduce((sum, p) => sum + (p.price * p.qty), 0).toFixed(2)}
                      <span style={{ marginLeft: '0.5rem', color: '#9ca3af', fontSize: '0.8rem' }}>
                        ({card.parts.length} item{card.parts.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                  )}
                  {card.laborCost > 0 && (
                    <div style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '0.3rem' }}>
                      <strong style={{ color: '#10b981' }}>Labor:</strong> ${parseFloat(card.laborCost).toFixed(2)}
                    </div>
                  )}
                  {card.discount > 0 && (
                    <div style={{ fontSize: '0.85rem', color: '#f59e0b', marginBottom: '0.3rem' }}>
                      <strong>Discount:</strong> -${parseFloat(card.discount).toFixed(2)}
                    </div>
                  )}
                  <div style={{ borderTop: '1px solid rgba(16,185,129,0.3)', marginTop: '0.5rem', paddingTop: '0.5rem', fontSize: '0.95rem', color: '#10b981', fontWeight: 'bold' }}>
                    TOTAL: ${(() => {
                      const partsTotal = card.parts ? card.parts.reduce((sum, p) => sum + (p.price * p.qty), 0) : 0;
                      const labor = parseFloat(card.laborCost) || 0;
                      const disc = parseFloat(card.discount) || 0;
                      return (partsTotal + labor - disc).toFixed(2);
                    })()}
                  </div>
                </div>
              ) : null}
              
              {/* Specs */}
              {card.specs && (
                <div style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.8rem' }}>
                  <strong style={{ color: '#dc143c' }}>⚙️ Specs:</strong> {card.specs}
                </div>
              )}
              
              {/* Issues */}
              {card.issues && card.issues.length > 0 && (
                <div style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.8rem' }}>
                  <strong style={{ color: '#ff1744' }}>⚠️ Issues:</strong> {card.issues.join(', ')}
                </div>
              )}
              
              {/* Fixed */}
              {card.fixed && card.fixed.length > 0 && (
                <div style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.8rem' }}>
                  <strong style={{ color: '#4ade80' }}>✅ Fixed:</strong> {card.fixed.join(', ')}
                </div>
              )}
              
              {/* Notes */}
              {card.notes && (
                <div style={{ fontSize: '0.95rem', color: '#aaa', marginBottom: '1rem', fontStyle: 'italic' }}>
                  📝 {card.notes}
                </div>
              )}
              
              {/* Image Gallery */}
              {card.images && card.images.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.95rem', color: '#dc143c', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    📸 Vehicle Photos ({card.images.length})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
                    {card.images.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '2px solid rgba(220,20,60,0.3)', cursor: 'pointer' }}
                        onClick={() => window.open(img.data, '_blank')}
                      >
                        <img src={img.data} alt={`Photo ${idx + 1}`} style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
                        <div style={{ 
                          position: 'absolute', 
                          bottom: 0, 
                          left: 0, 
                          right: 0, 
                          background: 'rgba(0,0,0,0.7)', 
                          padding: '0.2rem', 
                          fontSize: '0.7rem', 
                          color: '#fff',
                          textAlign: 'center'
                        }}>
                          #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                Created: {new Date(card.createdAt).toLocaleString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
                {card.updatedAt && (
                  <span style={{ marginLeft: '1rem', color: '#ffa500' }}>
                    | Updated: {new Date(card.updatedAt).toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                )}
              </div>
              
              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => window.open(`/jobcard/${card.id}`, '_blank')}
                  style={{
                    flex: '1',
                    minWidth: '120px',
                    background: 'linear-gradient(90deg, #3b82f6 60%, #2563eb 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.7rem 1.2rem',
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  🖨️ Print
                </button>
                
                <button
                  onClick={() => handleEdit(card)}
                  style={{
                    flex: '1',
                    minWidth: '120px',
                    background: 'linear-gradient(90deg, #ffa500 60%, #ff8c00 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.7rem 1.2rem',
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(255,165,0,0.3)',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  ✏️ Edit
                </button>
                
                <button
                  onClick={() => handleDelete(card.id)}
                  style={{
                    flex: '1',
                    minWidth: '120px',
                    background: 'linear-gradient(90deg, #dc143c 60%, #ff1744 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.7rem 1.2rem',
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(220,20,60,0.3)',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  🗑️ Delete
                </button>
              </div>
              
              <div style={{ marginTop: '0.7rem' }}>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.98rem' }}>QR Code:</span>
                <div style={{ background: '#fff', display: 'inline-block', padding: 6, borderRadius: 8, marginLeft: 10 }}>
                  <QRCodeSVG value={window.location.origin + '/jobcard/' + card.id} size={64} fgColor="#dc143c" bgColor="#fff" />
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.7rem',
  borderRadius: 8,
  border: '1.5px solid #dc143c',
  fontSize: '1rem',
  background: 'rgba(255,255,255,0.08)',
  color: '#fff',
  marginBottom: '0.2rem',
};

export default JobCardAdmin;
