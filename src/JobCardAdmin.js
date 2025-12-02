import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

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
  });
  const [success, setSuccess] = useState(false);

  // Save to localStorage whenever cards change
  useEffect(() => {
    localStorage.setItem('jobCards', JSON.stringify(cards));
  }, [cards]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newCard = {
      ...form,
      id: Date.now().toString(),
      year: Number(form.year),
      issues: form.issues.split(',').map(s => s.trim()).filter(Boolean),
      fixed: form.fixed.split(',').map(s => s.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };
    setCards([newCard, ...cards]);
    setForm({ carNumber: '', vin: '', make: 'Ford', model: '', year: '', specs: '', ownerName: '', ownerPhone: '', issues: '', fixed: '', notes: '' });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
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
      <h1 style={{ color: '#dc143c', fontWeight: 900, fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center', letterSpacing: 2 }}>Job Card Admin</h1>
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
          <input name="ownerName" value={form.ownerName} onChange={handleChange} required placeholder="Owner Name" style={inputStyle} />
          <input name="ownerPhone" value={form.ownerPhone} onChange={handleChange} required placeholder="Owner Phone" type="tel" style={inputStyle} />
        </div>
        <textarea name="issues" value={form.issues} onChange={handleChange} placeholder="Issues (e.g. Engine noise, Brake worn, Check engine light...)" style={{...inputStyle, minHeight: '80px'}} rows="3" />
        <textarea name="fixed" value={form.fixed} onChange={handleChange} placeholder="Fixed (e.g. Oil change completed, New brake pads, Spark plugs replaced...)" style={{...inputStyle, minHeight: '80px'}} rows="3" />
        <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Additional Notes (Optional)" style={{...inputStyle, minHeight: '60px'}} rows="2" />
        <button type="submit" style={{ background: 'linear-gradient(90deg, #dc143c 60%, #ff1744 100%)', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', border: 'none', borderRadius: 8, padding: '1rem 2.5rem', cursor: 'pointer', marginTop: '0.5rem', boxShadow: '0 4px 16px rgba(220,20,60,0.4)', letterSpacing: 1, transition: 'all 0.3s' }}>✓ Create Job Card</button>
        {success && <div style={{ color: '#fff', background: '#dc143c', borderRadius: 8, padding: '0.7rem', textAlign: 'center', fontWeight: 'bold' }}>Job Card Added!</div>}
      </form>
      <section>
        <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem' }}>All Job Cards</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {cards.length === 0 && <div style={{ color: '#aaa' }}>No job cards yet.</div>}
          {cards.map(card => (
            <div key={card.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '1.5rem', border: '1.5px solid #dc143c55', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1.3rem', color: '#dc143c', marginBottom: '0.3rem' }}>
                    🏎️ Ford {card.model} {card.year}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#aaa' }}>Plate: {card.carNumber} | VIN: {card.vin}</div>
                </div>
              </div>
              
              {/* Owner Info */}
              <div style={{ background: 'rgba(220,20,60,0.1)', borderLeft: '3px solid #dc143c', padding: '0.8rem', marginBottom: '1rem', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.95rem', color: '#fff' }}>
                  <strong style={{ color: '#dc143c' }}>👤 Owner:</strong> {card.ownerName}
                </div>
                <div style={{ fontSize: '0.95rem', color: '#fff' }}>
                  <strong style={{ color: '#dc143c' }}>📞 Phone:</strong> {card.ownerPhone}
                </div>
              </div>
              
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
              
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                Created: {new Date(card.createdAt).toLocaleString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div style={{ marginTop: '0.7rem' }}>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.98rem' }}>QR Code:</span>
                <div style={{ background: '#fff', display: 'inline-block', padding: 6, borderRadius: 8, marginLeft: 10 }}>
                  <QRCodeSVG value={window.location.origin + '/jobcard/' + card.id} size={64} fgColor="#dc143c" bgColor="#fff" />
                </div>
              </div>
            </div>
          ))}
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
