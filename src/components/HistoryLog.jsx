import React from 'react';
import { History, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function HistoryLog({ history, onClear }) {
  if (!history || history.length === 0) {
    return (
      <div className="card-glass" style={{ padding: '1rem', textAlign: 'center', color: '#6b7280', fontSize: '0.85rem' }}>
        Sin escaneos recientes en esta sesión
      </div>
    );
  }

  const validCount = history.filter(h => h.status === 'VALIDATED').length;
  const duplicateCount = history.filter(h => h.status === 'ALREADY_USED').length;
  const checkOnlyCount = history.filter(h => h.status === 'CHECK_ONLY').length;

  return (
    <div className="card-glass" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={18} color="#9ca3af" />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e5e7eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Historial de Sesión
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', fontWeight: 700, flexWrap: 'wrap' }}>
          <span style={{ color: '#34d399' }}>🟢 {validCount} quemados</span>
          <span style={{ color: '#f87171' }}>🔴 {duplicateCount} duplicados</span>
          {checkOnlyCount > 0 && <span style={{ color: '#818cf8' }}>🔍 {checkOnlyCount} consultas</span>}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
        {history.map((item, index) => {
          const isValid = item.status === 'VALIDATED';
          const isUsed = item.status === 'ALREADY_USED';
          const isCheckOnly = item.status === 'CHECK_ONLY';

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.85rem',
                borderRadius: '0.75rem',
                backgroundColor: isCheckOnly ? 'rgba(99, 102, 241, 0.12)' : isValid ? 'rgba(16, 185, 129, 0.1)' : isUsed ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.1)',
                border: isCheckOnly ? '1px solid rgba(99, 102, 241, 0.3)' : isValid ? '1px solid rgba(16, 185, 129, 0.2)' : isUsed ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(245, 158, 11, 0.2)',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isCheckOnly ? <span style={{ fontSize: '1rem' }}>🔍</span> : isValid ? <CheckCircle size={16} color="#34d399" /> : isUsed ? <XCircle size={16} color="#f87171" /> : <AlertCircle size={16} color="#fbbf24" />}
                <div>
                  <strong style={{ color: '#ffffff', display: 'block', fontSize: '0.9rem' }}>
                    {item.ticket ? (item.ticket.productName || item.ticket.eventDay || 'Entrada') : item.token}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: isCheckOnly ? '#a5b4fc' : '#9ca3af', fontFamily: 'monospace' }}>
                    {isCheckOnly ? 'Consulta (Sin Quemar)' : item.token}
                  </span>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                {item.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
