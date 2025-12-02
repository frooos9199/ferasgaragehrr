import React from 'react';
import { useParams } from 'react-router-dom';

function JobCardPublic() {
  const { id } = useParams();
  // Load from localStorage instead of static array
  const saved = localStorage.getItem('jobCards');
  const jobCards = saved ? JSON.parse(saved) : [];
  const card = jobCards.find(c => c.id === id);
  if (!card) return <main style={{ color: '#fff', textAlign: 'center', marginTop: '4rem' }}>Job Card not found.</main>;
  return (
    <main style={{ maxWidth: 600, margin: '2.5rem auto', background: 'rgba(26,26,46,0.97)', borderRadius: 18, boxShadow: '0 8px 32px #dc143c44', padding: '2.5rem 1.5rem', color: '#fff' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <img 
          src="/mustang-parts.png" 
          alt="HRR Logo" 
          style={{ 
            width: 120, 
            borderRadius: '15px',
            border: '2px solid #dc143c',
            padding: '10px',
            background: 'rgba(26,26,46,0.8)',
            boxShadow: '0 10px 30px rgba(220,20,60,0.4)'
          }} 
        />
      </div>
      <h1 style={{ color: '#dc143c', fontWeight: 900, fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center', letterSpacing: 2 }}>Job Card</h1>
      
      {/* Vehicle Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '1.5rem', background: 'rgba(220,20,60,0.1)', borderRadius: '12px', border: '2px solid rgba(220,20,60,0.3)' }}>
        <div style={{ fontWeight: 900, fontSize: '1.8rem', color: '#dc143c', marginBottom: '0.5rem' }}>
          🏎️ Ford {card.model}
        </div>
        <div style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.3rem' }}>{card.year}</div>
        <div style={{ fontSize: '0.95rem', color: '#aaa' }}>
          Plate: <strong style={{ color: '#fff' }}>{card.carNumber}</strong> | VIN: <strong style={{ color: '#fff' }}>{card.vin}</strong>
        </div>
      </div>
      
      {/* Owner Info */}
      <div style={{ fontSize: '0.98rem', color: '#fff', marginBottom: '1.5rem', padding: '1.2rem', background: 'rgba(220,20,60,0.08)', borderRadius: '10px', border: '1px solid rgba(220,20,60,0.25)' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong style={{ color: '#dc143c' }}>👤 Owner:</strong> {card.ownerName}
        </div>
        <div>
          <strong style={{ color: '#dc143c' }}>📞 Phone:</strong> {card.ownerPhone}
        </div>
      </div>
      
      {/* Specs */}
      {card.specs && (
        <div style={{ fontSize: '0.98rem', color: '#fff', marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
          <strong style={{ color: '#dc143c' }}>⚙️ Specifications:</strong><br/>
          {card.specs}
        </div>
      )}
      
      {/* Issues */}
      {card.issues && card.issues.length > 0 && (
        <div style={{ fontSize: '0.98rem', color: '#fff', marginBottom: '1rem', padding: '1rem', background: 'rgba(255,100,100,0.1)', borderRadius: '8px', borderLeft: '4px solid #ff1744' }}>
          <strong style={{ color: '#ff1744' }}>⚠️ Reported Issues:</strong>
          <ul style={{ margin: '0.5rem 0 0 1.2rem', paddingLeft: '0' }}>
            {card.issues.map((issue, idx) => (
              <li key={idx} style={{ marginBottom: '0.3rem' }}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Fixed */}
      {card.fixed && card.fixed.length > 0 && (
        <div style={{ fontSize: '0.98rem', color: '#fff', marginBottom: '1rem', padding: '1rem', background: 'rgba(100,255,100,0.08)', borderRadius: '8px', borderLeft: '4px solid #4ade80' }}>
          <strong style={{ color: '#4ade80' }}>✅ Completed Repairs:</strong>
          <ul style={{ margin: '0.5rem 0 0 1.2rem', paddingLeft: '0' }}>
            {card.fixed.map((fix, idx) => (
              <li key={idx} style={{ marginBottom: '0.3rem' }}>{fix}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Notes */}
      {card.notes && (
        <div style={{ fontSize: '0.98rem', color: '#aaa', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontStyle: 'italic' }}>
          <strong style={{ color: '#dc143c' }}>📝 Notes:</strong><br/>
          {card.notes}
        </div>
      )}
      
      <div style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        Created: {new Date(card.createdAt).toLocaleString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </div>
    </main>
  );
}

export default JobCardPublic;
