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
  .navbar-lmr { 
    background: linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%); 
    color: #fff; 
    height: 75px; 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    padding: 0 2.5rem; 
    position: sticky; 
    top: 0; 
    z-index: 1000; 
    box-shadow: 0 4px 25px rgba(0, 217, 255, 0.3), 0 0 50px rgba(255, 107, 0, 0.2); 
    border-bottom: 3px solid transparent;
    border-image: linear-gradient(90deg, #00D9FF, #FF6B00, #FFD700, #FF6B00, #00D9FF) 1;
  }
  .navbar-lmr .logo { 
    font-size: 1.8rem; 
    font-weight: 900; 
    background: linear-gradient(135deg, #00D9FF, #FF6B00);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 3px; 
    text-decoration: none; 
    text-transform: uppercase; 
    filter: drop-shadow(0 0 15px rgba(0, 217, 255, 0.6));
    transition: all 0.3s;
  }
  .navbar-lmr .logo:hover {
    filter: drop-shadow(0 0 25px rgba(255, 107, 0, 0.8));
    transform: scale(1.05);
  }
  .navbar-lmr .links { display: flex; gap: 1.5rem; align-items: center; }
  .navbar-lmr .link { 
    color: #fff; 
    text-decoration: none; 
    font-weight: 600; 
    font-size: 1.05rem; 
    padding: 0.7rem 1.5rem; 
    border-radius: 10px; 
    transition: all 0.3s; 
    text-transform: uppercase; 
    letter-spacing: 1px; 
    border: 2px solid transparent; 
    position: relative;
    overflow: hidden;
  }
  .navbar-lmr .link::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.3), transparent);
    transition: left 0.5s;
  }
  .navbar-lmr .link:hover::before {
    left: 100%;
  }
  .navbar-lmr .link:hover { 
    background: rgba(0, 217, 255, 0.1); 
    border-color: #00D9FF; 
    color: #00D9FF; 
    box-shadow: 0 0 15px rgba(0, 217, 255, 0.4);
  }
  .navbar-lmr .link.active { 
    background: linear-gradient(135deg, #00D9FF 0%, #FF6B00 100%); 
    color: #000; 
    border-color: #FFD700; 
    box-shadow: 0 4px 20px rgba(0, 217, 255, 0.5), 0 0 30px rgba(255, 107, 0, 0.3);
    font-weight: 700;
  }
  .navbar-lmr .link.privacy { 
    color: #FFD700; 
    border-color: #FFD700; 
  }
  .navbar-lmr .link.privacy:hover {
    background: rgba(255, 215, 0, 0.1);
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
  }
  .navbar-lmr .burger { 
    display: none; 
    background: linear-gradient(135deg, #00D9FF 0%, #FF6B00 100%); 
    border: 2px solid #FFD700; 
    cursor: pointer; 
    margin-left: 1rem; 
    padding: 0.7rem 1.2rem; 
    border-radius: 10px; 
    box-shadow: 0 0 20px rgba(0, 217, 255, 0.5);
    transition: all 0.3s;
  }
  .navbar-lmr .burger:hover {
    transform: scale(1.1);
    box-shadow: 0 0 30px rgba(255, 107, 0, 0.7);
  }
  .navbar-lmr .burger svg { display: block; }
  .navbar-lmr .burger svg rect { fill: #000; }
  .navbar-lmr .overlay { display: none; }
  .navbar-lmr .side-menu { display: none; }
  @media (max-width: 900px) {
    .navbar-lmr .links { display: none; }
    .navbar-lmr .burger { display: block; }
    .navbar-lmr .overlay { 
      display: block; 
      position: fixed; 
      top: 0; 
      left: 0; 
      width: 100vw; 
      height: 100vh; 
      background: rgba(0,0,0,0.85); 
      z-index: 999; 
      opacity: 1; 
      transition: opacity 0.3s; 
      backdrop-filter: blur(10px); 
    }
    .navbar-lmr .overlay.closed { display: none; opacity: 0; }
    .navbar-lmr .side-menu { 
      display: flex; 
      flex-direction: column; 
      position: fixed; 
      top: 0; 
      left: 0; 
      height: 100vh; 
      width: 300px; 
      background: linear-gradient(180deg, #0a0a0a 0%, #000000 100%); 
      color: #fff; 
      box-shadow: 4px 0 40px rgba(0, 217, 255, 0.4), 8px 0 60px rgba(255, 107, 0, 0.3); 
      padding: 2.5rem 1.5rem; 
      gap: 1rem; 
      z-index: 1000; 
      transform: translateX(-100%); 
      transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55); 
      border-right: 4px solid transparent;
      border-image: linear-gradient(180deg, #00D9FF, #FF6B00, #FFD700) 1;
    }
    .navbar-lmr .side-menu.open { transform: translateX(0); }
    .navbar-lmr .side-menu .close-btn { 
      align-self: flex-end; 
      background: linear-gradient(135deg, #FF6B00, #00D9FF); 
      border: 2px solid #FFD700; 
      color: #000; 
      font-size: 2rem; 
      font-weight: bold;
      cursor: pointer; 
      margin-bottom: 2rem; 
      width: 45px; 
      height: 45px; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      box-shadow: 0 0 20px rgba(255, 107, 0, 0.6);
      transition: all 0.3s;
    }
    .navbar-lmr .side-menu .close-btn:hover {
      transform: rotate(90deg) scale(1.1);
      box-shadow: 0 0 30px rgba(0, 217, 255, 0.8);
    }
    .navbar-lmr .side-menu .link { 
      font-size: 1.1rem; 
      padding: 1rem 1.2rem; 
      color: #fff; 
      border-radius: 10px; 
      border: 2px solid transparent; 
    }
    .navbar-lmr .side-menu .link:hover { 
      background: rgba(0, 217, 255, 0.1); 
      border-color: #00D9FF; 
      box-shadow: 0 0 15px rgba(0, 217, 255, 0.3);
    }
    .navbar-lmr .side-menu .link.active { 
      background: linear-gradient(135deg, #00D9FF 0%, #FF6B00 100%); 
      color: #000; 
      border-color: #FFD700; 
      font-weight: 700;
    }
    .navbar-lmr .side-menu .link.privacy { 
      color: #FFD700; 
      border-color: #FFD700; 
    }
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
              background: 'linear-gradient(135deg, #FF6B00, #FFD700)',
              border: '2px solid #00D9FF',
              color: '#000',
              padding: '0.7rem 1.5rem',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1.05rem',
              letterSpacing: '1px',
              transition: 'all 0.3s',
              boxShadow: '0 0 20px rgba(255, 107, 0, 0.5)',
              textTransform: 'uppercase'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #00D9FF, #FF6B00)';
              e.target.style.borderColor = '#FFD700';
              e.target.style.boxShadow = '0 0 30px rgba(0, 217, 255, 0.7)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #FF6B00, #FFD700)';
              e.target.style.borderColor = '#00D9FF';
              e.target.style.boxShadow = '0 0 20px rgba(255, 107, 0, 0.5)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            🚪 LOGOUT
          </button>
        )}
      </div>
      <button className="burger" aria-label="Open menu" onClick={() => setOpen(true)}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect y="6" width="32" height="4" rx="2" fill="#000"/><rect y="14" width="32" height="4" rx="2" fill="#000"/><rect y="22" width="32" height="4" rx="2" fill="#000"/></svg>
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
              background: 'linear-gradient(135deg, #FF6B00, #FFD700)',
              border: '2px solid #00D9FF',
              color: '#000',
              padding: '1rem 1.2rem',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1.1rem',
              letterSpacing: '1px',
              marginTop: '1rem',
              width: '100%',
              textAlign: 'center',
              transition: 'all 0.3s',
              boxShadow: '0 0 20px rgba(255, 107, 0, 0.5)',
              textTransform: 'uppercase'
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
