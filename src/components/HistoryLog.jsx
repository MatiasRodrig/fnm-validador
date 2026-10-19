import React from 'react';
import { History, CheckCircle, XCircle, AlertCircle, Trash2, Calendar } from 'lucide-react';

export default function HistoryLog({ history, onClear }) {
  if (!history || history.length === 0) {
    return (
      <div
        className="card-glass"
        style={{
          padding: '1.15rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem'
        }}
      >
        Sin escaneos registrados en esta sesión
      </div>
    );
  }

  const validCount = history.filter((h) => h.status === 'VALIDATED').length;
  const duplicateCount = history.filter((h) => h.status === 'ALREADY_USED').length;
  const wrongDayCount = history.filter((h) => h.status === 'WRONG_DAY').length;
  const checkOnlyCount = history.filter((h) => h.status === 'CHECK_ONLY').length;

  return (
    <div className="card-glass" style={{ padding: '1.25rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.85rem',
          flexWrap: 'wrap',
          gap: '0.6rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={18} color="var(--brand-gold)" />
          <h3
            style={{
              fontSize: '0.92rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Registro de Sesión ({history.length})
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.76rem', fontWeight: 800, flexWrap: 'wrap' }}>
          <span style={{ color: '#4ade80' }}>🟢 {validCount} quemados</span>
          {wrongDayCount > 0 && <span style={{ color: 'var(--brand-gold)' }}>🟠 {wrongDayCount} otro día</span>}
          <span style={{ color: '#f87171' }}>🔴 {duplicateCount} ya usados</span>
          {checkOnlyCount > 0 && <span style={{ color: '#38bdf8' }}>🔍 {checkOnlyCount} consultas</span>}
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.22rem 0.55rem', fontSize: '0.72rem' }}
              title="Limpiar historial de pantalla"
            >
              <Trash2 size={12} /> Limpiar
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
        {history.map((item, index) => {
          const isValid = item.status === 'VALIDATED';
          const isUsed = item.status === 'ALREADY_USED';
          const isWrongDay = item.status === 'WRONG_DAY';
          const isCheckOnly = item.status === 'CHECK_ONLY';
          const eventDayTitle = item.ticket?.eventDay || item.ticket?.EventDay;
          const sectorName = item.ticket?.sector || item.ticket?.Sector;
          const buyerName = item.ticket?.buyerFullName || item.ticket?.BuyerFullName;

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isCheckOnly
                  ? 'rgba(56, 189, 248, 0.12)'
                  : isValid
                  ? 'rgba(34, 197, 94, 0.12)'
                  : isWrongDay
                  ? 'rgba(249, 120, 4, 0.15)'
                  : isUsed
                  ? 'rgba(239, 68, 68, 0.14)'
                  : 'rgba(252, 170, 1, 0.1)',
                border: isCheckOnly
                  ? '1px solid rgba(56, 189, 248, 0.3)'
                  : isValid
                  ? '1px solid rgba(34, 197, 94, 0.25)'
                  : isWrongDay
                  ? '1px solid rgba(249, 120, 4, 0.4)'
                  : isUsed
                  ? '1px solid rgba(239, 68, 68, 0.3)'
                  : '1px solid rgba(252, 170, 1, 0.25)',
                fontSize: '0.85rem',
                gap: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                {isCheckOnly ? (
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>🔍</span>
                ) : isValid ? (
                  <CheckCircle size={17} color="#4ade80" style={{ flexShrink: 0 }} />
                ) : isWrongDay ? (
                  <Calendar size={17} color="var(--brand-gold)" style={{ flexShrink: 0 }} />
                ) : isUsed ? (
                  <XCircle size={17} color="#f87171" style={{ flexShrink: 0 }} />
                ) : (
                  <AlertCircle size={17} color="var(--brand-gold)" style={{ flexShrink: 0 }} />
                )}
                <div style={{ minWidth: 0 }}>
                  <strong
                    style={{
                      color: 'var(--text-primary)',
                      display: 'block',
                      fontSize: '0.88rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {item.ticket
                      ? `${eventDayTitle || item.ticket.productName || 'Entrada'}${sectorName ? ` · ${sectorName}` : ''}${
                          buyerName ? ` (${buyerName})` : ''
                        }`
                      : item.token}
                  </strong>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      color: isCheckOnly ? '#7dd3fc' : isWrongDay ? 'var(--brand-gold)' : 'var(--text-secondary)',
                      fontFamily: 'monospace'
                    }}
                  >
                    {isCheckOnly
                      ? `Consulta · ${item.token}`
                      : isWrongDay
                      ? `Día no corresponde (${eventDayTitle || 'Otro día'}) — QR Intacto`
                      : item.token}
                  </span>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', flexShrink: 0 }}>
                {item.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
