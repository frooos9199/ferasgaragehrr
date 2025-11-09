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
    <main style={{ maxWidth: 700, margin: '2.5rem auto', background: '#fff', borderRadius: 20, boxShadow: '0 6px 32px #00339922', padding: '2.5rem 1.5rem' }}>
      <h1 style={{ color: '#003399', fontWeight: 'bold', fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
        Business Partnership / Company Subscription
      </h1>
      <p style={{ color: '#222', fontSize: '1.1rem', marginBottom: '1.2rem', textAlign: 'center' }}>
        If you are a company or official organization interested in Ford programming, please fill out the form below. We will contact you as soon as possible.
      </p>
      {submitted ? (
        <div style={{ color: '#0074d9', fontWeight: 'bold', fontSize: '1.15rem', textAlign: 'center', margin: '2rem 0' }}>
          Thank you for your request! We will contact you soon.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.2rem', marginTop: '1rem' }}>
          <div>
            <label style={{ fontWeight: 'bold', color: '#003399' }}>Company/Organization Name:</label><br />
            <input name="company" type="text" value={form.company} onChange={handleChange} required style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1.5px solid #003399', fontSize: '1rem' }} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold', color: '#003399' }}>Contact Person:</label><br />
            <input name="contact" type="text" value={form.contact} onChange={handleChange} required style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1.5px solid #003399', fontSize: '1rem' }} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold', color: '#003399' }}>Email:</label><br />
            <input name="email" type="email" value={form.email} onChange={handleChange} required style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1.5px solid #003399', fontSize: '1rem' }} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold', color: '#003399' }}>Message/Request Details:</label><br />
            <textarea name="message" value={form.message} onChange={handleChange} required style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1.5px solid #003399', fontSize: '1rem', minHeight: '80px' }} />
          </div>
          <button type="submit" style={{ background: 'linear-gradient(90deg, #003399 60%, #0074d9 100%)', color: '#fff', padding: '1rem 2.5rem', border: 'none', borderRadius: 8, fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 2px 8px #00339922', marginTop: '0.5rem', transition: 'background 0.3s' }}
            onMouseOver={e => e.target.style.background = 'linear-gradient(90deg, #0074d9 60%, #003399 100%)'}
            onMouseOut={e => e.target.style.background = 'linear-gradient(90deg, #003399 60%, #0074d9 100%)'}
          >Send Request</button>
        </form>
      )}
    </main>
  );
}

export default BusinessSubscription;
