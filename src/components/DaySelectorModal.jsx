import React, { useState, useEffect } from 'react';
import { Calendar, Check, X, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { formatApiUrlForFetch } from '../utils/urlHelper';

export function normalizeEventDay(d) {
  if (!d) return null;
  const rawId = d.id ?? d.Id;
  const id = Number(rawId);
  if (!id || Number.isNaN(id)) return null;
  return {
    id,
    title: d.title ?? d.Title ?? `Día ${id}`,
    date: d.date ?? d.Date ?? null
  };
}

export default function DaySelectorModal({
  isOpen,
  onClose,
  assignedDay,
  onSelectDay,
  apiUrl,
  availableDays = [],
  onRefreshDays,
  loadingDays = false,
  canDismiss = true
}) {
  const [days, setDays] = useState(availableDays);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDayId, setSelectedDayId] = useState(assignedDay ? assignedDay.id : null);

  useEffect(() => {
    if (assignedDay) {
      setSelectedDayId(assignedDay.id);
    }
  }, [assignedDay]);

  useEffect(() => {
    if (Array.isArray(availableDays) && availableDays.length > 0) {
      setDays(availableDays);
    }
  }, [availableDays]);

  useEffect(() => {
    if (isOpen) {
      loadEventDays();
    }
  }, [isOpen, apiUrl]);

  const loadEventDays = async () => {
    setLoading(true);
    setError(null);
    try {
      const formattedUrl = formatApiUrlForFetch(apiUrl);
      const res = await fetch(`${formattedUrl}/api/ticket-validator/event-days`);
      if (res.ok) {
        const data = await res.json();
        const normalized = (Array.isArray(data) ? data : [])
          .map(normalizeEventDay)
          .filter(Boolean);
        setDays(normalized);
        if (onRefreshDays) onRefreshDays(normalized);
      } else {
        const resEvents = await fetch(`${formattedUrl}/api/events`);
        if (resEvents.ok) {
          const eventsData = await resEvents.json();
          const normalized = (Array.isArray(eventsData) ? eventsData : [])
            .map(normalizeEventDay)
            .filter(Boolean);
          setDays(normalized);
          if (onRefreshDays) onRefreshDays(normalized);
        } else {
          setError('No se pudieron obtener los días de la fiesta desde el servidor.');
        }
      }
    } catch (err) {
      console.error('Error al cargar días de la fiesta en validador:', err);
      setError('Error de conexión al cargar los días de la fiesta.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleConfirm = (day) => {
    const target = day || days.find((d) => d.id === selectedDayId);
    if (!target) return;
    onSelectDay(target);
    onClose();
  };

  const isLoadingList = loading || loadingDays;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(12, 10, 12, 0.88)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        backdropFilter: 'blur(6px)'
      }}
    >
      <div
        className="card"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          maxWidth: '500px',
          width: '100%',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Top Brand Gradient Line */}
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

        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                background: 'rgba(218, 71, 6, 0.18)',
                border: '1px solid rgba(252, 170, 1, 0.35)',
                padding: '0.6rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex'
              }}
            >
              <Calendar size={24} color="var(--brand-gold)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                Seleccionar Día de la Fiesta
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>
                El validador solo quemará entradas correspondientes a la jornada elegida
              </p>
            </div>
          </div>

          {canDismiss && (
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
              title="Cerrar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.14)',
              border: '1px solid rgba(239, 68, 68, 0.45)',
              color: '#fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={loadEventDays}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Days List */}
        {isLoadingList ? (
          <div style={{ padding: '2.25rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <RefreshCw
              size={26}
              className="spin"
              style={{ margin: '0 auto 0.6rem', display: 'block', color: 'var(--brand-gold)' }}
            />
            <span>Cargando jornadas oficiales de la fiesta...</span>
          </div>
        ) : days.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: '0.75rem' }}>No se encontraron días activos configurados en el servidor.</p>
            <button type="button" onClick={loadEventDays} className="btn btn-secondary btn-sm">
              <RefreshCw size={14} /> Actualizar lista
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '340px', overflowY: 'auto' }}>
            {days.map((d) => {
              const isSelected = selectedDayId === d.id;
              const formattedDate = d.date
                ? new Date(d.date).toLocaleDateString('es-AR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })
                : '';

              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setSelectedDayId(d.id);
                    handleConfirm(d);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.15rem',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(164, 10, 35, 0.35) 0%, rgba(218, 71, 6, 0.35) 60%, rgba(252, 170, 1, 0.18) 100%)'
                      : 'var(--bg-elevated)',
                    border: isSelected ? '2px solid var(--brand-gold)' : '1px solid var(--border-light)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 0 20px rgba(218, 71, 6, 0.3)' : 'none'
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 900,
                        fontSize: '1.05rem',
                        color: isSelected ? 'var(--brand-gold)' : 'var(--text-primary)'
                      }}
                    >
                      {d.title}
                    </div>
                    {formattedDate && (
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          textTransform: 'capitalize',
                          marginTop: '0.15rem'
                        }}
                      >
                        📅 {formattedDate}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isSelected ? 'var(--brand-gold)' : 'rgba(255, 255, 255, 0.05)',
                      border: isSelected ? 'none' : '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isSelected ? '#0c0a0c' : 'transparent',
                      flexShrink: 0
                    }}
                  >
                    <Check size={16} strokeWidth={3} />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Security Notice */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}
        >
          <ShieldCheck size={18} color="var(--success)" style={{ flexShrink: 0 }} />
          <span>
            Protección activa: las entradas de otras fechas serán rechazadas en pantalla{' '}
            <strong style={{ color: 'var(--text-primary)' }}>sin quemar su código QR</strong>.
          </span>
        </div>
      </div>
    </div>
  );
}
