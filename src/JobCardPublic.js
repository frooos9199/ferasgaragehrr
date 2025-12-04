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
    <>
      <style>{`
        @media print {
          body { background: white !important; }
          main { background: white !important; box-shadow: none !important; color: black !important; }
          h1, h2, h3, strong { color: #00D9FF !important; }
          .no-print { display: none !important; }
          * { color: black !important; }
        }
      `}</style>
      
      <main style={{ maxWidth: 600, margin: '2.5rem auto', background: 'rgba(26,26,46,0.97)', borderRadius: 18, boxShadow: '0 8px 32px #00D9FF44', padding: '2.5rem 1.5rem', color: '#fff' }}>
      {/* Print Button */}
      <div className="no-print" style={{ textAlign: 'right', marginBottom: '1rem' }}>
        <button
          onClick={() => window.print()}
          style={{
            background: 'linear-gradient(90deg, #3b82f6 60%, #2563eb 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.7rem 1.5rem',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(59,130,246,0.3)'
          }}
        >
          🖨️ Print Job Card
        </button>
      </div>
      
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <img 
          src="/mustang-parts.png" 
          alt="HRR Logo" 
          style={{ 
            width: 120, 
            borderRadius: '15px',
            border: '2px solid #00D9FF',
            padding: '10px',
            background: 'rgba(26,26,46,0.8)',
            boxShadow: '0 10px 30px rgba(220,20,60,0.4)'
          }} 
        />
      </div>
      <h1 style={{ color: '#00D9FF', fontWeight: 900, fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center', letterSpacing: 2 }}>Job Card</h1>
      
      {/* Status Badge */}
      {(() => {
        const statusColors = {
          'Received': '#3b82f6',
          'Diagnosing': '#8b5cf6',
          'Waiting Parts': '#f59e0b',
          'In Progress': '#ec4899',
          'Completed': '#10b981',
          'Delivered': '#6366f1'
        };
        const statusColor = statusColors[card.status] || '#00D9FF';
        return (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '1.5rem',
            background: statusColor + '22',
            border: `3px solid KD {statusColor}`,
            borderRadius: '12px',
            padding: '1rem',
            fontWeight: 900,
            fontSize: '1.2rem',
            color: statusColor,
            letterSpacing: 1
          }}>
            STATUS: {card.status || 'Received'}
          </div>
        );
      })()}
      
      {/* Timeline */}
      {(card.entryDate || card.expectedDelivery) && (
        <div style={{ 
          marginBottom: '1.5rem', 
          padding: '1.2rem', 
          background: 'rgba(59,130,246,0.1)', 
          borderRadius: '10px', 
          border: '2px solid rgba(59,130,246,0.3)' 
        }}>
          {card.entryDate && (
            <div style={{ fontSize: '0.98rem', color: '#fff', marginBottom: card.expectedDelivery ? '0.8rem' : '0' }}>
              <strong style={{ color: '#3b82f6' }}>📅 Entry Date:</strong>{' '}
              {new Date(card.entryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          )}
          {card.expectedDelivery && (
            <div style={{ fontSize: '0.98rem', color: '#fff' }}>
              <strong style={{ color: '#3b82f6' }}>🎯 Expected Delivery:</strong>{' '}
              {new Date(card.expectedDelivery).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              {(() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const delivery = new Date(card.expectedDelivery);
                delivery.setHours(0, 0, 0, 0);
                const daysRemaining = Math.ceil((delivery - today) / (1000 * 60 * 60 * 24));
                
                if (daysRemaining < 0) {
                  return <div style={{ color: '#ff4444', marginTop: '0.5rem', fontWeight: 'bold' }}>⚠️ Delayed by {Math.abs(daysRemaining)} days</div>;
                } else if (daysRemaining === 0) {
                  return <div style={{ color: '#ffa500', marginTop: '0.5rem', fontWeight: 'bold' }}>📍 Ready for pickup TODAY!</div>;
                } else if (daysRemaining === 1) {
                  return <div style={{ color: '#ffa500', marginTop: '0.5rem', fontWeight: 'bold' }}>⏰ Ready TOMORROW</div>;
                } else {
                  return <div style={{ color: '#4ade80', marginTop: '0.5rem' }}>✓ Will be ready in {daysRemaining} days</div>;
                }
              })()}
            </div>
          )}
        </div>
      )}
      
      {/* Vehicle Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '1.5rem', background: 'rgba(220,20,60,0.1)', borderRadius: '12px', border: '2px solid rgba(220,20,60,0.3)' }}>
        <div style={{ fontWeight: 900, fontSize: '1.8rem', color: '#00D9FF', marginBottom: '0.5rem' }}>
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
          <strong style={{ color: '#00D9FF' }}>👤 Owner:</strong> {card.ownerName}
        </div>
        <div>
          <strong style={{ color: '#00D9FF' }}>📞 Phone:</strong> {card.ownerPhone}
        </div>
      </div>
      
      {/* Invoice Summary */}
      {((card.parts && card.parts.length > 0) || card.laborCost > 0 || card.discount > 0) && (
        <div style={{ fontSize: '0.98rem', color: '#fff', marginBottom: '1.5rem', padding: '1.2rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.15))', borderRadius: '10px', border: '2px solid rgba(16,185,129,0.4)' }}>
          <div style={{ fontSize: '1.1rem', color: '#10b981', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
            💰 Invoice Summary
          </div>
          
          {card.parts && card.parts.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '0.5rem' }}>Parts & Materials:</div>
              {card.parts.map((part, idx) => (
                <div key={idx} style={{ fontSize: '0.9rem', color: '#fff', marginLeft: '1rem', marginBottom: '0.3rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{part.name} × {part.qty}</span>
                  <span style={{ color: '#10b981' }}>KD {(part.price * part.qty).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ fontSize: '0.95rem', fontWeight: 'bold', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(16,185,129,0.3)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Parts Total:</span>
                <span style={{ color: '#10b981' }}>KD {card.parts.reduce((sum, p) => sum + (p.price * p.qty), 0).toFixed(2)}</span>
              </div>
            </div>
          )}
          
          {card.laborCost > 0 && (
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span><strong style={{ color: '#10b981' }}>Labor Cost:</strong></span>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>KD {parseFloat(card.laborCost).toFixed(2)}</span>
            </div>
          )}
          
          {card.discount > 0 && (
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#f59e0b' }}>
              <span><strong>Discount:</strong></span>
              <span style={{ fontWeight: 'bold' }}>-KD {parseFloat(card.discount).toFixed(2)}</span>
            </div>
          )}
          
          <div style={{ borderTop: '2px solid rgba(16,185,129,0.5)', marginTop: '1rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
            <span style={{ color: '#10b981' }}>TOTAL:</span>
            <span style={{ color: '#10b981' }}>KD {(() => {
              const partsTotal = card.parts ? card.parts.reduce((sum, p) => sum + (p.price * p.qty), 0) : 0;
              const labor = parseFloat(card.laborCost) || 0;
              const disc = parseFloat(card.discount) || 0;
              return (partsTotal + labor - disc).toFixed(2);
            })()}</span>
          </div>
        </div>
      )}
      
      {/* Specs */}
      {card.specs && (
        <div style={{ fontSize: '0.98rem', color: '#fff', marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
          <strong style={{ color: '#00D9FF' }}>⚙️ Specifications:</strong><br/>
          {card.specs}
        </div>
      )}
      
      {/* Issues */}
      {card.issues && card.issues.length > 0 && (
        <div style={{ fontSize: '0.98rem', color: '#fff', marginBottom: '1rem', padding: '1rem', background: 'rgba(255,100,100,0.1)', borderRadius: '8px', borderLeft: '4px solid #FF6B00' }}>
          <strong style={{ color: '#FF6B00' }}>⚠️ Reported Issues:</strong>
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
          <strong style={{ color: '#00D9FF' }}>📝 Notes:</strong><br/>
          {card.notes}
        </div>
      )}
      
      {/* Image Gallery */}
      {card.images && card.images.length > 0 && (
        <div style={{ marginBottom: '1.5rem', padding: '1.2rem', background: 'rgba(220,20,60,0.08)', borderRadius: '10px', border: '1px solid rgba(220,20,60,0.25)' }}>
          <div style={{ fontSize: '1.1rem', color: '#00D9FF', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
            📸 Vehicle Photos ({card.images.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.8rem' }}>
            {card.images.map((img, idx) => (
              <div 
                key={idx} 
                style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '2px solid rgba(220,20,60,0.4)', cursor: 'pointer', transition: 'transform 0.2s' }}
                onClick={() => window.open(img.data, '_blank')}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img src={img.data} alt={`Photo KD {idx + 1}`} style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }} />
                <div style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', 
                  padding: '0.5rem', 
                  fontSize: '0.75rem', 
                  color: '#fff',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  Photo #{idx + 1}
                  <div style={{ fontSize: '0.65rem', color: '#aaa', marginTop: '0.1rem' }}>
                    {img.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem', color: '#aaa' }}>
            Click any image to view full size
          </div>
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
    </>
  );
}

export default JobCardPublic;
