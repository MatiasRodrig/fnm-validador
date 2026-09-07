import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Settings, Smartphone, Search, Zap, UserCheck, LogOut, Camera } from 'lucide-react';
import Scanner from './components/Scanner';
import ResultCard from './components/ResultCard';
import HistoryLog from './components/HistoryLog';
import SettingsModal from './components/SettingsModal';
import LoginView from './components/LoginView';
import { playBeep } from './utils/audio';
import { getDefaultApiUrl, formatApiUrlForFetch } from './utils/urlHelper';

const isAdminUser = (user) => {
  if (!user) return false;
  const role = (user.role || user.Role || '').trim().toLowerCase();
  const username = (user.username || '').trim().toLowerCase();
  return (
    role === 'admin' ||
    role === 'admintecnico' ||
    role === 'adminentradas' ||
    role === 'admincantina' ||
    role.startsWith('admin') ||
    username.startsWith('admin.')
  );
};

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

  const isCheckOnlyRef = useRef(isCheckOnly);
  const currentUserRef = useRef(currentUser);

  useEffect(() => {
    isCheckOnlyRef.current = isCheckOnly;
  }, [isCheckOnly]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const userIsAdmin = isAdminUser(currentUser);

  // Ensure non-admin users cannot be in checkOnly mode
  useEffect(() => {
    if (!userIsAdmin && isCheckOnly) {
      setIsCheckOnly(false);
    }
  }, [currentUser, userIsAdmin]);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    currentUserRef.current = userData;
    localStorage.setItem('validator_user', JSON.stringify(userData));
    if (!isAdminUser(userData)) {
      setIsCheckOnly(false);
      isCheckOnlyRef.current = false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    currentUserRef.current = null;
    localStorage.removeItem('validator_user');
    setIsCheckOnly(false);
    isCheckOnlyRef.current = false;
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
      // Bug #13 fix: Do not force a port on HTTPS or production domains
      const isLocalHost = urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1';
      if (!urlObj.port && isLocalHost && urlObj.protocol === 'http:') {
        urlObj.port = '6100';
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

    // Cooldown check for camera continuous scanning (4s for burn/validation, 1.2s for check-only)
    const currentCheckOnly = isCheckOnlyRef.current;
    const cooldownMs = currentCheckOnly ? 1200 : 4000;
    const now = Date.now();

    if (lastScannedRef.current.token === cleanToken && now - lastScannedRef.current.time < cooldownMs) {
      return;
    }
    lastScannedRef.current = { token: cleanToken, time: now };

    setIsProcessing(true);

    const currentU = currentUserRef.current;
    const currentIsAdmin = isAdminUser(currentU);
    const scannedByUsername = currentU ? (currentU.username || currentU.fullName) : 'AppValidador';

    try {
      const formattedApiUrl = formatApiUrlForFetch(apiUrl);
      const response = await fetch(`${formattedApiUrl}/api/print-jobs/validate-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scannedData: cleanToken,
          scannedBy: scannedByUsername,
          userRole: currentU?.role,
          adminUsername: currentIsAdmin ? currentU?.username : undefined,
          checkOnly: currentCheckOnly
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
      } else if (response.status === 403) {
        // FORBIDDEN (Yellow/Orange)
        const forbiddenRes = {
          status: 'INVALID',
          message: data.message || 'El modo consulta es exclusivo para administradores.',
          token: cleanToken
        };
        setResult(forbiddenRes);
        playBeep('error');
        setHistory((prev) => [
          {
            status: 'INVALID',
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
              backgroundColor: userIsAdmin && isCheckOnly ? 'rgba(99, 102, 241, 0.25)' : 'rgba(16, 185, 129, 0.2)',
              padding: '0.5rem',
              borderRadius: '0.75rem',
              display: 'flex'
            }}
          >
            <ShieldCheck size={26} color={userIsAdmin && isCheckOnly ? '#818cf8' : '#10b981'} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
              VALENT - FNDLM 2026
            </h1>
            <span style={{ fontSize: '0.75rem', color: userIsAdmin && isCheckOnly ? '#a5b4fc' : '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
              {userIsAdmin && isCheckOnly ? (
                <>
                  <Search size={12} color="#a5b4fc" /> Modo Consulta Admin (Sin Quemar QR)
                </>
              ) : (
                <>
                  <Camera size={12} color="#10b981" /> Modo Ingreso (Validación / Quemado)
                </>
              )}
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

          {/* Action Mode Toggle: Only shown for ADMIN users */}
          {userIsAdmin ? (
            <div
              style={{
                display: 'flex',
                backgroundColor: '#111827',
                border: isCheckOnly ? '1px solid rgba(99,102,241,0.8)' : '1px solid #374151',
                borderRadius: '0.75rem',
                padding: '0.2rem'
              }}
            >
              <button
                onClick={() => {
                  setIsCheckOnly(false);
                  isCheckOnlyRef.current = false;
                }}
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
                onClick={() => {
                  setIsCheckOnly(true);
                  isCheckOnlyRef.current = true;
                }}
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
                title="Modo Consulta: Verifica validez del QR sin quemar ni modificar el registro (Exclusivo Admin)"
              >
                <Search size={14} /> Consulta
              </button>
            </div>
          ) : (
            /* Cashiers / Validators Mode Badge (Fixed to Validation Mode) */
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '0.75rem',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
              title="Operador de acceso: Validación directa y quemado de tickets"
            >
              <Zap size={14} /> Modo Ingreso
            </div>
          )}

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
