// Git test: update check
import React, { useState, useEffect } from 'react';

function MainContent() {
  const [fadeIn, setFadeIn] = useState(false);
  const [lang, setLang] = useState('en'); // 'en' or 'ar'
  const [activeService, setActiveService] = useState(null);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const content = {
    en: {
      title: "HOT ROD RACING",
      subtitle: "Ford Performance Specialists",
      tagline: "Elite Ford Programming & Performance Center - Kuwait",
      desc1: "Established 2006 | 19+ Years of Excellence",
      desc2: "Official IDS Software Partner Since 2013",
      contactBtn: "Book Your Service",
      servicesTitle: "Elite Services",
      services: [
        { icon: "⚡", title: "ECU Programming", desc: "Advanced Ford ECU tuning & updates" },
        { icon: "�", title: "Performance Diagnostics", desc: "Professional troubleshooting systems" },
        { icon: "🔑", title: "Key Programming", desc: "Smart key & immobilizer solutions" },
        { icon: "🏁", title: "Performance Tuning", desc: "Custom performance optimization" },
        { icon: "�", title: "IDS/FDRS Services", desc: "Official Ford diagnostic tools" },
        { icon: "⚙️", title: "Expert Repairs", desc: "Specialized Ford maintenance" }
      ],
      whyUs: "Why Choose HRR?",
      reasons: [
        { icon: "🏆", text: "19+ Years Experience" },
        { icon: "🎯", text: "Ford Specialists Only" },
        { icon: "💎", text: "Premium Equipment" },
        { icon: "⭐", text: "100+ 5-Star Reviews" }
      ],
      contactTitle: "Visit Our Workshop",
      location: "Location:",
      locationText: "Shuwaikh Industrial, Behind Ramiz Market, Kuwait",
      manager: "Expert:",
      managerName: "Firas Al-Otaibi",
      whatsapp: "WhatsApp:",
      emergency: "Emergency Line:",
      testimonialsTitle: "Client Testimonials"
    },
    ar: {
      title: "هوت رود ريسنق",
      subtitle: "متخصصون في أداء فورد",
      tagline: "مركز برمجة وأداء فورد النخبة - الكويت",
      desc1: "تأسست 2006 | أكثر من 19 عامًا من التميز",
      desc2: "شريك رسمي لبرنامج IDS منذ 2013",
      contactBtn: "احجز خدمتك",
      servicesTitle: "خدمات النخبة",
      services: [
        { icon: "⚡", title: "برمجة الكمبيوتر", desc: "برمجة وتحديث كمبيوتر فورد المتقدم" },
        { icon: "�", title: "فحص الأداء", desc: "أنظمة فحص وتشخيص احترافية" },
        { icon: "🔑", title: "برمجة المفاتيح", desc: "حلول المفاتيح الذكية والحماية" },
        { icon: "🏁", title: "تحسين الأداء", desc: "تحسين أداء مخصص" },
        { icon: "�", title: "خدمات IDS/FDRS", desc: "أدوات فورد التشخيصية الرسمية" },
        { icon: "⚙️", title: "إصلاحات خبراء", desc: "صيانة فورد متخصصة" }
      ],
      whyUs: "لماذا HRR؟",
      reasons: [
        { icon: "🏆", text: "خبرة +19 عامًا" },
        { icon: "🎯", text: "متخصصون في فورد فقط" },
        { icon: "💎", text: "معدات بريميوم" },
        { icon: "⭐", text: "أكثر من 100 تقييم 5 نجوم" }
      ],
      contactTitle: "زر ورشتنا",
      location: "الموقع:",
      locationText: "الشويخ الصناعية، خلف سوق راميز، الكويت",
      manager: "الخبير:",
      managerName: "فراس العتيبي",
      whatsapp: "واتساب:",
      emergency: "خط الطوارئ:",
      testimonialsTitle: "آراء العملاء"
    }
  };

  const t = content[lang];

  return (
    <main style={{ 
      background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)',
      minHeight: '100vh',
      opacity: fadeIn ? 1 : 0,
      transition: 'opacity 1s ease-in',
      direction: lang === 'ar' ? 'rtl' : 'ltr',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(30deg, #00D9FF 12%, transparent 12.5%, transparent 87%, #00D9FF 87.5%, #00D9FF),
          linear-gradient(150deg, #FF6B00 12%, transparent 12.5%, transparent 87%, #FF6B00 87.5%, #FF6B00),
          linear-gradient(30deg, #FF6B00 12%, transparent 12.5%, transparent 87%, #FF6B00 87.5%, #FF6B00),
          linear-gradient(150deg, #FFD700 12%, transparent 12.5%, transparent 87%, #FFD700 87.5%, #FFD700)
        `,
        backgroundSize: '80px 140px',
        backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px',
        opacity: 0.03,
        animation: 'bgMove 20s linear infinite'
      }}></div>

      {/* Language Toggle */}
      <button 
        onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
        style={{
          position: 'fixed',
          top: '2rem',
          right: lang === 'ar' ? 'auto' : '2rem',
          left: lang === 'ar' ? '2rem' : 'auto',
          background: 'linear-gradient(135deg, #00D9FF 0%, #FF6B00 100%)',
          color: '#000',
          border: '2px solid #FFD700',
          borderRadius: 50,
          padding: '0.8rem 1.5rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,217,255,0.5)',
          transition: 'all 0.3s ease',
          zIndex: 1000,
          fontSize: '1rem'
        }}
        onMouseOver={e => { e.target.style.transform = 'scale(1.1)'; e.target.style.boxShadow = '0 6px 30px rgba(220,20,60,0.6)'; }}
        onMouseOut={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 4px 20px rgba(220,20,60,0.4)'; }}
      >
        {lang === 'en' ? '🇰🇼 عربي' : '🇬🇧 English'}
      </button>

      {/* Hero Section */}
      <section style={{ 
        padding: '6rem 2rem 4rem', 
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(220,20,60,0.1) 0%, transparent 100%)',
        position: 'relative'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Logo/Image */}
          <div style={{ marginBottom: '2rem', position: 'relative' }}>
            <img 
              src="/mustang-parts.png" 
              alt="Ford Performance" 
              style={{ 
                width: 220, 
                maxWidth: '90%', 
                marginBottom: 20,
                borderRadius: '20px',
                border: '3px solid #00D9FF',
                padding: '15px',
                background: 'linear-gradient(135deg, rgba(26,26,46,0.8) 0%, rgba(10,10,10,0.9) 100%)',
                boxShadow: '0 15px 50px rgba(220,20,60,0.6), 0 0 30px rgba(220,20,60,0.3)',
                animation: 'pulse 3s ease-in-out infinite',
                transition: 'all 0.3s ease'
              }} 
            />
          </div>
          
          {/* Title */}
          <h1 style={{ 
            color: '#fff', 
            fontWeight: 900, 
            fontSize: 'clamp(2.5rem, 8vw, 5rem)', 
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: 3,
            textShadow: '0 0 20px rgba(220,20,60,0.8), 0 0 40px rgba(220,20,60,0.4)',
            lineHeight: 1.1
          }}>
            {t.title}
          </h1>
          
          <h2 style={{ 
            color: '#00D9FF', 
            fontWeight: 700, 
            fontSize: 'clamp(1.3rem, 4vw, 2rem)', 
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: 2,
            display: 'inline-block',
            padding: '0.8rem 2rem',
            border: '3px solid rgba(255,255,255,0.3)',
            borderRadius: '15px',
            boxShadow: '0 0 20px rgba(255,255,255,0.4), 0 0 40px rgba(255,255,255,0.2), inset 0 0 20px rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)'
          }}>
            {t.subtitle}
          </h2>
          
          <p style={{ 
            color: '#aaa', 
            fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', 
            marginBottom: '2rem',
            fontStyle: 'italic'
          }}>
            {t.tagline}
          </p>

          {/* Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: '1rem', 
            maxWidth: 600, 
            margin: '2rem auto',
            padding: '0 1rem'
          }}>
            <div style={{ 
              background: 'rgba(220,20,60,0.1)', 
              border: '2px solid #00D9FF',
              borderRadius: 15,
              padding: '1rem',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ color: '#00D9FF', fontSize: '1.8rem', fontWeight: 'bold' }}>19+</div>
              <div style={{ color: '#ccc', fontSize: '0.85rem' }}>{lang === 'en' ? 'Years' : 'عامًا'}</div>
            </div>
            <div style={{ 
              background: 'rgba(220,20,60,0.1)', 
              border: '2px solid #00D9FF',
              borderRadius: 15,
              padding: '1rem',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ color: '#00D9FF', fontSize: '1.8rem', fontWeight: 'bold' }}>IDS</div>
              <div style={{ color: '#ccc', fontSize: '0.85rem' }}>{lang === 'en' ? 'Certified' : 'معتمد'}</div>
            </div>
            <div style={{ 
              background: 'rgba(220,20,60,0.1)', 
              border: '2px solid #00D9FF',
              borderRadius: 15,
              padding: '1rem',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ color: '#00D9FF', fontSize: '1.8rem', fontWeight: 'bold' }}>100%</div>
              <div style={{ color: '#ccc', fontSize: '0.85rem' }}>{lang === 'en' ? 'Ford Only' : 'فورد فقط'}</div>
            </div>
          </div>

          {/* CTA Button */}
          <a 
            href="https://wa.me/96550540999" 
            style={{ 
              display: 'inline-block',
              background: 'linear-gradient(135deg, #00D9FF 0%, #FF6B00 100%)',
              color: '#fff',
              padding: '1.2rem 3rem',
              borderRadius: 50,
              fontWeight: 'bold',
              fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
              textDecoration: 'none',
              boxShadow: '0 10px 40px rgba(220,20,60,0.5)',
              marginTop: 20,
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: 1,
              border: '2px solid #00D9FF'
            }}
            onMouseOver={e => { 
              e.target.style.transform = 'scale(1.1) translateY(-5px)'; 
              e.target.style.boxShadow = '0 15px 50px rgba(220,20,60,0.7)';
            }}
            onMouseOut={e => { 
              e.target.style.transform = 'scale(1) translateY(0)'; 
              e.target.style.boxShadow = '0 10px 40px rgba(220,20,60,0.5)';
            }}
          >
            📱 {t.contactBtn}
          </a>
        </div>
      </section>
      {/* Services Section */}
      <section style={{ padding: '4rem 2rem', background: 'rgba(220,20,60,0.05)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h3 style={{ 
            color: '#00D9FF', 
            fontWeight: 900, 
            fontSize: 'clamp(2rem, 5vw, 3rem)', 
            marginBottom: '3rem', 
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: 2,
            textShadow: '0 0 20px rgba(220,20,60,0.5)'
          }}>
            ⚡ {t.servicesTitle}
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2rem' 
          }}>
            {t.services.map((service, index) => (
              <ServiceCard 
                key={index} 
                icon={service.icon} 
                title={service.title}
                desc={service.desc}
                index={index}
                active={activeService === index}
                onClick={() => setActiveService(activeService === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ 
            color: '#00D9FF', 
            fontWeight: 900, 
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', 
            marginBottom: '2rem',
            textTransform: 'uppercase'
          }}>
            {t.whyUs}
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem',
            marginTop: '2rem'
          }}>
            {t.reasons.map((reason, index) => (
              <div 
                key={index}
                style={{
                  background: 'linear-gradient(135deg, rgba(220,20,60,0.1) 0%, rgba(255,23,68,0.05) 100%)',
                  border: '2px solid rgba(220,20,60,0.3)',
                  borderRadius: 15,
                  padding: '1.5rem 1rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(220,20,60,0.2) 0%, rgba(255,23,68,0.1) 100%)';
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.borderColor = '#00D9FF';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(220,20,60,0.1) 0%, rgba(255,23,68,0.05) 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(220,20,60,0.3)';
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{reason.icon}</div>
                <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>{reason.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section style={{ padding: '4rem 2rem', background: 'rgba(220,20,60,0.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h3 style={{ 
            color: '#00D9FF', 
            fontWeight: 900, 
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', 
            marginBottom: '2rem', 
            textAlign: 'center',
            textTransform: 'uppercase'
          }}>
            📍 {t.contactTitle}
          </h3>
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(26,26,46,0.9) 0%, rgba(10,10,10,0.9) 100%)',
            border: '2px solid #00D9FF',
            borderRadius: 20,
            padding: '2.5rem',
            boxShadow: '0 10px 40px rgba(220,20,60,0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '1.2rem', color: '#fff', lineHeight: 2, textAlign: lang === 'ar' ? 'right' : 'left' }}>
              <div style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexDirection: lang === 'ar' ? 'row-reverse' : 'row' }}>
                <span style={{ fontSize: '1.8rem' }}>📍</span>
                <div>
                  <strong style={{ color: '#00D9FF' }}>{t.location}</strong><br/>
                  <span style={{ color: '#ccc' }}>{t.locationText}</span>
                </div>
              </div>
              <div style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexDirection: lang === 'ar' ? 'row-reverse' : 'row' }}>
                <span style={{ fontSize: '1.8rem' }}>👨‍�</span>
                <div>
                  <strong style={{ color: '#00D9FF' }}>{t.manager}</strong><br/>
                  <span style={{ color: '#ccc' }}>{t.managerName}</span>
                </div>
              </div>
              <div style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexDirection: lang === 'ar' ? 'row-reverse' : 'row' }}>
                <span style={{ fontSize: '1.8rem' }}>💬</span>
                <div>
                  <strong style={{ color: '#00D9FF' }}>{t.whatsapp}</strong><br/>
                  <a href="https://wa.me/96550540999" style={{ color: '#fff', textDecoration: 'none', borderBottom: '2px solid #00D9FF', transition: 'all 0.3s' }}>
                    +965 50540999
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes bgMove {
          0% { background-position: 0 0, 0 0, 40px 70px, 40px 70px; }
          100% { background-position: 80px 140px, 80px 140px, 120px 210px, 120px 210px; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(220,20,60,0.3); }
          50% { box-shadow: 0 0 40px rgba(220,20,60,0.6); }
        }
      `}</style>
    </main>
  );
}

function ServiceCard({ icon, title, desc, index, active, onClick }) {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <div 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        background: isHovered || active ? 'linear-gradient(135deg, #00D9FF 0%, #FF6B00 100%)' : 'linear-gradient(135deg, rgba(26,26,46,0.8) 0%, rgba(10,10,10,0.8) 100%)',
        border: `2px solid ${isHovered || active ? '#FF6B00' : 'rgba(220,20,60,0.3)'}`,
        borderRadius: 20,
        padding: '2rem 1.5rem',
        boxShadow: isHovered || active ? '0 15px 50px rgba(220,20,60,0.5)' : '0 8px 30px rgba(0,0,0,0.3)',
        transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        transform: isHovered || active ? 'translateY(-15px) scale(1.05)' : 'translateY(0) scale(1)',
        cursor: 'pointer',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ 
        fontSize: '3.5rem', 
        marginBottom: '1rem',
        transform: isHovered || active ? 'scale(1.2) rotate(10deg)' : 'scale(1) rotate(0)',
        transition: 'all 0.3s ease'
      }}>
        {icon}
      </div>
      <div style={{ 
        color: isHovered || active ? '#fff' : '#00D9FF',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        marginBottom: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: 1
      }}>
        {title}
      </div>
      <div style={{ 
        color: isHovered || active ? '#fff' : '#aaa',
        fontSize: '0.95rem',
        lineHeight: 1.6
      }}>
        {desc}
      </div>
    </div>
  );
}

export default MainContent;
