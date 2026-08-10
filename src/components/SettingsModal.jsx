import React, { useState } from 'react';
import { Settings, X, Server, Check, Wifi, RotateCcw, Shield } from 'lucide-react';

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
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem'
    }}>
      <div className="card-glass" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '1.5rem',
        borderRadius: '1.5rem',
        border: '1px solid rgba(255,255,255,0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server size={22} color="#6366f1" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f3f4f6' }}>Configurar Servidor API</h3>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Quick Presets Section */}
        <div style={{
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '1rem',
          padding: '1rem',
          marginBottom: '1.25rem'
        }}>
          <span style={{ fontSize: '0.8rem', color: '#a5b4fc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.6rem' }}>
            <Wifi size={16} /> SELECCIÓN RÁPIDA (1-CLIC):
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleApplyPreset('')}
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '0.65rem',
                padding: '0.6rem 0.85rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>🛡️ Proxy HTTPS Automático (Recomendado)</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Sin bloqueo</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset(autoDetectedUrl)}
              style={{
                backgroundColor: '#1e1b4b',
                color: '#818cf8',
                border: '1px solid #4338ca',
                borderRadius: '0.65rem',
                padding: '0.6rem 0.85rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>📍 Conexión Directa IP: <strong>{currentHost}</strong></span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>:6100</span>
            </button>

            {currentHost !== 'localhost' && currentHost !== '127.0.0.1' && (
              <button
                type="button"
                onClick={() => handleApplyPreset(localhostUrl)}
                style={{
                  backgroundColor: '#1f2937',
                  color: '#d1d5db',
                  border: '1px solid #374151',
                  borderRadius: '0.65rem',
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                💻 Servidor Local (http://localhost:6100)
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.4rem', fontWeight: 600 }}>
            Ingreso Manual de IP o Dominio:
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Dejar en blanco para Proxy o ej: 10.79.80.242"
            style={{
              width: '100%',
              backgroundColor: '#030712',
              border: '1px solid #374151',
              borderRadius: '0.75rem',
              color: '#ffffff',
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              fontFamily: 'monospace',
              outline: 'none',
              marginBottom: '0.4rem'
            }}
          />
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1.25rem' }}>
            💡 <strong>Tip:</strong> Deja el campo vacío o usa "Proxy HTTPS Automático" cuando navegues desde un celular por HTTPS para evitar bloqueos por contenido mixto.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleResetToAuto}
              style={{
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: 'none',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.4rem 0'
              }}
              title="Restablecer detección automática predeterminada"
            >
              <RotateCcw size={14} /> Auto-detectar
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  backgroundColor: '#1f2937',
                  color: '#d1d5db',
                  border: 'none',
                  borderRadius: '0.75rem',
                  padding: '0.65rem 1rem',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.75rem',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Check size={18} /> Guardar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
