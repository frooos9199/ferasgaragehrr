import React, { useState, useEffect } from 'react';
import { jobCardFields } from './jobCardData';
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
    make: '',
    model: '',
    year: '',
    specs: '',
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
    setForm({ carNumber: '', vin: '', make: '', model: '', year: '', specs: '', issues: '', fixed: '', notes: '' });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  return (
    <main style={{ maxWidth: 900, margin: '2rem auto', background: 'rgba(26,26,46,0.95)', borderRadius: 18, boxShadow: '0 8px 32px #dc143c44', padding: '2.5rem 1.5rem', color: '#fff' }}>
      <h1 style={{ color: '#dc143c', fontWeight: 900, fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center', letterSpacing: 2 }}>Job Card Admin</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.2rem', marginBottom: '2.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '1.5rem' }}>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
          <input name="carNumber" value={form.carNumber} onChange={handleChange} required placeholder="Car Number" style={inputStyle} />
          <input name="vin" value={form.vin} onChange={handleChange} required placeholder="VIN" style={inputStyle} />
          <input name="make" value={form.make} onChange={handleChange} required placeholder="Make (e.g. Ford)" style={inputStyle} />
          <input name="model" value={form.model} onChange={handleChange} required placeholder="Model (e.g. Mustang)" style={inputStyle} />
          <input name="year" value={form.year} onChange={handleChange} required placeholder="Year" type="number" style={inputStyle} />
          <input name="specs" value={form.specs} onChange={handleChange} placeholder="Specs (e.g. GT, 5.0L V8)" style={inputStyle} />
        </div>
        <textarea name="issues" value={form.issues} onChange={handleChange} placeholder="Issues (comma separated)" style={inputStyle} />
        <textarea name="fixed" value={form.fixed} onChange={handleChange} placeholder="Fixed Issues (comma separated)" style={inputStyle} />
        <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" style={inputStyle} />
        <button type="submit" style={{ background: 'linear-gradient(90deg, #dc143c 60%, #ff1744 100%)', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', border: 'none', borderRadius: 8, padding: '1rem 2.5rem', cursor: 'pointer', marginTop: '0.5rem', boxShadow: '0 2px 8px #dc143c33', letterSpacing: 1 }}>Add Job Card</button>
        {success && <div style={{ color: '#fff', background: '#dc143c', borderRadius: 8, padding: '0.7rem', textAlign: 'center', fontWeight: 'bold' }}>Job Card Added!</div>}
      </form>
      <section>
        <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem' }}>All Job Cards</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {cards.length === 0 && <div style={{ color: '#aaa' }}>No job cards yet.</div>}
          {cards.map(card => (
            <div key={card.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '1.2rem', border: '1.5px solid #dc143c55', color: '#fff' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#dc143c' }}>{card.make} {card.model} ({card.year}) - {card.carNumber}</div>
              <div style={{ fontSize: '0.98rem', margin: '0.3rem 0 0.7rem 0', color: '#fff' }}>VIN: {card.vin}</div>
              <div style={{ fontSize: '0.98rem', color: '#fff' }}>Specs: {card.specs}</div>
              <div style={{ fontSize: '0.98rem', color: '#fff' }}>Issues: {card.issues && card.issues.length ? card.issues.join(', ') : 'None'}</div>
              <div style={{ fontSize: '0.98rem', color: '#fff' }}>Fixed: {card.fixed && card.fixed.length ? card.fixed.join(', ') : 'None'}</div>
              <div style={{ fontSize: '0.98rem', color: '#fff' }}>Notes: {card.notes}</div>
              <div style={{ fontSize: '0.9rem', color: '#aaa', marginTop: '0.5rem' }}>Created: {new Date(card.createdAt).toLocaleString()}</div>
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
