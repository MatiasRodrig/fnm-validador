import React, { useState } from 'react';
import { X, Server, Check, Wifi, RotateCcw } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, apiUrl, onSaveApiUrl }) {
  const [url, setUrl] = useState(apiUrl);

  if (!isOpen) return null;

  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const currentHost = (typeof window !== 'undefined' && window.location.hostname) || 'localhost';
  const autoDetectedUrl = isHttps ? '' : `http://${currentHost}:6100`;
  const localhostUrl = isHttps ? '' : 'http://localhost:6100';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveApiUrl(url);
    onClose();
  };

  const handleApplyPreset = (presetUrl) => {
    setUrl(presetUrl);
    onSaveApiUrl(presetUrl);
    onClose();
  };

  const handleResetToAuto = () => {
    localStorage.removeItem('validator_api_url');
    setUrl('');
    onSaveApiUrl('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(12, 10, 12, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '1.75rem',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Server size={22} color="var(--brand-gold)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Configurar Servidor API
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Presets Section */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}
        >
          <span
            style={{
              fontSize: '0.78rem',
              color: 'var(--brand-gold)',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              marginBottom: '0.65rem',
              textTransform: 'uppercase'
            }}
          >
            <Wifi size={15} /> Selección Rápida (1-Clic):
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleApplyPreset('')}
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.14)',
                color: '#86efac',
                border: '1px solid rgba(34, 197, 94, 0.35)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem 0.85rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'inherit'
              }}
            >
              <span>🛡️ Proxy HTTPS Automático (Recomendado)</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>Sin bloqueo</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset(autoDetectedUrl)}
              style={{
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--brand-gold)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem 0.85rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'inherit'
              }}
            >
              <span>
                📍 Conexión Directa IP: <strong>{currentHost}</strong>
              </span>
              <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>:6100</span>
            </button>

            {currentHost !== 'localhost' && currentHost !== '127.0.0.1' && (
              <button
                type="button"
                onClick={() => handleApplyPreset(localhostUrl)}
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.55rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit'
                }}
              >
                💻 Servidor Local (http://localhost:6100)
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem' }}>
            Ingreso Manual de IP o Dominio:
          </label>
          <input
            type="text"
            className="form-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Dejar en blanco para Proxy o ej: http://localhost:6100"
            style={{
              fontFamily: 'monospace',
              marginBottom: '0.5rem'
            }}
          />
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            💡 <strong>Tip:</strong> Dejá el campo vacío o usá "Proxy HTTPS Automático" cuando navegues desde un celular por HTTPS.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleResetToAuto}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: 'none',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.4rem 0',
                fontFamily: 'inherit'
              }}
              title="Restablecer detección automática predeterminada"
            >
              <RotateCcw size={14} /> Auto-detectar
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                <Check size={17} /> Guardar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
