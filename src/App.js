import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation, Navigate } from 'react-router-dom';
import PrivacyPolicy from './PrivacyPolicy';
import MainContent from './MainContent';
import About from './About';
import BusinessSubscription from './BusinessSubscription';
import JobCardAdmin from './JobCardAdmin';
import JobCardPublic from './JobCardPublic';
import Login from './Login';

const navCSS = `
  .navbar-lmr { background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); color: #fff; height: 70px; display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; position: sticky; top: 0; z-index: 1000; box-shadow: 0 4px 20px rgba(220,20,60,0.3); border-bottom: 2px solid #dc143c; }
  .navbar-lmr .logo { font-size: 1.6rem; font-weight: 900; color: #dc143c; letter-spacing: 2px; text-decoration: none; text-transform: uppercase; text-shadow: 0 0 10px rgba(220,20,60,0.5); }
  .navbar-lmr .links { display: flex; gap: 1.5rem; align-items: center; }
  .navbar-lmr .link { color: #fff; text-decoration: none; font-weight: 600; font-size: 1.05rem; padding: 0.6rem 1.3rem; border-radius: 8px; transition: all 0.3s; text-transform: uppercase; letter-spacing: 0.5px; border: 2px solid transparent; }
  .navbar-lmr .link:hover { background: rgba(220,20,60,0.1); border-color: #dc143c; color: #dc143c; }
  .navbar-lmr .link.active { background: linear-gradient(135deg, #dc143c 0%, #ff1744 100%); color: #fff; border-color: #ff1744; box-shadow: 0 4px 15px rgba(220,20,60,0.4); }
  .navbar-lmr .link.privacy { color: #dc143c; border-color: #dc143c; }
  .navbar-lmr .burger { display: none; background: linear-gradient(135deg, #dc143c 0%, #ff1744 100%); border: none; cursor: pointer; margin-left: 1rem; padding: 0.6rem 1rem; border-radius: 8px; }
  .navbar-lmr .burger svg { display: block; }
  .navbar-lmr .overlay { display: none; }
  .navbar-lmr .side-menu { display: none; }
  @media (max-width: 900px) {
    .navbar-lmr .links { display: none; }
    .navbar-lmr .burger { display: block; }
    .navbar-lmr .overlay { display: block; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); z-index: 999; opacity: 1; transition: opacity 0.3s; backdrop-filter: blur(5px); }
    .navbar-lmr .overlay.closed { display: none; opacity: 0; }
    .navbar-lmr .side-menu { display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh; width: 280px; background: linear-gradient(180deg, #1a1a2e 0%, #0a0a0a 100%); color: #fff; box-shadow: 4px 0 30px rgba(220,20,60,0.4); padding: 2.5rem 1.5rem; gap: 1rem; z-index: 1000; transform: translateX(-100%); transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55); border-right: 3px solid #dc143c; }
    .navbar-lmr .side-menu.open { transform: translateX(0); }
    .navbar-lmr .side-menu .close-btn { align-self: flex-end; background: #dc143c; border: none; color: #fff; font-size: 1.8rem; cursor: pointer; margin-bottom: 2rem; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .navbar-lmr .side-menu .link { font-size: 1.1rem; padding: 0.9rem 1rem; color: #fff; border-radius: 8px; border: 2px solid transparent; }
    .navbar-lmr .side-menu .link:hover { background: rgba(220,20,60,0.1); border-color: #dc143c; }
    .navbar-lmr .side-menu .link.active { background: linear-gradient(135deg, #dc143c 0%, #ff1744 100%); color: #fff; border-color: #ff1744; }
    .navbar-lmr .side-menu .link.privacy { color: #dc143c; border-color: #dc143c; }
  }
`;

function Navbar({ isLoggedIn, onLogout }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/business', label: 'Business Subscription' },
    { to: '/jobcard-admin', label: 'Workshop', highlight: false, protected: true },
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
        {isLoggedIn && (
          <button 
            onClick={onLogout}
            style={{
              background: 'rgba(255,0,0,0.2)',
              border: '2px solid rgba(255,0,0,0.5)',
              color: '#ff6666',
              padding: '0.6rem 1.3rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1.05rem',
              letterSpacing: '0.5px',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,0,0,0.3)';
              e.target.style.borderColor = '#ff0000';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,0,0,0.2)';
              e.target.style.borderColor = 'rgba(255,0,0,0.5)';
            }}
          >
            🚪 LOGOUT
          </button>
        )}
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
        {isLoggedIn && (
          <button 
            onClick={() => {
              onLogout();
              setOpen(false);
            }}
            style={{
              background: 'rgba(255,0,0,0.2)',
              border: '2px solid rgba(255,0,0,0.5)',
              color: '#ff6666',
              padding: '0.9rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1.1rem',
              letterSpacing: '0.5px',
              marginTop: '1rem',
              width: '100%',
              textAlign: 'left'
            }}
          >
            🚪 LOGOUT
          </button>
        )}
      </div>
    </nav>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check if admin is already logged in
    const loggedIn = localStorage.getItem('hrrAdminLoggedIn');
    const loginTime = localStorage.getItem('hrrAdminLoginTime');
    
    // Auto logout after 24 hours
    if (loggedIn && loginTime) {
      const hoursSinceLogin = (new Date() - new Date(loginTime)) / (1000 * 60 * 60);
      if (hoursSinceLogin > 24) {
        localStorage.removeItem('hrrAdminLoggedIn');
        localStorage.removeItem('hrrAdminLoginTime');
        return false;
      }
      return true;
    }
    return false;
  });

  const handleLogin = () => setIsLoggedIn(true);
  
  const handleLogout = () => {
    localStorage.removeItem('hrrAdminLoggedIn');
    localStorage.removeItem('hrrAdminLoginTime');
    setIsLoggedIn(false);
  };

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <div style={{ 
        fontFamily: 'Segoe UI, Arial, sans-serif', 
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)', 
        color: '#fff', 
        minHeight: '100vh' 
      }}>
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/about" element={<About />} />
          <Route path="/business" element={<BusinessSubscription />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/jobcard-admin" element={
            <ProtectedRoute>
              <JobCardAdmin />
            </ProtectedRoute>
          } />
          <Route path="/jobcard/:id" element={<JobCardPublic />} />
        </Routes>
        {/* Footer */}
        <footer style={{ 
          background: 'linear-gradient(135deg, #dc143c 0%, #ff1744 100%)', 
          color: '#fff', 
          textAlign: 'center', 
          padding: '1.5rem 0', 
          marginTop: '3rem', 
          fontWeight: 'bold', 
          fontSize: '1.1rem', 
          letterSpacing: '1px', 
          boxShadow: '0 -4px 20px rgba(220,20,60,0.4)',
          borderTop: '2px solid rgba(220,20,60,0.5)'
        }}>
          &copy; {new Date().getFullYear()} HOT ROD RACING (HRR) - Ford Specialist Garage
        </footer>
      </div>
    </Router>
  );
}

export default App;
