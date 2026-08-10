import React, { useState } from 'react';
import { ShieldCheck, User, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function LoginView({ apiUrl, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor ingresá usuario y contraseña.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formattedUrl = apiUrl ? apiUrl.replace(/\/+$/, '') : '';
      const response = await fetch(`${formattedUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data);
      } else {
        setError(typeof data === 'string' ? data : data.message || 'Usuario o contraseña incorrectos.');
      }
    } catch (err) {
      console.error('Error al conectar con API:', err);
      setError(`Error de conexión con la API (${apiUrl}). Verifique la URL de servidor.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem 1rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#111827',
          border: '1px solid #374151',
          borderRadius: '1.25rem',
          padding: '2rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '0.85rem',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              borderRadius: '1rem',
              marginBottom: '1rem',
              color: '#6366f1'
            }}
          >
            <ShieldCheck size={40} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
            Acceso Validador
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
            Iniciá sesión para registrar la auditoría de tickets validados
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#d1d5db', marginBottom: '0.4rem' }}>
              Usuario (Cajero / Validador)
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>
                <User size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ej: cajero.entradas o admin.tecnico"
                autoComplete="username"
                autoFocus
                style={{
                  width: '100%',
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 0.75rem 0.75rem 2.6rem',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#d1d5db', marginBottom: '0.4rem' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  width: '100%',
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 0.75rem 0.75rem 2.6rem',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: '0.5rem',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '0.85rem',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: isLoading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: isLoading ? 0.7 : 1,
              transition: 'background-color 0.2s'
            }}
          >
            {isLoading ? (
              'Autenticando...'
            ) : (
              <>
                <LogIn size={20} /> Ingresar al Validador
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #1f2937', paddingTop: '1rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Credenciales de prueba: <br />
            <code style={{ color: '#a5b4fc' }}>cajero.entradas</code> / <code style={{ color: '#a5b4fc' }}>cajero123</code>
            <br />
            <code style={{ color: '#a5b4fc' }}>admin.tecnico</code> / <code style={{ color: '#a5b4fc' }}>admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
