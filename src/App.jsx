import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldCheck,
  Settings,
  Search,
  Zap,
  UserCheck,
  LogOut,
  Camera,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import Scanner from './components/Scanner';
import ResultCard from './components/ResultCard';
import HistoryLog from './components/HistoryLog';
import SettingsModal from './components/SettingsModal';
import LoginView from './components/LoginView';
import DaySelectorModal, { normalizeEventDay } from './components/DaySelectorModal';
import { playBeep } from './utils/audio';
import { getDefaultApiUrl, formatApiUrlForFetch } from './utils/urlHelper';
import { useBarcodeScanner } from './utils/useBarcodeScanner';
import logoImg from './assets/logo.png';

const isStaffUser = (user) => {
  if (!user) return false;
  const role = (user.role || user.Role || '').trim().toLowerCase();
  const username = (user.username || '').trim().toLowerCase();
  if (role === 'customer') return false;
  return (
    role.includes('admin') ||
    role.includes('cajer') ||
    role.includes('validador') ||
    role === 'cashier' ||
    username.startsWith('admin.') ||
    username.startsWith('cajero.')
  );
};

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

  // Active festival days from backend
  const [eventDays, setEventDays] = useState([]);
  const [loadingDays, setLoadingDays] = useState(false);

  // User authentication session (strictly staff only)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('validator_user');
      if (!savedUser) return null;
      const parsed = JSON.parse(savedUser);
      if (!isStaffUser(parsed)) {
        localStorage.removeItem('validator_user');
        return null;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  });

  // Assigned event day for ticket validation
  const [assignedEventDay, setAssignedEventDay] = useState(() => {
    try {
      const saved = localStorage.getItem('validator_assigned_event_day');
      if (!saved) return null;
      return normalizeEventDay(JSON.parse(saved));
    } catch (e) {
      return null;
    }
  });
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const assignedEventDayRef = useRef(assignedEventDay);

  useEffect(() => {
    assignedEventDayRef.current = assignedEventDay;
  }, [assignedEventDay]);

  const handleSelectDay = useCallback((day) => {
    const normalized = normalizeEventDay(day);
    setAssignedEventDay(normalized);
    assignedEventDayRef.current = normalized;
    if (normalized) {
      localStorage.setItem('validator_assigned_event_day', JSON.stringify(normalized));
      // Clear any previous NO_DAY warning when a valid day is chosen
      setResult((prev) => (prev && !prev.ticket && prev.status === 'INVALID' ? null : prev));
    } else {
      localStorage.removeItem('validator_assigned_event_day');
    }
  }, []);

  const fetchEventDays = useCallback(async () => {
    setLoadingDays(true);
    try {
      const formattedUrl = formatApiUrlForFetch(apiUrl);
      let rawList = [];
      const res = await fetch(`${formattedUrl}/api/ticket-validator/event-days`);
      if (res.ok) {
        rawList = await res.json();
      } else {
        const resEvents = await fetch(`${formattedUrl}/api/events`);
        if (resEvents.ok) {
          rawList = await resEvents.json();
        }
      }

      const normalizedList = (Array.isArray(rawList) ? rawList : [])
        .map(normalizeEventDay)
        .filter(Boolean);

      setEventDays(normalizedList);

      // Sync or validate currently assigned day against active server days
      if (normalizedList.length > 0 && assignedEventDayRef.current) {
        const matched = normalizedList.find((d) => d.id === assignedEventDayRef.current.id);
        if (matched) {
          setAssignedEventDay(matched);
          assignedEventDayRef.current = matched;
          localStorage.setItem('validator_assigned_event_day', JSON.stringify(matched));
        } else {
          // Saved day no longer exists in DB -> force operator to pick a valid day
          handleSelectDay(null);
          setIsDayModalOpen(true);
        }
      }
    } catch (e) {
      console.error('Error al obtener los días de la fiesta:', e);
    } finally {
      setLoadingDays(false);
    }
  }, [apiUrl, handleSelectDay]);

  useEffect(() => {
    if (currentUser) {
      fetchEventDays();
    }
  }, [currentUser, fetchEventDays]);

  // Prompt day selection modal if logged in but no day selected yet
  useEffect(() => {
    if (currentUser && !assignedEventDay) {
      setIsDayModalOpen(true);
    }
  }, [currentUser, assignedEventDay]);

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
  }, [currentUser, userIsAdmin, isCheckOnly]);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    currentUserRef.current = userData;
    localStorage.setItem('validator_user', JSON.stringify(userData));
    if (!isAdminUser(userData)) {
      setIsCheckOnly(false);
      isCheckOnlyRef.current = false;
    }
    if (!assignedEventDayRef.current) {
      setIsDayModalOpen(true);
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

    // Cooldown check for camera continuous scanning (3.5s for burn/validation, 1.2s for check-only)
    const currentCheckOnly = isCheckOnlyRef.current;
    const cooldownMs = currentCheckOnly ? 1200 : 3500;
    const now = Date.now();

    if (lastScannedRef.current.token === cleanToken && now - lastScannedRef.current.time < cooldownMs) {
      return;
    }
    lastScannedRef.current = { token: cleanToken, time: now };

    // Strictly require an assigned event day with a valid ID before scanning
    const activeDay = assignedEventDayRef.current;
    if (!activeDay || !activeDay.id) {
      setIsDayModalOpen(true);
      setResult({
        status: 'INVALID',
        message: '⚠️ Debe seleccionar el Día de la Fiesta antes de registrar o quemar tickets.'
      });
      playBeep('error');
      return;
    }

    setIsProcessing(true);

    const currentU = currentUserRef.current;
    const currentIsAdmin = isAdminUser(currentU);
    const scannedByUsername = currentU ? currentU.username || currentU.fullName : 'ValidadorOficial';

    try {
      const formattedApiUrl = formatApiUrlForFetch(apiUrl);
      const response = await fetch(`${formattedApiUrl}/api/print-jobs/validate-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scannedData: cleanToken,
          scannedBy: scannedByUsername,
          userRole: currentU?.role || currentU?.Role,
          adminUsername: currentIsAdmin ? currentU?.username : undefined,
          checkOnly: currentCheckOnly,
          eventDayId: Number(activeDay.id)
        })
      });

      const data = await response.json();
      const resStatus = data.status || data.Status;
      const resSuccess = data.success ?? data.Success;
      const resTicket = data.ticket || data.Ticket;
      const resMessage = data.message || data.Message;
      const nowTime = new Date().toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });

      const normalizedData = {
        ...data,
        status: resStatus,
        success: resSuccess,
        ticket: resTicket,
        message: resMessage
      };

      if (response.ok && resStatus === 'CHECK_ONLY') {
        setResult(normalizedData);
        playBeep('success');
        setHistory((prev) => [
          {
            status: 'CHECK_ONLY',
            ticket: resTicket,
            token: cleanToken,
            time: nowTime
          },
          ...prev
        ]);
      } else if (response.ok && resSuccess) {
        setResult({ ...normalizedData, status: 'VALIDATED' });
        playBeep('success');
        setHistory((prev) => [
          {
            status: 'VALIDATED',
            ticket: resTicket,
            token: cleanToken,
            time: nowTime
          },
          ...prev
        ]);
      } else if (resStatus === 'WRONG_DAY') {
        setResult({ ...normalizedData, status: 'WRONG_DAY' });
        playBeep('error');
        setHistory((prev) => [
          {
            status: 'WRONG_DAY',
            ticket: resTicket,
            token: cleanToken,
            time: nowTime
          },
          ...prev
        ]);
      } else if (resStatus === 'NOT_SOLD') {
        setResult({ ...normalizedData, status: 'NOT_SOLD' });
        playBeep('error');
        setHistory((prev) => [
          {
            status: 'NOT_SOLD',
            ticket: resTicket,
            token: cleanToken,
            time: nowTime
          },
          ...prev
        ]);
      } else if (response.status === 409 || resStatus === 'ALREADY_USED') {
        setResult({ ...normalizedData, status: 'ALREADY_USED' });
        playBeep('already_used');
        setHistory((prev) => [
          {
            status: 'ALREADY_USED',
            ticket: resTicket,
            token: cleanToken,
            time: nowTime
          },
          ...prev
        ]);
      } else if (response.status === 403) {
        const forbiddenRes = {
          status: 'INVALID',
          message: resMessage || 'El modo consulta es exclusivo para administradores.',
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
        const invalidRes = {
          status: 'INVALID',
          message: resMessage || 'Ticket NO ENCONTRADO o código QR inválido.',
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
        message: `Error al conectar con el servidor (${apiUrl || 'Proxy'}). Verifique la conexión.`,
        token: cleanToken
      };
      setResult(errRes);
      playBeep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Global USB / Bluetooth barcode & QR scanner listener
  useBarcodeScanner(
    verifyToken,
    Boolean(currentUser && !isDayModalOpen && !isSettingsOpen)
  );

  const handleClearHistory = () => {
    setHistory([]);
    setResult(null);
  };

  // ─── Unauthenticated View (Login) ───────────────────────────────────────────
  if (!currentUser) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.9rem 0',
            borderBottom: '1px solid var(--border)',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={logoImg}
              alt="Fiesta Nacional de la Madera"
              style={{
                height: '44px',
                width: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 10px rgba(252, 170, 1, 0.35))'
              }}
            />
            <div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                CONTROL DE ACCESOS OFICIAL
              </h1>
              <span style={{ fontSize: '0.74rem', color: 'var(--brand-gold)', fontWeight: 700 }}>
                41° Fiesta Nacional de la Madera · San Vicente
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.5rem' }}
            title="Configurar servidor API"
          >
            <Settings size={19} />
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

  // ─── Authenticated Official Validator View ──────────────────────────────────
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Top Official Navbar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 0',
          marginBottom: '1rem',
          borderBottom: '1px solid var(--border)',
          gap: '0.75rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={logoImg}
            alt="Fiesta Nacional de la Madera"
            style={{
              height: '46px',
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 10px rgba(252, 170, 1, 0.35))'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                REGISTRO DE TICKETS
              </h1>
              <span
                style={{
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  padding: '0.12rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(218, 71, 6, 0.2)',
                  border: '1px solid rgba(252, 170, 1, 0.35)',
                  color: 'var(--brand-gold)',
                  textTransform: 'uppercase'
                }}
              >
                Oficial
              </span>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                color: userIsAdmin && isCheckOnly ? 'var(--info)' : 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontWeight: 700,
                marginTop: '0.15rem'
              }}
            >
              {userIsAdmin && isCheckOnly ? (
                <>
                  <Search size={12} /> Modo Consulta Admin (Sin Quemar QR)
                </>
              ) : (
                <>
                  <Camera size={12} /> Modo Control de Ingreso (Quemado por Día)
                </>
              )}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Active Operator Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '0.38rem 0.7rem',
              fontSize: '0.78rem',
              color: 'var(--text-primary)'
            }}
            title={`Rol: ${currentUser.role || currentUser.Role || 'Validador'}`}
          >
            <UserCheck size={14} color="var(--brand-gold)" />
            <span style={{ fontWeight: 800 }}>{currentUser.username}</span>
            <span
              style={{
                fontSize: '0.68rem',
                color: 'var(--brand-gold)',
                backgroundColor: 'rgba(218, 71, 6, 0.18)',
                padding: '0.1rem 0.4rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700
              }}
            >
              {currentUser.role || currentUser.Role}
            </span>
          </div>

          {/* Action Mode Toggle: Only shown for ADMIN users */}
          {userIsAdmin ? (
            <div
              style={{
                display: 'flex',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '0.2rem'
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setIsCheckOnly(false);
                  isCheckOnlyRef.current = false;
                }}
                style={{
                  background: !isCheckOnly ? 'var(--accent-gradient)' : 'transparent',
                  color: !isCheckOnly ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.35rem 0.65rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontFamily: 'inherit'
                }}
                title="Modo Ingreso: Valida el acceso y quema el ticket del día seleccionado"
              >
                <Zap size={13} /> Quemar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCheckOnly(true);
                  isCheckOnlyRef.current = true;
                }}
                style={{
                  backgroundColor: isCheckOnly ? '#0284c7' : 'transparent',
                  color: isCheckOnly ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.35rem 0.65rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontFamily: 'inherit'
                }}
                title="Modo Consulta: Verifica validez del QR sin quemar el ticket (Exclusivo Admin)"
              >
                <Search size={13} /> Consulta
              </button>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.45rem' }}
            title="Configurar servidor API"
          >
            <Settings size={18} />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-danger btn-sm"
            style={{ padding: '0.45rem' }}
            title="Cerrar sesión del operador"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* ─── Official Event Day Selector Panel (First-Class Day Control) ─── */}
      <section
        className="card"
        style={{
          padding: '1.15rem 1.25rem',
          marginBottom: '1.25rem',
          border: assignedEventDay ? '1px solid rgba(252, 170, 1, 0.4)' : '2px solid rgba(239, 68, 68, 0.7)',
          background: assignedEventDay
            ? 'linear-gradient(135deg, rgba(33, 26, 30, 0.96) 0%, rgba(21, 18, 21, 0.96) 100%)'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.14) 0%, rgba(21, 18, 21, 0.96) 100%)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: eventDays.length > 0 ? '0.9rem' : 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                background: assignedEventDay ? 'rgba(218, 71, 6, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: assignedEventDay
                  ? '1px solid rgba(252, 170, 1, 0.4)'
                  : '1px solid rgba(239, 68, 68, 0.5)',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex'
              }}
            >
              {assignedEventDay ? (
                <Calendar size={20} color="var(--brand-gold)" />
              ) : (
                <AlertTriangle size={20} color="#f87171" />
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: assignedEventDay ? 'var(--brand-gold)' : '#fca5a5'
                  }}
                >
                  {assignedEventDay ? 'Día de la Fiesta Activo' : '⚠️ Selección Obligatoria'}
                </span>
                {assignedEventDay && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      background: 'rgba(34, 197, 94, 0.15)',
                      color: '#4ade80',
                      border: '1px solid rgba(34, 197, 94, 0.35)',
                      padding: '0.08rem 0.45rem',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    Filtro por Día Activo
                  </span>
                )}
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                {assignedEventDay
                  ? `${assignedEventDay.title}${
                      assignedEventDay.date
                        ? ` — ${new Date(assignedEventDay.date).toLocaleDateString('es-AR', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                            timeZone: 'America/Argentina/Buenos_Aires'
                          })}`
                        : ''
                    }`
                  : 'Seleccioná el día de la fiesta para habilitar el quemado'}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsDayModalOpen(true)}
              className={assignedEventDay ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
            >
              <Calendar size={14} />
              {assignedEventDay ? 'Cambiar Día' : 'Elegir Día'}
            </button>
          </div>
        </div>

        {/* Direct 1-Click Day Selector Pills */}
        {eventDays.length > 0 && (
          <div className="day-pills-grid">
            {eventDays.map((day) => {
              const isSelected = assignedEventDay?.id === day.id;
              const shortDate = day.date
                ? new Date(day.date).toLocaleDateString('es-AR', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                    timeZone: 'America/Argentina/Buenos_Aires'
                  })
                : '';

              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`day-pill-btn ${isSelected ? 'active' : ''}`}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        color: isSelected ? 'var(--brand-gold)' : 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {day.title}
                    </div>
                    {shortDate && (
                      <div
                        style={{
                          fontSize: '0.73rem',
                          color: 'var(--text-secondary)',
                          textTransform: 'capitalize'
                        }}
                      >
                        {shortDate}
                      </div>
                    )}
                  </div>
                  {isSelected && <CheckCircle2 size={17} color="var(--brand-gold)" style={{ flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ResultCard result={result} assignedDay={assignedEventDay} />
        <Scanner
          onVerifyToken={verifyToken}
          isProcessing={isProcessing}
          disabled={!assignedEventDay}
        />
        <HistoryLog history={history} onClear={handleClearHistory} />
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiUrl={apiUrl}
        onSaveApiUrl={handleSaveApiUrl}
      />

      {/* Day Selector Modal */}
      <DaySelectorModal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        assignedDay={assignedEventDay}
        onSelectDay={handleSelectDay}
        apiUrl={apiUrl}
        availableDays={eventDays}
        onRefreshDays={setEventDays}
        loadingDays={loadingDays}
        canDismiss={Boolean(assignedEventDay)}
      />
    </div>
  );
}
