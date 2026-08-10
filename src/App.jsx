import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Settings, Smartphone, Search, Zap, UserCheck, LogOut, Camera } from 'lucide-react';
import Scanner from './components/Scanner';
import ResultCard from './components/ResultCard';
import HistoryLog from './components/HistoryLog';
import SettingsModal from './components/SettingsModal';
import LoginView from './components/LoginView';
import { playBeep } from './utils/audio';
import { getDefaultApiUrl, formatApiUrlForFetch } from './utils/urlHelper';

export default function App() {
  const [apiUrl, setApiUrl] = useState(getDefaultApiUrl());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckOnly, setIsCheckOnly] = useState(false);
  const [history, setHistory] = useState([]);
  const lastScannedRef = useRef({ token: '', time: 0 });

  // User authentication session
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('validator_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('validator_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('validator_user');
    setResult(null);
    setHistory([]);
  };

  const handleSaveApiUrl = (newUrl) => {
    let formatted = newUrl.trim().replace(/\/+$/, '');
    if (!formatted) {
      setApiUrl('');
      localStorage.setItem('validator_api_url', '');
      return;
    }

    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = `http://${formatted}`;
    }

    try {
      const urlObj = new URL(formatted);
      if (!urlObj.port) {
        urlObj.port = '5294';
        formatted = urlObj.toString().replace(/\/+$/, '');
      }
    } catch (e) {}

    setApiUrl(formatted);
    localStorage.setItem('validator_api_url', formatted);
  };

  const verifyToken = async (scannedText) => {
    if (!scannedText || isProcessing) return;

    let cleanToken = scannedText.trim().toUpperCase();

    // Parse URL parameter if full URL scanned
    if (cleanToken.startsWith('HTTP://') || cleanToken.startsWith('HTTPS://')) {
      try {
        const urlObj = new URL(cleanToken);
        const tok = urlObj.searchParams.get('token') || urlObj.searchParams.get('t');
        if (tok) cleanToken = tok.toUpperCase();
      } catch (e) {}
    }

    // Parse TOKEN|PRODUCT format
    if (cleanToken.includes('|')) {
      cleanToken = cleanToken.split('|')[0].trim();
    }

    // Parse JSON format
    if (cleanToken.startsWith('{') && cleanToken.includes('TOKEN')) {
      try {
        const parsed = JSON.parse(cleanToken);
        if (parsed.token) cleanToken = parsed.token.toUpperCase();
      } catch (e) {}
    }

    // Fix Spanish keyboard mapping shifts for '-'
    cleanToken = cleanToken
      .replace('TKT/', 'TKT-')
      .replace("TKT'", 'TKT-')
      .replace('TKT_', 'TKT-')
      .replace('TKT.', 'TKT-')
      .replace('PTK/', 'PTK-')
      .replace("PTK'", 'PTK-')
      .replace('PTK_', 'PTK-')
      .replace('PTK.', 'PTK-')
      .replace('EVT/', 'EVT-')
      .replace("EVT'", 'EVT-')
      .replace('EVT_', 'EVT-')
      .replace('EVT.', 'EVT-');

    // Regex match (TKT|PTK|EVT)-XXXXXXXXXXXX or hex payload
    const prefixMatch = cleanToken.match(/(TKT|PTK|EVT)-[0-9A-F]{12,32}/);
    if (prefixMatch) {
      cleanToken = prefixMatch[0];
    } else {
      const hexMatch = cleanToken.match(/[0-9A-F]{12,32}/);
      if (hexMatch) {
        cleanToken = hexMatch[0].length === 12 ? `TKT-${hexMatch[0]}` : hexMatch[0];
      }
    }

    // Cooldown check for camera continuous scanning (4 second debounce per same token)
    const now = Date.now();
    if (lastScannedRef.current.token === cleanToken && now - lastScannedRef.current.time < 4000) {
      return;
    }
    lastScannedRef.current = { token: cleanToken, time: now };

    setIsProcessing(true);

    const scannedByUsername = currentUser ? (currentUser.username || currentUser.fullName) : 'AppValidador';

    try {
      const formattedApiUrl = formatApiUrlForFetch(apiUrl);
      const response = await fetch(`${formattedApiUrl}/api/print-jobs/validate-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scannedData: cleanToken,
          scannedBy: scannedByUsername,
          checkOnly: isCheckOnly
        })
      });

      const data = await response.json();
      const nowTime = new Date().toLocaleTimeString();

      if (response.ok && data.status === 'CHECK_ONLY') {
        // NON-DESTRUCTIVE INSPECTION MODE (Blue/Purple)
        setResult(data);
        playBeep('success');
        setHistory((prev) => [
          {
            status: 'CHECK_ONLY',
            ticket: data.ticket,
            token: cleanToken,
            time: nowTime
          },
          ...prev
        ]);
      } else if (response.ok && data.success) {
        // VALIDATED TICKET (Green)
        setResult(data);
        playBeep('success');
        setHistory((prev) => [
          {
            status: 'VALIDATED',
            ticket: data.ticket,
            token: cleanToken,
            time: nowTime
          },
          ...prev
        ]);
      } else if (data.status === 'NOT_SOLD') {
        // PRE-PRINTED UNSOLD TICKET (Orange)
        setResult(data);
        playBeep('error');
        setHistory((prev) => [
          {
            status: 'NOT_SOLD',
            ticket: data.ticket,
            token: cleanToken,
            time: nowTime
          },
          ...prev
        ]);
      } else if (response.status === 409) {
        // ALREADY USED TICKET (Red)
        setResult(data);
        playBeep('already_used');
        setHistory((prev) => [
          {
            status: 'ALREADY_USED',
            ticket: data.ticket,
            token: cleanToken,
            time: nowTime
          },
          ...prev
        ]);
      } else {
        // INVALID / NOT FOUND (Yellow)
        const invalidRes = {
          status: 'INVALID',
          message: data.message || 'Ticket NO ENCONTRADO o adulterado.',
          token: cleanToken
        };
        setResult(invalidRes);
        playBeep('error');
        setHistory((prev) => [
          {
            status: 'INVALID',
            token: cleanToken,
            time: nowTime
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error('Network / API Error:', err);
      const errRes = {
        status: 'ERROR',
        message: `Error al conectar con la API (${apiUrl}). Verifique la URL en la configuración.`,
        token: cleanToken
      };
      setResult(errRes);
      playBeep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    setResult(null);
  };

  // If user is not authenticated, render LoginView
  if (!currentUser) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 0',
            borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex' }}>
              <ShieldCheck size={26} color="#6366f1" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
                VALENT - FNDLM 2026
              </h1>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                Sistema de Escaneo de Entradas y Cantina
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            style={{
              backgroundColor: '#1f2937',
              color: '#9ca3af',
              border: '1px solid #374151',
              borderRadius: '0.75rem',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex'
            }}
            title="Configurar servidor API"
          >
            <Settings size={20} />
          </button>
        </header>

        <LoginView apiUrl={apiUrl} onLoginSuccess={handleLoginSuccess} />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          apiUrl={apiUrl}
          onSaveApiUrl={handleSaveApiUrl}
        />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 0',
          marginBottom: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          gap: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              padding: '0.5rem',
              borderRadius: '0.75rem',
              display: 'flex'
            }}
          >
            <ShieldCheck size={26} color="#6366f1" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
              VALENT - FNDLM 2026
            </h1>
            <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
              <Camera size={12} color="#10b981" /> Modo Exclusivo Cámara
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Active User Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '0.75rem',
              padding: '0.35rem 0.65rem',
              fontSize: '0.78rem',
              color: '#e5e7eb'
            }}
            title={`Rol: ${currentUser.role || 'Validador'}`}
          >
            <UserCheck size={14} color="#6366f1" />
            <span style={{ fontWeight: 700 }}>{currentUser.username}</span>
            <span style={{ fontSize: '0.7rem', color: '#9ca3af', backgroundColor: '#111827', padding: '0.1rem 0.35rem', borderRadius: '0.4rem' }}>
              {currentUser.role}
            </span>
          </div>

          {/* Action Mode Toggle: Ingreso vs Consulta */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#111827',
              border: isCheckOnly ? '1px solid rgba(99,102,241,0.6)' : '1px solid #374151',
              borderRadius: '0.75rem',
              padding: '0.2rem'
            }}
          >
            <button
              onClick={() => setIsCheckOnly(false)}
              style={{
                backgroundColor: !isCheckOnly ? '#10b981' : 'transparent',
                color: !isCheckOnly ? '#ffffff' : '#9ca3af',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.35rem 0.65rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
              title="Modo Ingreso: Válida el acceso y marca el ticket como USADO en la base de datos"
            >
              <Zap size={14} /> Ingreso
            </button>
            <button
              onClick={() => setIsCheckOnly(true)}
              style={{
                backgroundColor: isCheckOnly ? '#6366f1' : 'transparent',
                color: isCheckOnly ? '#ffffff' : '#9ca3af',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.35rem 0.65rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
              title="Modo Consulta: Verifica validez del QR sin quemar ni modificar el registro"
            >
              <Search size={14} /> Consulta
            </button>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            style={{
              backgroundColor: '#1f2937',
              color: '#9ca3af',
              border: '1px solid #374151',
              borderRadius: '0.75rem',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex'
            }}
            title="Configurar servidor API"
          >
            <Settings size={20} />
          </button>

          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.75rem',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex'
            }}
            title="Cerrar sesión validador"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area (Camera Scan Only) */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ResultCard result={result} />
        <Scanner onVerifyToken={verifyToken} isProcessing={isProcessing} />
        <HistoryLog history={history} onClear={handleClearHistory} />
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiUrl={apiUrl}
        onSaveApiUrl={handleSaveApiUrl}
      />
    </div>
  );
}
