import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Simple hardcoded credentials - يمكن تغييرها لاحقاً لقاعدة بيانات
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'hrr2025'
  };

  function handleSubmit(e) {
    e.preventDefault();
    if (credentials.username === ADMIN_CREDENTIALS.username && 
        credentials.password === ADMIN_CREDENTIALS.password) {
      // Store login status in localStorage
      localStorage.setItem('hrrAdminLoggedIn', 'true');
      localStorage.setItem('hrrAdminLoginTime', new Date().toISOString());
      onLogin();
      navigate('/jobcard-admin');
    } else {
      setError('Invalid username or password');
      setTimeout(() => setError(''), 3000);
    }
  }

  return (
    <main style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        background: 'rgba(26,26,46,0.95)',
        borderRadius: '18px',
        boxShadow: '0 8px 32px rgba(220,20,60,0.4)',
        padding: '2.5rem',
        border: '2px solid rgba(220,20,60,0.3)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img 
            src="/mustang-parts.png" 
            alt="HRR Logo" 
            style={{ 
              width: 120, 
              borderRadius: '15px',
              border: '2px solid #00D9FF',
              padding: '10px',
              background: 'rgba(26,26,46,0.8)',
              boxShadow: '0 10px 30px rgba(220,20,60,0.4)'
            }} 
          />
        </div>

        <h1 style={{ 
          color: '#00D9FF', 
          fontWeight: 900, 
          fontSize: '2rem', 
          marginBottom: '0.5rem', 
          textAlign: 'center', 
          letterSpacing: 2 
        }}>
          Admin Login
        </h1>
        <p style={{ 
          color: '#aaa', 
          textAlign: 'center', 
          marginBottom: '2rem',
          fontSize: '0.95rem'
        }}>
          🔒 Workshop Management Access
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>
              Username
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
              placeholder="Enter username"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(220,20,60,0.3)',
                borderRadius: '8px',
                padding: '0.9rem',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#00D9FF'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(220,20,60,0.3)'}
            />
          </div>

          <div>
            <label style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
              placeholder="Enter password"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(220,20,60,0.3)',
                borderRadius: '8px',
                padding: '0.9rem',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#00D9FF'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(220,20,60,0.3)'}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(255,0,0,0.1)',
              border: '1px solid rgba(255,0,0,0.3)',
              borderRadius: '8px',
              padding: '0.8rem',
              color: '#ff4444',
              textAlign: 'center',
              fontSize: '0.9rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              background: 'linear-gradient(90deg, #00D9FF 60%, #FF6B00 100%)',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              border: 'none',
              borderRadius: '8px',
              padding: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(220,20,60,0.4)',
              letterSpacing: 1,
              transition: 'all 0.3s',
              marginTop: '0.5rem'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🔓 Login
          </button>
        </form>

        <p style={{ 
          color: '#666', 
          textAlign: 'center', 
          marginTop: '2rem',
          fontSize: '0.85rem'
        }}>
          Default: admin / hrr2025
        </p>
      </div>
    </main>
  );
}

export default Login;
