import React from 'react';

function About() {
  return (
    <main style={{ 
      maxWidth: 900, 
      margin: '2.5rem auto', 
      background: 'linear-gradient(135deg, rgba(26,26,46,0.9) 0%, rgba(10,10,10,0.95) 100%)', 
      borderRadius: 20, 
      boxShadow: '0 10px 40px rgba(220,20,60,0.3)', 
      padding: '3rem 2rem',
      border: '2px solid rgba(220,20,60,0.3)',
      color: '#fff'
    }}>
      <h1 style={{ 
        color: '#dc143c', 
        fontWeight: 'bold', 
        fontSize: '2.5rem', 
        marginBottom: '1.5rem', 
        textAlign: 'center',
        textShadow: '0 0 20px rgba(220,20,60,0.5)',
        letterSpacing: '1px'
      }}>
        About Firas Al-Otaibi & HRR
      </h1>
      <section style={{ 
        color: '#ddd', 
        fontSize: '1.15rem', 
        marginBottom: '2rem', 
        lineHeight: 1.8 
      }}>
        <p style={{ marginBottom: '1.5rem' }}>
          <strong style={{ color: '#dc143c' }}>Firas Al-Otaibi</strong> is a Ford specialist and the founder of HOT ROD RACING (HRR) in Kuwait. With over 19 years of hands-on experience, Firas has built a reputation for excellence in Ford programming, diagnostics, and performance upgrades. His passion for cars and commitment to quality service have made HRR a trusted destination for Ford owners and companies alike.
        </p>
        <p style={{ marginBottom: '1.5rem' }}>
          HRR offers advanced solutions for all Ford models, including ECU programming, key programming, troubleshooting, and performance tuning. Firas and his team use the latest technology and tools to ensure every vehicle receives the best care possible.
        </p>
        <p>
          Whether you are an individual Ford owner or a business seeking a reliable partner for fleet programming, HRR is ready to serve you with professionalism and expertise.
        </p>
      </section>
      <section style={{ 
        color: '#dc143c', 
        fontWeight: 'bold', 
        fontSize: '1.2rem', 
        textAlign: 'center',
        padding: '2rem',
        background: 'rgba(220,20,60,0.1)',
        borderRadius: '15px',
        border: '2px solid rgba(220,20,60,0.3)'
      }}>
        <div style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#fff' }}>
          WhatsApp: <a href="https://wa.me/96550540999" style={{ 
            color: '#dc143c', 
            textDecoration: 'none',
            fontWeight: 'bold',
            padding: '0.5rem 1rem',
            border: '2px solid #dc143c',
            borderRadius: '25px',
            display: 'inline-block',
            transition: 'all 0.3s'
          }}>+965 50540999</a>
        </div>
      </section>
    </main>
  );
}

export default About;
