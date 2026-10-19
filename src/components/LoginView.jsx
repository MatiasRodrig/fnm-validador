import React, { useState } from 'react';
import { ShieldCheck, User, Lock, LogIn, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import { formatApiUrlForFetch } from '../utils/urlHelper';
import logoImg from '../assets/logo.png';

export default function LoginView({ apiUrl, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor ingresá tu usuario y contraseña asignados.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formattedUrl = formatApiUrlForFetch(apiUrl);
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
        const role = (data.role || data.Role || '').trim().toLowerCase();
        const usernameLower = (data.username || '').trim().toLowerCase();

        if (role === 'customer') {
          setError('⛔ Acceso restringido. Este sistema es de uso exclusivo para el personal acreditado de control de accesos.');
          return;
        }

        const isAuthorizedStaff =
          role === 'admin' ||
          role.startsWith('admin') ||
          role.includes('cajer') ||
          role.includes('validador') ||
          role === 'cashier' ||
          usernameLower.startsWith('cajero') ||
          usernameLower.startsWith('admin');

        if (!isAuthorizedStaff) {
          setError('⛔ Acceso restringido. Se requiere una cuenta de Operador de Accesos, Cajero o Administrador.');
          return;
        }

        onLoginSuccess(data);
      } else {
        setError(typeof data === 'string' ? data : data.message || 'Usuario o contraseña incorrectos.');
      }
    } catch (err) {
      console.error('Error al conectar con API:', err);
      setError(`Error de conexión con el servidor (${apiUrl || 'Proxy Automático'}). Verifique la red o la configuración.`);
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
        padding: '2rem 0.5rem',
        background: 'radial-gradient(ellipse 65% 50% at 50% 0%, rgba(218, 71, 6, 0.16) 0%, transparent 70%)'
      }}
    >
      <div style={{ width: '100%', maxWidth: '430px' }}>
        {/* Official Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <img
              src={logoImg}
              alt="Fiesta Nacional de la Madera"
              style={{
                height: '82px',
                width: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 16px rgba(252, 170, 1, 0.4))'
              }}
            />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.72rem',
              fontWeight: 800,
              background: 'rgba(218, 71, 6, 0.16)',
              color: 'var(--brand-gold)',
              padding: '0.28rem 0.85rem',
              borderRadius: '9999px',
              border: '1px solid rgba(252, 170, 1, 0.35)',
              marginBottom: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}
          >
            <ShieldCheck size={14} color="var(--brand-gold)" /> Control de Acceso Oficial · 41° Edición
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Registro de Tickets
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Ingresá con tu usuario asignado para habilitar el puesto de validación por día
          </p>
        </div>

        {/* Login Card */}
        <div
          className="card"
          style={{
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          {/* Top Accent Gradient Bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'var(--accent-gradient)'
            }}
          />

          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.14)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                padding: '0.8rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, color: '#ef4444' }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="validator-username">
                Usuario Operador
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={17}
                  style={{
                    position: 'absolute',
                    left: '0.9rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  id="validator-username"
                  type="text"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresá tu usuario dedicado"
                  autoComplete="username"
                  autoFocus
                  style={{ paddingLeft: '2.6rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="validator-password">
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={17}
                  style={{
                    position: 'absolute',
                    left: '0.9rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  id="validator-password"
                  type={showPwd ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresá tu contraseña"
                  autoComplete="current-password"
                  style={{ paddingLeft: '2.6rem', paddingRight: '2.6rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  tabIndex={-1}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex'
                  }}
                  title={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-full"
              style={{
                marginTop: '0.4rem',
                padding: '0.9rem',
                fontSize: '1rem'
              }}
            >
              {isLoading ? (
                'Verificando credenciales...'
              ) : (
                <>
                  <LogIn size={19} /> Ingresar al Puesto de Control
                </>
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              borderTop: '1px solid var(--border)',
              paddingTop: '1rem'
            }}
          >
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Uso exclusivo para personal acreditado de la{' '}
              <strong style={{ color: 'var(--text-secondary)' }}>Fiesta Nacional de la Madera</strong>.
              <br />
              Cada validación queda registrada bajo su usuario dedicado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
