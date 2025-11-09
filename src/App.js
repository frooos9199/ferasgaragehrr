import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import PrivacyPolicy from './PrivacyPolicy';
import MainContent from './MainContent';
import About from './About';
import BusinessSubscription from './BusinessSubscription';

const navCSS = `
  .navbar-lmr { background: #003399; color: #fff; height: 60px; display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; position: relative; z-index: 100; box-shadow: 0 2px 8px #00339922; }
  .navbar-lmr .logo { font-size: 1.5rem; font-weight: bold; color: #ffd700; letter-spacing: 1px; text-decoration: none; }
  .navbar-lmr .links { display: flex; gap: 2rem; align-items: center; }
  .navbar-lmr .link { color: #fff; text-decoration: none; font-weight: 500; font-size: 1.08rem; padding: 0.5rem 1.1rem; border-radius: 5px; transition: background 0.2s, color 0.2s; }
  .navbar-lmr .link.active { background: #0050b3; color: #fff; }
  .navbar-lmr .link.privacy { color: #ffd700; text-decoration: underline; }
  .navbar-lmr .burger { display: none; background: none; border: none; cursor: pointer; margin-left: 1rem; }
  .navbar-lmr .burger svg { display: block; }
  .navbar-lmr .overlay { display: none; }
  .navbar-lmr .side-menu { display: none; }
  @media (max-width: 900px) {
    .navbar-lmr .links { display: none; }
    .navbar-lmr .burger { display: block; }
    .navbar-lmr .overlay { display: block; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.45); z-index: 99; opacity: 1; transition: opacity 0.3s; }
    .navbar-lmr .overlay.closed { display: none; opacity: 0; }
    .navbar-lmr .side-menu { display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh; width: 260px; background: #003399; color: #fff; box-shadow: 2px 0 16px #00339933; padding: 2.5rem 1.2rem 1.2rem 1.2rem; gap: 1.2rem; z-index: 100; transform: translateX(-100%); transition: transform 0.3s; }
    .navbar-lmr .side-menu.open { transform: translateX(0); }
    .navbar-lmr .side-menu .close-btn { align-self: flex-end; background: none; border: none; color: #fff; font-size: 2rem; cursor: pointer; margin-bottom: 1.5rem; }
    .navbar-lmr .side-menu .link { font-size: 1.15rem; padding: 0.7rem 0.5rem; color: #fff; }
    .navbar-lmr .side-menu .link.active { background: #0050b3; color: #fff; }
    .navbar-lmr .side-menu .link.privacy { color: #ffd700; }
  }
`;

function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/business', label: 'Business Subscription' },
    { to: '/privacy', label: 'Privacy Policy', highlight: true },
  ];
  // Close menu when clicking outside or on overlay
  useEffect(() => {
    function handleClick(e) {
      if (open && menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);
  return (
    <nav className="navbar-lmr">
      <style>{navCSS}</style>
      <Link to="/" className="logo">HRR</Link>
      <div className="links">
        {navLinks.map(link => (
          <Link key={link.to} to={link.to} className={`link${link.highlight ? ' privacy' : ''}${location.pathname === link.to ? ' active' : ''}`}>{link.label}</Link>
        ))}
      </div>
      <button className="burger" aria-label="Open menu" onClick={() => setOpen(true)}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect y="6" width="32" height="4" rx="2" fill="#ffd700"/><rect y="14" width="32" height="4" rx="2" fill="#ffd700"/><rect y="22" width="32" height="4" rx="2" fill="#ffd700"/></svg>
      </button>
      {/* Overlay */}
      <div className={`overlay${open ? '' : ' closed'}`} onClick={() => setOpen(false)}></div>
      {/* Side menu */}
      <div ref={menuRef} className={`side-menu${open ? ' open' : ''}`}>
        <button className="close-btn" aria-label="Close menu" onClick={() => setOpen(false)}>&times;</button>
        {navLinks.map(link => (
          <Link key={link.to} to={link.to} className={`link${link.highlight ? ' privacy' : ''}${location.pathname === link.to ? ' active' : ''}`} onClick={() => setOpen(false)}>{link.label}</Link>
        ))}
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ fontFamily: 'Segoe UI, Arial, sans-serif', background: '#003399', color: '#fff', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/about" element={<About />} />
          <Route path="/business" element={<BusinessSubscription />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
        {/* Footer */}
        <footer style={{ background: 'linear-gradient(90deg, #003399 60%, #0074d9 100%)', color: '#fff', textAlign: 'center', padding: '1.2rem 0', marginTop: '2rem', fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '1px', boxShadow: '0 -2px 8px #00339922' }}>
          &copy; {new Date().getFullYear()} HOT ROD RACING (HRR) - Ford Specialist Garage
        </footer>
      </div>
    </Router>
  );
}

export default App;
