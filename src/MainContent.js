import React, { useState, useEffect } from 'react';

function MainContent() {
  const [fadeIn, setFadeIn] = useState(false);
  const [lang, setLang] = useState('en'); // 'en' or 'ar'

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const content = {
    en: {
      title: "HOT ROD RACING (HRR)",
      subtitle: "Ford Specialist Garage - Kuwait",
      desc1: "The workshop has been open since 2006.",
      desc2: "Participating in Ford vehicle programming on IDS software since 2013 until now.",
      contactBtn: "Contact on WhatsApp",
      servicesTitle: "Our Services",
      services: [
        { icon: "💻", title: "Ford ECU Programming & Updates" },
        { icon: "🔍", title: "Advanced Diagnostics & Troubleshooting" },
        { icon: "🔑", title: "Key Programming & Immobilizer" },
        { icon: "🔧", title: "General Maintenance & Repairs" },
        { icon: "⚡", title: "Performance Tuning" }
      ],
      contactTitle: "Contact & Location",
      location: "Location:",
      locationText: "Kuwait, Shuwaikh Industrial, behind Ramiz Market",
      manager: "Manager:",
      managerName: "Firas Al-Otaibi",
      whatsapp: "WhatsApp:",
      facebook: "Facebook:",
      testimonialsTitle: "Customer Testimonials",
      testimonials: [
        "Best Ford garage in Kuwait!",
        "Professional service and expert programming."
      ]
    },
    ar: {
      title: "هوت رود ريسنق (HRR)",
      subtitle: "ورشة متخصصة في فورد - الكويت",
      desc1: "تم افتتاح الورشة منذ عام 2006.",
      desc2: "مشاركون في برمجة سيارات فورد على برنامج IDS منذ 2013 حتى الآن.",
      contactBtn: "تواصل عبر واتساب",
      servicesTitle: "خدماتنا",
      services: [
        { icon: "💻", title: "برمجة وتحديث كمبيوتر فورد" },
        { icon: "🔍", title: "فحص وتشخيص متقدم" },
        { icon: "🔑", title: "برمجة المفاتيح والحماية" },
        { icon: "🔧", title: "الصيانة العامة والإصلاحات" },
        { icon: "⚡", title: "تحسين الأداء" }
      ],
      contactTitle: "التواصل والموقع",
      location: "الموقع:",
      locationText: "الكويت، الشويخ الصناعية، خلف سوق راميز",
      manager: "المدير:",
      managerName: "فراس العتيبي",
      whatsapp: "واتساب:",
      facebook: "فيسبوك:",
      testimonialsTitle: "آراء العملاء",
      testimonials: [
        "أفضل ورشة فورد في الكويت!",
        "خدمة احترافية وبرمجة متخصصة."
      ]
    }
  };

  const t = content[lang];

  return (
    <main style={{ maxWidth: 950, margin: '2.5rem auto', background: '#fff', borderRadius: 20, boxShadow: '0 8px 40px rgba(0,51,153,0.15)', padding: '3rem 2rem', position: 'relative', opacity: fadeIn ? 1 : 0, transition: 'opacity 0.8s ease-in', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      {/* Language Toggle Button */}
      <button 
        onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: lang === 'ar' ? 'auto' : '1.5rem',
          left: lang === 'ar' ? '1.5rem' : 'auto',
          background: 'linear-gradient(135deg, #003399 0%, #0074d9 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: 25,
          padding: '0.6rem 1.2rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 3px 10px rgba(0,51,153,0.3)',
          transition: 'all 0.3s ease',
          fontSize: '0.95rem'
        }}
        onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={e => e.target.style.transform = 'scale(1)'}
      >
        {lang === 'en' ? '🇰🇼 عربي' : '🇬🇧 English'}
      </button>

      <section style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <img src="/mustang-parts.png" alt="Mustang Parts" style={{ width: 180, maxWidth: '90%', marginBottom: 16, display: 'block', marginLeft: 'auto', marginRight: 'auto', animation: 'slideDown 0.6s ease-out' }} />
        <h1 style={{ color: '#003399', fontWeight: 'bold', fontSize: '2.7rem', marginBottom: '1rem', letterSpacing: 1, textShadow: '2px 2px 4px rgba(0,51,153,0.1)' }}>{t.title}</h1>
        <h2 style={{ color: '#0074d9', fontWeight: 600, fontSize: '1.5rem', marginBottom: '1.2rem', background: 'linear-gradient(90deg, #003399, #0074d9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.subtitle}</h2>
        <p style={{ color: '#222', fontSize: '1.18rem', margin: '0 auto 1.5rem', maxWidth: 600 }}>
          {t.desc1}<br />
          {t.desc2}
        </p>
        <a href="https://wa.me/96550540999" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #003399 0%, #0074d9 100%)', color: '#fff', padding: '0.9rem 2.2rem', borderRadius: 50, fontWeight: 'bold', fontSize: '1.1rem', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,116,217,0.4)', marginTop: 10, transition: 'all 0.3s ease', transform: 'scale(1)' }}
          onMouseOver={e => { e.target.style.background = 'linear-gradient(135deg, #0074d9 0%, #003399 100%)'; e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = '0 6px 20px rgba(0,116,217,0.5)'; }}
          onMouseOut={e => { e.target.style.background = 'linear-gradient(135deg, #003399 0%, #0074d9 100%)'; e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 4px 15px rgba(0,116,217,0.4)'; }}
        >📱 {t.contactBtn}</a>
      </section>
      <section style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ color: '#003399', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>🔧 {t.servicesTitle}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {t.services.map((service, index) => (
            <ServiceCard key={index} icon={service.icon} title={service.title} />
          ))}
        </div>
      </section>
      <section style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ color: '#003399', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>📍 {t.contactTitle}</h3>
        <div style={{ fontSize: '1.1rem', color: '#222', lineHeight: 2, textAlign: 'center', background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%)', padding: '2rem', borderRadius: 15, boxShadow: '0 4px 15px rgba(0,51,153,0.08)' }}>
          <div style={{ marginBottom: '0.8rem' }}><strong>📍 {t.location}</strong> {t.locationText}</div>
          <div style={{ marginBottom: '0.8rem' }}><strong>👨‍💼 {t.manager}</strong> {t.managerName}</div>
          <div style={{ marginBottom: '0.8rem' }}><strong>💬 {t.whatsapp}</strong> <a href="https://wa.me/96550540999" style={{ fontWeight: 'bold', color: '#003399', textDecoration: 'none', borderBottom: '2px solid #0074d9', transition: 'all 0.3s' }}>+965 50540999</a></div>
          <div><strong>📘 {t.facebook}</strong> <a href="https://www.facebook.com/FERAS.50540999" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 'bold', color: '#003399', textDecoration: 'none', borderBottom: '2px solid #0074d9', transition: 'all 0.3s' }}>{t.managerName}</a></div>
        </div>
      </section>
      <section>
        <h3 style={{ color: '#003399', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>⭐ {t.testimonialsTitle}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
          {t.testimonials.map((text, index) => (
            <TestimonialCard key={index} text={text} rating="5" />
          ))}
        </div>
      </section>
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}

function ServiceCard({ icon, title }) {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        background: isHovered ? 'linear-gradient(135deg, #003399 0%, #0074d9 100%)' : 'linear-gradient(135deg, #eaf1fb 0%, #f5f9ff 100%)', 
        borderRadius: 15, 
        padding: '1.8rem 1.5rem', 
        boxShadow: isHovered ? '0 8px 25px rgba(0,116,217,0.3)' : '0 4px 15px rgba(0,51,153,0.08)', 
        color: isHovered ? '#fff' : '#003399', 
        fontWeight: 'bold', 
        fontSize: '1.08rem',
        textAlign: 'center',
        transition: 'all 0.4s ease',
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        cursor: 'pointer',
        border: isHovered ? '2px solid #0074d9' : '2px solid transparent'
      }}
    >
      <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>{icon}</div>
      {title}
    </div>
  );
}

function TestimonialCard({ text, rating }) {
  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #fff5e6 0%, #ffe6cc 100%)', 
      borderRadius: 15, 
      padding: '1.8rem', 
      boxShadow: '0 4px 15px rgba(255,153,0,0.15)', 
      color: '#003399', 
      fontWeight: 'bold', 
      fontSize: '1.1rem',
      borderLeft: '4px solid #ff9900',
      position: 'relative',
      transition: 'transform 0.3s ease',
      cursor: 'pointer'
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
      <div style={{ marginBottom: '0.8rem', fontStyle: 'italic' }}>"{text}"</div>
      <div style={{ color: '#ff9900', fontSize: '1.2rem' }}>{'⭐'.repeat(parseInt(rating))}</div>
    </div>
  );
}

export default MainContent;
