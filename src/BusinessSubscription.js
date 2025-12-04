import React, { useState } from 'react';

function BusinessSubscription() {
  const [form, setForm] = useState({ company: '', contact: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    // Send form data to a serverless endpoint or backend that will forward to summit_kw@hotmail.com
    // Example using fetch (replace URL with your actual endpoint):
    try {
      await fetch('https://formspree.io/f/mwkgyyqg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: form.company,
          contact: form.contact,
          email: form.email,
          message: form.message
        })
      });
    } catch (err) {
      // Optionally handle error
    }
  }

  return (
    <main style={{ 
      maxWidth: 700, 
      margin: '2.5rem auto', 
      background: 'linear-gradient(135deg, rgba(26,26,46,0.9) 0%, rgba(10,10,10,0.95) 100%)', 
      borderRadius: 20, 
      boxShadow: '0 10px 40px rgba(220,20,60,0.3)', 
      padding: '2.5rem 1.5rem',
      border: '2px solid rgba(220,20,60,0.3)',
      color: '#fff'
    }}>
      <h1 style={{ 
        color: '#00D9FF', 
        fontWeight: 'bold', 
        fontSize: '2.2rem', 
        marginBottom: '1.5rem', 
        textAlign: 'center',
        textShadow: '0 0 20px rgba(220,20,60,0.5)',
        letterSpacing: '1px'
      }}>
        Business Partnership / Company Subscription
      </h1>
      <p style={{ 
        color: '#ddd', 
        fontSize: '1.1rem', 
        marginBottom: '1.5rem', 
        textAlign: 'center',
        lineHeight: '1.6'
      }}>
        If you are a company or official organization interested in Ford programming, please fill out the form below. We will contact you as soon as possible.
      </p>
      {submitted ? (
        <div style={{ 
          color: '#00D9FF', 
          fontWeight: 'bold', 
          fontSize: '1.2rem', 
          textAlign: 'center', 
          margin: '2rem 0',
          padding: '2rem',
          background: 'rgba(220,20,60,0.1)',
          borderRadius: '15px',
          border: '2px solid rgba(220,20,60,0.3)'
        }}>
          ✅ Thank you for your request! We will contact you soon.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div>
            <label style={{ fontWeight: 'bold', color: '#00D9FF', fontSize: '1.05rem' }}>Company/Organization Name:</label><br />
            <input 
              name="company" 
              type="text" 
              value={form.company} 
              onChange={handleChange} 
              required 
              style={{ 
                width: '100%', 
                padding: '0.9rem', 
                borderRadius: 10, 
                border: '2px solid rgba(220,20,60,0.3)', 
                fontSize: '1rem',
                background: 'rgba(26,26,46,0.5)',
                color: '#fff',
                transition: 'all 0.3s'
              }} 
            />
          </div>
          <div>
            <label style={{ fontWeight: 'bold', color: '#00D9FF', fontSize: '1.05rem' }}>Contact Person:</label><br />
            <input 
              name="contact" 
              type="text" 
              value={form.contact} 
              onChange={handleChange} 
              required 
              style={{ 
                width: '100%', 
                padding: '0.9rem', 
                borderRadius: 10, 
                border: '2px solid rgba(220,20,60,0.3)', 
                fontSize: '1rem',
                background: 'rgba(26,26,46,0.5)',
                color: '#fff',
                transition: 'all 0.3s'
              }} 
            />
          </div>
          <div>
            <label style={{ fontWeight: 'bold', color: '#00D9FF', fontSize: '1.05rem' }}>Email:</label><br />
            <input 
              name="email" 
              type="email" 
              value={form.email} 
              onChange={handleChange} 
              required 
              style={{ 
                width: '100%', 
                padding: '0.9rem', 
                borderRadius: 10, 
                border: '2px solid rgba(220,20,60,0.3)', 
                fontSize: '1rem',
                background: 'rgba(26,26,46,0.5)',
                color: '#fff',
                transition: 'all 0.3s'
              }} 
            />
          </div>
          <div>
            <label style={{ fontWeight: 'bold', color: '#00D9FF', fontSize: '1.05rem' }}>Message/Request Details:</label><br />
            <textarea 
              name="message" 
              value={form.message} 
              onChange={handleChange} 
              required 
              style={{ 
                width: '100%', 
                padding: '0.9rem', 
                borderRadius: 10, 
                border: '2px solid rgba(220,20,60,0.3)', 
                fontSize: '1rem', 
                minHeight: '100px',
                background: 'rgba(26,26,46,0.5)',
                color: '#fff',
                transition: 'all 0.3s',
                fontFamily: 'inherit'
              }} 
            />
          </div>
          <button 
            type="submit" 
            style={{ 
              background: 'linear-gradient(135deg, #00D9FF 0%, #FF6B00 100%)', 
              color: '#fff', 
              padding: '1.1rem 2.5rem', 
              border: 'none', 
              borderRadius: 50, 
              fontWeight: 'bold', 
              fontSize: '1.15rem', 
              cursor: 'pointer', 
              boxShadow: '0 5px 20px rgba(220,20,60,0.4)', 
              marginTop: '0.5rem', 
              transition: 'all 0.3s',
              letterSpacing: '0.5px'
            }}
            onMouseOver={e => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 8px 30px rgba(220,20,60,0.6)';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 5px 20px rgba(220,20,60,0.4)';
            }}
          >
            🚀 Send Request
          </button>
        </form>
      )}
    </main>
  );
}

export default BusinessSubscription;
