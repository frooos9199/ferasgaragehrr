import React from 'react';

function About() {
  return (
    <main style={{ maxWidth: 900, margin: '2.5rem auto', background: '#fff', borderRadius: 20, boxShadow: '0 6px 32px #00339922', padding: '3rem 2rem' }}>
      <h1 style={{ color: '#003399', fontWeight: 'bold', fontSize: '2.2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
        About Firas Al-Otaibi & HRR
      </h1>
      <section style={{ color: '#222', fontSize: '1.15rem', marginBottom: '2rem', lineHeight: 1.7 }}>
        <p>
          <strong>Firas Al-Otaibi</strong> is a Ford specialist and the founder of HOT ROD RACING (HRR) in Kuwait. With over 15 years of hands-on experience, Firas has built a reputation for excellence in Ford programming, diagnostics, and performance upgrades. His passion for cars and commitment to quality service have made HRR a trusted destination for Ford owners and companies alike.
        </p>
        <p>
          HRR offers advanced solutions for all Ford models, including ECU programming, key programming, troubleshooting, and performance tuning. Firas and his team use the latest technology and tools to ensure every vehicle receives the best care possible.
        </p>
        <p>
          Whether you are an individual Ford owner or a business seeking a reliable partner for fleet programming, HRR is ready to serve you with professionalism and expertise.
        </p>
      </section>
      <section style={{ color: '#003399', fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center' }}>
  {/* Email contact removed as requested */}
        <div>WhatsApp: <a href="https://wa.me/96550540999" style={{ color: '#0074d9', textDecoration: 'underline' }}>+965 50540999</a></div>
      </section>
    </main>
  );
}

export default About;
