import React from 'react';

function PrivacyPolicy() {
  return (
    <main style={{ 
      maxWidth: 800, 
      margin: '2rem auto', 
      background: 'linear-gradient(135deg, rgba(26,26,46,0.9) 0%, rgba(10,10,10,0.95) 100%)', 
      borderRadius: 16, 
      boxShadow: '0 10px 40px rgba(220,20,60,0.3)', 
      padding: '2.5rem',
      border: '2px solid rgba(220,20,60,0.3)',
      color: '#fff'
    }}>
      <h1 style={{ 
        color: '#dc143c', 
        fontWeight: 'bold', 
        fontSize: '2.3rem', 
        marginBottom: '1.5rem', 
        textAlign: 'center',
        textShadow: '0 0 20px rgba(220,20,60,0.5)',
        letterSpacing: '1px'
      }}>
        Privacy Policy
      </h1>
      <p style={{ 
        color: '#fff', 
        fontSize: '1.1rem', 
        marginBottom: '1.5rem',
        lineHeight: '1.7'
      }}>
        At <strong style={{ color: '#dc143c' }}>HOT ROD RACING (HRR)</strong>, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our website and services.
      </p>
      
      <h2 style={{ 
        color: '#dc143c', 
        fontWeight: 'bold', 
        fontSize: '1.4rem', 
        marginTop: '2rem',
        marginBottom: '1rem',
        borderBottom: '2px solid rgba(220,20,60,0.3)',
        paddingBottom: '0.5rem'
      }}>
        Information We Collect
      </h2>
      <ul style={{ 
        color: '#fff', 
        fontSize: '1.05rem', 
        marginLeft: '1.5rem', 
        marginBottom: '1.5rem',
        lineHeight: '1.8'
      }}>
        <li style={{ marginBottom: '0.5rem' }}>Contact details (name, email, phone) when you reach out to us</li>
        <li style={{ marginBottom: '0.5rem' }}>Information you provide through forms or service requests</li>
        <li>Technical data such as IP address and browser type (for analytics)</li>
      </ul>
      
      <h2 style={{ 
        color: '#dc143c', 
        fontWeight: 'bold', 
        fontSize: '1.4rem', 
        marginTop: '2rem',
        marginBottom: '1rem',
        borderBottom: '2px solid rgba(220,20,60,0.3)',
        paddingBottom: '0.5rem'
      }}>
        How We Use Your Information
      </h2>
      <ul style={{ 
        color: '#fff', 
        fontSize: '1.05rem', 
        marginLeft: '1.5rem', 
        marginBottom: '1.5rem',
        lineHeight: '1.8'
      }}>
        <li style={{ marginBottom: '0.5rem' }}>To respond to your inquiries and provide requested services</li>
        <li style={{ marginBottom: '0.5rem' }}>To improve our website and customer experience</li>
        <li>To send important updates or offers (with your consent)</li>
      </ul>
      
      <h2 style={{ 
        color: '#dc143c', 
        fontWeight: 'bold', 
        fontSize: '1.4rem', 
        marginTop: '2rem',
        marginBottom: '1rem',
        borderBottom: '2px solid rgba(220,20,60,0.3)',
        paddingBottom: '0.5rem'
      }}>
        Data Protection
      </h2>
      <p style={{ 
        color: '#fff', 
        fontSize: '1.05rem', 
        marginBottom: '1.5rem',
        lineHeight: '1.8'
      }}>
        We implement industry-standard security measures to protect your data from unauthorized access or disclosure. Your information is never sold or shared with third parties except as required by law.
      </p>
      
      <h2 style={{ 
        color: '#dc143c', 
        fontWeight: 'bold', 
        fontSize: '1.4rem', 
        marginTop: '2rem',
        marginBottom: '1rem',
        borderBottom: '2px solid rgba(220,20,60,0.3)',
        paddingBottom: '0.5rem'
      }}>
        Contact Us
      </h2>
      <p style={{ 
        color: '#fff', 
        fontSize: '1.05rem',
        lineHeight: '1.8'
      }}>
        If you have any questions about this Privacy Policy or your personal data, please contact us via WhatsApp{' '}
        <a 
          href="https://wa.me/96550540999" 
          style={{ 
            color: '#dc143c', 
            textDecoration: 'none',
            fontWeight: 'bold',
            borderBottom: '2px solid #dc143c',
            transition: 'all 0.3s'
          }}
        >
          +965 50540999
        </a>.
      </p>
    </main>
  );
}

export default PrivacyPolicy;
