import React from 'react';
import {
  Barcode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  History,
  Activity,
  Trash2,
  DollarSign,
  Hash,
  Clock,
  Zap
} from 'lucide-react';

export default function StationView({
  result,
  onVerifyToken,
  isProcessing,
  history,
  onClearHistory
}) {
  const validCount = history.filter((h) => h.status === 'VALIDATED').length;
  const duplicateCount = history.filter((h) => h.status === 'ALREADY_USED').length;
  const invalidCount = history.filter((h) => h.status === 'INVALID' || h.status === 'ERROR').length;
  const totalCount = history.length;

  return (
    <div className="station-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', flex: 1 }}>
      {/* Top Station Bar: Status & Hardware Indicator */}
      <div
        className="card-glass"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}
      >
        {/* Hardware Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              position: 'relative',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 12px #10b981'
            }}
          >
            <span
              style={{
                position: 'absolute',
                inset: '-4px',
                borderRadius: '50%',
                border: '2px solid #10b981',
                animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
              }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>
              <Zap size={18} color="#6366f1" /> ESTACIÓN KIOSCO — LECTOR DE CÓDIGO DE BARRAS ACTIVO
            </div>
            <span style={{ fontSize: '0.825rem', color: '#9ca3af' }}>
              Escaneo directo automático vía Lector de Código de Barras (USB / Bluetooth HID)
            </span>
          </div>
        </div>
      </div>

      {/* Main Kiosk Grid: Result Banner (Left/Top) & Metrics (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Large Result Display Kiosk Card */}
        <div style={{ gridColumn: 'span 2 / span 2' }}>
          {!result ? (
            <div
              className="card-glass"
              style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '340px',
                border: '2px dashed rgba(99, 102, 241, 0.3)',
                background: 'rgba(15, 23, 42, 0.6)'
              }}
            >
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  boxShadow: '0 0 30px rgba(99, 102, 241, 0.2)'
                }}
              >
                <Barcode size={48} color="#818cf8" />
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#f3f4f6', marginBottom: '0.5rem' }}>
                LISTO PARA SIGUIENTE TICKET
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '1.1rem', maxWidth: '480px' }}>
                Pase el código de barras del ticket por el lector USB / Bluetooth. El ticket se validará automáticamente.
              </p>
            </div>
          ) : result.status === 'VALIDATED' ? (
            <div
              className="card-glass glow-success"
              style={{
                padding: '2.5rem 2rem',
                textAlign: 'center',
                borderRadius: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '340px'
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  padding: '1rem',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16,185,129,0.25)',
                  marginBottom: '1rem'
                }}
              >
                <CheckCircle2 size={64} color="#10b981" />
              </div>

              <div
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '1rem',
                  letterSpacing: '0.1em',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '2rem',
                  display: 'inline-block',
                  marginBottom: '1.25rem',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 15px rgba(5, 150, 105, 0.4)'
                }}
              >
                ✅ TICKET VÁLIDO — QUEMADO EXITOSAMENTE
              </div>

              {result.ticket && (
                <div style={{ marginBottom: '1.5rem', width: '100%' }}>
                  <h1
                    style={{
                      fontSize: '2.75rem',
                      fontWeight: 900,
                      color: '#ffffff',
                      lineHeight: 1.1,
                      marginBottom: '0.75rem',
                      textShadow: '0 4px 12px rgba(0,0,0,0.6)'
                    }}
                  >
                    {result.ticket.productName}
                  </h1>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      padding: '0.4rem 1.2rem',
                      borderRadius: '1rem',
                      color: '#34d399',
                      fontWeight: 800,
                      fontSize: '1.5rem'
                    }}
                  >
                    <DollarSign size={22} />
                    {result.ticket.price}
                  </div>
                </div>
              )}

              {result.ticket && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.45)',
                    padding: '1.25rem',
                    borderRadius: '1.25rem',
                    textAlign: 'left',
                    fontSize: '0.95rem',
                    color: '#d1d5db',
                    width: '100%',
                    maxWidth: '650px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Hash size={18} color="#9ca3af" />
                    <span>
                      Ticket ID: <strong style={{ color: '#fff', fontSize: '1.1rem' }}>#{result.ticket.id}</strong>
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={18} color="#9ca3af" />
                    <span>
                      Impresión:{' '}
                      <strong style={{ color: '#fff' }}>
                        {result.ticket.printedAt ? new Date(result.ticket.printedAt).toLocaleTimeString() : '-'}
                      </strong>
                    </span>
                  </div>
                  <div
                    style={{
                      gridColumn: '1 / -1',
                      fontSize: '0.85rem',
                      color: '#9ca3af',
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      paddingTop: '0.6rem'
                    }}
                  >
                    Token: <span style={{ fontFamily: 'monospace', color: '#a7f3d0', fontSize: '0.95rem' }}>{result.ticket.token}</span>
                  </div>
                </div>
              )}
            </div>
          ) : result.status === 'ALREADY_USED' ? (
            <div
              className="card-glass glow-danger"
              style={{
                padding: '2.5rem 2rem',
                textAlign: 'center',
                borderRadius: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '340px'
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  padding: '1rem',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239,68,68,0.25)',
                  marginBottom: '1rem'
                }}
              >
                <AlertTriangle size={64} color="#ef4444" />
              </div>

              <div
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  letterSpacing: '0.1em',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '2rem',
                  display: 'inline-block',
                  marginBottom: '1.25rem',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 20px rgba(220, 38, 38, 0.5)'
                }}
              >
                🛑 ¡ALERTA! TICKET YA FUE QUEMADO / USADO
              </div>

              <p style={{ color: '#fca5a5', fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                {result.message}
              </p>

              {result.ticket && (
                <div
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.55)',
                    padding: '1.25rem',
                    borderRadius: '1.25rem',
                    textAlign: 'left',
                    fontSize: '0.95rem',
                    color: '#f8fafc',
                    width: '100%',
                    maxWidth: '650px'
                  }}
                >
                  <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#fca5a5', marginBottom: '0.5rem' }}>
                    {result.ticket.productName}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div>
                      <strong>Ticket ID:</strong> #{result.ticket.id}
                    </div>
                    <div>
                      <strong>Usado previamente el:</strong>{' '}
                      {result.usedAt || result.ticket.usedAt
                        ? new Date(result.usedAt || result.ticket.usedAt).toLocaleString()
                        : 'Previamente marcado'}
                    </div>
                    {(result.usedBy || result.ticket.usedByUsername) && (
                      <div>
                        <strong>Validado por:</strong> {result.usedBy || result.ticket.usedByUsername}
                      </div>
                    )}
                    <div style={{ fontFamily: 'monospace', color: '#9ca3af', marginTop: '0.4rem', fontSize: '0.85rem' }}>
                      Token: {result.ticket.token}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* INVALID / ERROR */
            <div
              className="card-glass glow-warning"
              style={{
                padding: '2.5rem 2rem',
                textAlign: 'center',
                borderRadius: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '340px'
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  padding: '1rem',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(245,158,11,0.25)',
                  marginBottom: '1rem'
                }}
              >
                <XCircle size={64} color="#f59e0b" />
              </div>

              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fbbf24', marginBottom: '0.75rem' }}>
                TICKET INVÁLIDO O NO ENCONTRADO
              </h2>
              <p style={{ color: '#fef3c7', fontSize: '1.2rem', fontWeight: 700, maxWidth: '550px' }}>
                {result.message || 'No se encontró este ticket en el sistema o el código fue adulterado.'}
              </p>
            </div>
          )}
        </div>

        {/* Real-time Session Metrics Card */}
        <div className="card-glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.1rem', color: '#ffffff' }}>
                <Activity size={20} color="#6366f1" /> MÉTRICAS DE ESTACIÓN
              </div>
              {onClearHistory && (
                <button
                  onClick={onClearHistory}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '0.5rem',
                    padding: '0.35rem 0.65rem',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                  title="Reiniciar contadores de sesión"
                >
                  <Trash2 size={14} /> Limpiar
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              {/* Valid Count */}
              <div
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '1rem',
                  padding: '1rem',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>VÁLIDOS</span>
                <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#10b981', lineHeight: 1.1, marginTop: '0.2rem' }}>
                  {validCount}
                </div>
              </div>

              {/* Duplicate Count */}
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '1rem',
                  padding: '1rem',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase' }}>DUPLICADOS</span>
                <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#ef4444', lineHeight: 1.1, marginTop: '0.2rem' }}>
                  {duplicateCount}
                </div>
              </div>

              {/* Invalid Count */}
              <div
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '1rem',
                  padding: '1rem',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase' }}>INVÁLIDOS</span>
                <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1.1, marginTop: '0.2rem' }}>
                  {invalidCount}
                </div>
              </div>

              {/* Total Count */}
              <div
                style={{
                  backgroundColor: 'rgba(99, 102, 241, 0.12)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '1rem',
                  padding: '1rem',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '0.8rem', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL ESCANEOS</span>
                <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#818cf8', lineHeight: 1.1, marginTop: '0.2rem' }}>
                  {totalCount}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: 'rgba(0,0,0,0.3)', fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center' }}>
            💡 <strong>Tip para el operador:</strong> Mantenga la lectora enfocado en el área de ingreso. Cada lectura actualizará la pantalla al instante.
          </div>
        </div>
      </div>

      {/* Panoramic Session Scan History Table */}
      <div className="card-glass" style={{ padding: '1.5rem', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <History size={20} color="#9ca3af" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Historial de Escaneos de la Estación
            </h3>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
            Mostrando {history.length} escaneos recientes
          </span>
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280', fontSize: '0.95rem' }}>
            Sin escaneos registrados en esta sesión de la estación.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '280px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Hora</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Estado</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Producto / Ticket</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Token</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => {
                  const isValid = item.status === 'VALIDATED';
                  const isUsed = item.status === 'ALREADY_USED';

                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'
                      }}
                    >
                      <td style={{ padding: '0.75rem 1rem', color: '#9ca3af', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                        {item.time}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                        {isValid ? (
                          <span
                            style={{
                              backgroundColor: 'rgba(16, 185, 129, 0.2)',
                              color: '#34d399',
                              border: '1px solid rgba(16, 185, 129, 0.4)',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '1rem',
                              fontWeight: 800,
                              fontSize: '0.75rem'
                            }}
                          >
                            🟢 VÁLIDO
                          </span>
                        ) : isUsed ? (
                          <span
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.2)',
                              color: '#f87171',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '1rem',
                              fontWeight: 800,
                              fontSize: '0.75rem'
                            }}
                          >
                            🔴 DUPLICADO
                          </span>
                        ) : (
                          <span
                            style={{
                              backgroundColor: 'rgba(245, 158, 11, 0.2)',
                              color: '#fbbf24',
                              border: '1px solid rgba(245, 158, 11, 0.4)',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '1rem',
                              fontWeight: 800,
                              fontSize: '0.75rem'
                            }}
                          >
                            🟡 INVÁLIDO
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#ffffff', fontWeight: 700 }}>
                        {item.ticket ? (
                          <div>
                            <div>{item.ticket.productName}</div>
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 400 }}>
                              Ticket #{item.ticket.id}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>Ticket No Encontrado</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#a5b4fc', fontSize: '0.85rem' }}>
                        {item.token}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
