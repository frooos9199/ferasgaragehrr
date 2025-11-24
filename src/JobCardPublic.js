import React from 'react';
import { jobCards } from './jobCardData';
import { useParams } from 'react-router-dom';

function JobCardPublic() {
  const { id } = useParams();
  const card = jobCards.find(c => c.id === id);
  if (!card) return <main style={{ color: '#fff', textAlign: 'center', marginTop: '4rem' }}>Job Card not found.</main>;
  return (
    <main style={{ maxWidth: 600, margin: '2.5rem auto', background: 'rgba(26,26,46,0.97)', borderRadius: 18, boxShadow: '0 8px 32px #dc143c44', padding: '2.5rem 1.5rem', color: '#fff' }}>
      <h1 style={{ color: '#dc143c', fontWeight: 900, fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center', letterSpacing: 2 }}>Job Card</h1>
      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#dc143c' }}>{card.make} {card.model} ({card.year}) - {card.carNumber}</div>
      <div style={{ fontSize: '0.98rem', margin: '0.3rem 0 0.7rem 0', color: '#fff' }}>VIN: {card.vin}</div>
      <div style={{ fontSize: '0.98rem', color: '#fff' }}>Specs: {card.specs}</div>
      <div style={{ fontSize: '0.98rem', color: '#fff' }}>Issues: {card.issues && card.issues.length ? card.issues.join(', ') : 'None'}</div>
      <div style={{ fontSize: '0.98rem', color: '#fff' }}>Fixed: {card.fixed && card.fixed.length ? card.fixed.join(', ') : 'None'}</div>
      <div style={{ fontSize: '0.98rem', color: '#fff' }}>Notes: {card.notes}</div>
      <div style={{ fontSize: '0.9rem', color: '#aaa', marginTop: '0.5rem' }}>Created: {new Date(card.createdAt).toLocaleString()}</div>
    </main>
  );
}

export default JobCardPublic;
