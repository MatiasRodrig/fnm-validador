import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Package, Hash, Clock, User, DollarSign } from 'lucide-react';

export default function ResultCard({ result }) {
  if (!result) {
    return (
      <div className="card-glass" style={{
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        marginBottom: '1.5rem',
        border: '1px border rgba(255,255,255,0.08)'
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem', opacity: 0.8 }}>📷</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f3f4f6', marginBottom: '0.5rem' }}>
          Listo para Escanear
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
          Apunte la cámara al código QR del ticket o use una lectora USB
        </p>
      </div>
    );
  }

  const { status, message, ticket, usedAt, usedBy, isSold, isUsed } = result;

  if (status === 'CHECK_ONLY') {
    const isUnsold = ticket?.isSold === false || isSold === false;
    const alreadyUsed = ticket?.isUsed === true || isUsed === true;

    return (
      <div className="card-glass" style={{
        padding: '1.75rem 1.5rem',
        textAlign: 'center',
        marginBottom: '1.5rem',
        borderRadius: '1.75rem',
        boxShadow: '0 0 25px rgba(99, 102, 241, 0.35)',
        border: '1px solid rgba(99, 102, 241, 0.4)'
      }}>
        <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.2)', marginBottom: '0.75rem' }}>
          <CheckCircle2 size={48} color="#818cf8" />
        </div>

        <div style={{
          backgroundColor: '#4f46e5',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: '0.85rem',
          letterSpacing: '0.075em',
          padding: '0.4rem 1rem',
          borderRadius: '2rem',
          display: 'inline-block',
          marginBottom: '1rem',
          textTransform: 'uppercase'
        }}>
          🔍 MODO CONSULTA: TICKET AUTÉNTICO (SIN QUEMAR QR)
        </div>

        {ticket && (
          <div style={{ marginBottom: '1.25rem' }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.1,
              marginBottom: '0.5rem'
            }}>
              {ticket.productName || `${ticket.eventDay} - ${ticket.sector}`}
            </h1>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {isUnsold && (
                <span style={{ backgroundColor: '#d97706', color: '#fff', fontWeight: 800, padding: '0.3rem 0.85rem', borderRadius: '1rem', fontSize: '0.85rem' }}>
                  ⛔ IMPRESA SIN VENDER
                </span>
              )}
              {alreadyUsed ? (
                <span style={{ backgroundColor: '#dc2626', color: '#fff', fontWeight: 800, padding: '0.3rem 0.85rem', borderRadius: '1rem', fontSize: '0.85rem' }}>
                  ⚠️ YA UTILIZADA
                </span>
              ) : !isUnsold && (
                <span style={{ backgroundColor: '#059669', color: '#fff', fontWeight: 800, padding: '0.3rem 0.85rem', borderRadius: '1rem', fontSize: '0.85rem' }}>
                  ✅ DISPONIBLE Y VÁLIDA
                </span>
              )}
            </div>
          </div>
        )}

        {ticket && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            padding: '1rem',
            borderRadius: '1rem',
            textAlign: 'left',
            fontSize: '0.85rem',
            color: '#d1d5db'
          }}>
            {ticket.buyerFullName && (
              <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={15} color="#9ca3af" />
                <span>Titular: <strong style={{ color: '#fff' }}>{ticket.buyerFullName}</strong></span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Hash size={15} color="#9ca3af" />
              <span>Token ID: <strong style={{ color: '#fff' }}>#{ticket.id}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <DollarSign size={15} color="#9ca3af" />
              <span>Precio: <strong style={{ color: '#34d399' }}>${ticket.pricePaid || ticket.price || 0}</strong></span>
            </div>
            <div style={{ gridColumn: 'span 2', fontSize: '0.75rem', color: '#9ca3af', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
              Token: <span style={{ fontFamily: 'monospace', color: '#c7d2fe' }}>{ticket.token}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (status === 'NOT_SOLD') {
    return (
      <div className="card-glass glow-warning" style={{
        padding: '1.75rem 1.5rem',
        textAlign: 'center',
        marginBottom: '1.5rem',
        borderRadius: '1.75rem',
        boxShadow: '0 0 25px rgba(245, 158, 11, 0.35)',
        border: '1px solid rgba(245, 158, 11, 0.4)'
      }}>
        <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.2)', marginBottom: '0.75rem' }}>
          <AlertTriangle size={52} color="#f59e0b" />
        </div>

        <div style={{
          backgroundColor: '#d97706',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: '0.85rem',
          letterSpacing: '0.075em',
          padding: '0.4rem 1rem',
          borderRadius: '2rem',
          display: 'inline-block',
          marginBottom: '1rem',
          textTransform: 'uppercase'
        }}>
          ⛔ ENTRADA IMPRESA NO VENDIDA
        </div>

        <p style={{ color: '#fef3c7', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
          {message || 'Esta entrada física aún no ha sido registrada como vendida. Acceso denegado.'}
        </p>

        {ticket && (
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '1rem',
            borderRadius: '1rem',
            textAlign: 'left',
            fontSize: '0.875rem',
            color: '#f8fafc'
          }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fbbf24', marginBottom: '0.5rem' }}>
              {ticket.eventDay} - {ticket.sector}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#d1d5db', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div><strong>Lote Imprenta:</strong> {ticket.physicalBatchCode || 'Sin especificar'}</div>
              <div><strong>Estado Venta:</strong> NO VENDIDA</div>
              <div style={{ fontFamily: 'monospace', color: '#9ca3af', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                Token: {ticket.token}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (status === 'VALIDATED') {
    return (
      <div className="card-glass glow-success" style={{
        padding: '1.75rem 1.5rem',
        textAlign: 'center',
        marginBottom: '1.5rem',
        borderRadius: '1.75rem'
      }}>
        <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.2)', marginBottom: '0.75rem' }}>
          <CheckCircle2 size={48} color="#10b981" />
        </div>

        <div style={{
          backgroundColor: '#059669',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: '0.85rem',
          letterSpacing: '0.075em',
          padding: '0.35rem 1rem',
          borderRadius: '2rem',
          display: 'inline-block',
          marginBottom: '1rem',
          textTransform: 'uppercase'
        }}>
          ✅ TICKET VÁLIDO — ENTREGAR PRODUCTO
        </div>

        {ticket && (
          <div style={{ marginBottom: '1.25rem' }}>
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.1,
              marginBottom: '0.5rem',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}>
              {ticket.productName}
            </h1>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'rgba(0,0,0,0.4)', padding: '0.35rem 0.85rem', borderRadius: '0.75rem', color: '#34d399', fontWeight: 700, fontSize: '1.2rem' }}>
              <DollarSign size={18} />
              {ticket.price}
            </div>
          </div>
        )}

        {ticket && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            padding: '1rem',
            borderRadius: '1rem',
            textAlign: 'left',
            fontSize: '0.85rem',
            color: '#d1d5db'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Hash size={15} color="#9ca3af" />
              <span>Ticket: <strong style={{ color: '#fff' }}>#{ticket.id}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={15} color="#9ca3af" />
              <span>Compuesto: <strong style={{ color: '#fff' }}>{ticket.printedAt ? new Date(ticket.printedAt).toLocaleTimeString() : '-'}</strong></span>
            </div>
            <div style={{ gridColumn: 'span 2', fontSize: '0.75rem', color: '#9ca3af', borderTop: '1px border rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
              Token: <span style={{ fontFamily: 'monospace', color: '#a7f3d0' }}>{ticket.token}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (status === 'ALREADY_USED') {
    return (
      <div className="card-glass glow-danger" style={{
        padding: '1.75rem 1.5rem',
        textAlign: 'center',
        marginBottom: '1.5rem',
        borderRadius: '1.75rem'
      }}>
        <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.2)', marginBottom: '0.75rem' }}>
          <AlertTriangle size={52} color="#ef4444" />
        </div>

        <div style={{
          backgroundColor: '#dc2626',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: '0.85rem',
          letterSpacing: '0.075em',
          padding: '0.4rem 1rem',
          borderRadius: '2rem',
          display: 'inline-block',
          marginBottom: '1rem',
          textTransform: 'uppercase'
        }}>
          🛑 ¡ALERTA! TICKET YA FUE USADO
        </div>

        <p style={{ color: '#fca5a5', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
          {message}
        </p>

        {ticket && (
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '1rem',
            borderRadius: '1rem',
            textAlign: 'left',
            fontSize: '0.875rem',
            color: '#f8fafc'
          }}>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#fca5a5', marginBottom: '0.5rem' }}>
              {ticket.productName}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#d1d5db', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div><strong>Ticket ID:</strong> #{ticket.id}</div>
              <div><strong>Usado previamente el:</strong> {(usedAt || ticket.usedAt) ? new Date(usedAt || ticket.usedAt).toLocaleString() : 'Previamente marcado'}</div>
              {(usedBy || ticket.usedByUsername) && <div><strong>Validado por:</strong> {usedBy || ticket.usedByUsername}</div>}
              <div style={{ fontFamily: 'monospace', color: '#9ca3af', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                Token: {ticket.token}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // INVALID / ERROR
  return (
    <div className="card-glass glow-warning" style={{
      padding: '1.75rem 1.5rem',
      textAlign: 'center',
      marginBottom: '1.5rem',
      borderRadius: '1.75rem'
    }}>
      <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', backgroundColor: 'rgba(245,158,11,0.2)', marginBottom: '0.75rem' }}>
        <XCircle size={48} color="#f59e0b" />
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24', marginBottom: '0.5rem' }}>
        TICKET INVÁLIDO
      </h2>
      <p style={{ color: '#fef3c7', fontSize: '1rem', fontWeight: 600 }}>
        {message || 'No se encontró este ticket en el sistema o el código fue adulterado.'}
      </p>
    </div>
  );
}
