import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Hash,
  Clock,
  User,
  DollarSign,
  Calendar,
  MapPin,
  ShieldCheck,
  QrCode
} from 'lucide-react';

export default function ResultCard({ result, assignedDay }) {
  if (!result) {
    return (
      <div
        className="card-glass"
        style={{
          padding: '2.25rem 1.5rem',
          textAlign: 'center',
          marginBottom: '1.25rem',
          border: '1px solid var(--border-light)',
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(218, 71, 6, 0.14) 0%, rgba(33, 26, 30, 0.9) 80%)'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(218, 71, 6, 0.18)',
            border: '1px solid rgba(252, 170, 1, 0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.85rem',
            boxShadow: '0 0 24px rgba(218, 71, 6, 0.25)'
          }}
        >
          <QrCode size={32} color="var(--brand-gold)" />
        </div>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
          Puesto Listo para Registrar Tickets
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto' }}>
          Apuntá la cámara al código QR de la entrada o utilizá un lector conectado.
        </p>
        {assignedDay && (
          <div
            style={{
              marginTop: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(252, 170, 1, 0.12)',
              border: '1px solid rgba(252, 170, 1, 0.35)',
              color: 'var(--brand-gold)',
              fontSize: '0.8rem',
              fontWeight: 800
            }}
          >
            <Calendar size={14} />
            <span>Quemando exclusivamente tickets de: {assignedDay.title}</span>
          </div>
        )}
      </div>
    );
  }

  const { status, message, ticket, usedAt, usedBy, isSold, isUsed, isWrongDay } = result;
  const eventDayTitle = ticket?.eventDay || ticket?.EventDay;
  const eventDateRaw = ticket?.eventDate || ticket?.EventDate;
  const sectorName = ticket?.sector || ticket?.Sector;
  const sectorColor = ticket?.sectorColor || ticket?.SectorColor || 'var(--brand-orange)';
  const buyerFullName = ticket?.buyerFullName || ticket?.BuyerFullName;
  const buyerDni = ticket?.buyerDni || ticket?.BuyerDni;
  const seqNumber = ticket?.seqFormatted || ticket?.SeqFormatted || (ticket?.id ? `#${ticket.id}` : '');
  const isComplimentary = ticket?.isComplimentary || ticket?.IsComplimentary;
  const tokenStr = ticket?.token || ticket?.Token || result.token;

  if (status === 'CHECK_ONLY') {
    const isUnsold = ticket?.isSold === false || isSold === false;
    const alreadyUsed = ticket?.isUsed === true || isUsed === true;
    const wrongDayCheck = isWrongDay === true;
    const usedDate = ticket?.usedAt || usedAt;
    const usedOperator = ticket?.usedByUsername || ticket?.validatedBy || usedBy;

    return (
      <div
        className="card-glass"
        style={{
          padding: '1.75rem 1.5rem',
          textAlign: 'center',
          marginBottom: '1.25rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow:
            alreadyUsed || wrongDayCheck
              ? '0 0 28px rgba(249, 120, 4, 0.35)'
              : '0 0 28px rgba(56, 189, 248, 0.3)',
          border:
            alreadyUsed || wrongDayCheck
              ? '2px solid var(--brand-orange)'
              : '2px solid var(--info)'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '0.75rem',
            borderRadius: '50%',
            backgroundColor:
              alreadyUsed || wrongDayCheck ? 'rgba(249, 120, 4, 0.2)' : 'rgba(56, 189, 248, 0.18)',
            marginBottom: '0.75rem'
          }}
        >
          {alreadyUsed || wrongDayCheck ? (
            <AlertTriangle size={46} color="var(--brand-gold)" />
          ) : (
            <CheckCircle2 size={46} color="var(--info)" />
          )}
        </div>

        <div
          style={{
            backgroundColor: '#0284c7',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '0.82rem',
            letterSpacing: '0.07em',
            padding: '0.4rem 1.1rem',
            borderRadius: 'var(--radius-full)',
            display: 'inline-block',
            marginBottom: '0.85rem',
            textTransform: 'uppercase'
          }}
        >
          🔍 MODO CONSULTA ADMIN (SIN QUEMAR QR)
        </div>

        {ticket && (
          <div style={{ marginBottom: '1.2rem' }}>
            <h1
              style={{
                fontSize: '1.85rem',
                fontWeight: 900,
                color: 'var(--text-primary)',
                lineHeight: 1.15,
                marginBottom: '0.5rem'
              }}
            >
              {eventDayTitle ? `${eventDayTitle}${sectorName ? ` · ${sectorName}` : ''}` : ticket.productName || 'Ticket'}
            </h1>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {isUnsold && (
                <span
                  style={{
                    backgroundColor: '#d97706',
                    color: '#fff',
                    fontWeight: 800,
                    padding: '0.3rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.82rem'
                  }}
                >
                  ⛔ IMPRESA SIN VENDER
                </span>
              )}
              {wrongDayCheck && (
                <span
                  style={{
                    backgroundColor: '#ea580c',
                    color: '#fff',
                    fontWeight: 800,
                    padding: '0.3rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.82rem'
                  }}
                >
                  📅 CORRESPONDE A OTRO DÍA ({eventDayTitle})
                </span>
              )}
              {alreadyUsed ? (
                <span
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#fff',
                    fontWeight: 800,
                    padding: '0.3rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.82rem'
                  }}
                >
                  ⚠️ TICKET AUTÉNTICO PERO YA FUE USADO
                </span>
              ) : (
                !isUnsold && (
                  <span
                    style={{
                      backgroundColor: '#16a34a',
                      color: '#fff',
                      fontWeight: 800,
                      padding: '0.3rem 0.85rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.82rem'
                    }}
                  >
                    ✅ TICKET AUTÉNTICO Y DISPONIBLE (QR INTACTO)
                  </span>
                )
              )}
            </div>

            <p
              style={{
                color: 'var(--text-primary)',
                fontSize: '0.86rem',
                fontWeight: 600,
                marginTop: '0.75rem',
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid var(--border-light)',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-md)'
              }}
            >
              {message || 'Esta inspección NO quemó el código QR.'}
            </p>
          </div>
        )}

        {ticket && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.7rem',
              backgroundColor: 'rgba(12, 10, 12, 0.65)',
              border: '1px solid var(--border)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)'
            }}
          >
            {buyerFullName && (
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <User size={15} color="var(--brand-gold)" />
                <span>
                  Titular: <strong style={{ color: 'var(--text-primary)' }}>{buyerFullName}</strong>{' '}
                  {buyerDni ? `(DNI: ${buyerDni})` : ''}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Hash size={15} color="var(--brand-gold)" />
              <span>
                N° Ticket: <strong style={{ color: 'var(--text-primary)' }}>{seqNumber}</strong>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <DollarSign size={15} color="var(--brand-gold)" />
              <span>
                Valor:{' '}
                <strong style={{ color: 'var(--success)' }}>
                  {isComplimentary ? 'CORTESÍA' : `$${ticket.pricePaid ?? ticket.price ?? 0}`}
                </strong>
              </span>
            </div>
            {alreadyUsed && (usedDate || usedOperator) && (
              <div
                style={{
                  gridColumn: '1 / -1',
                  fontSize: '0.8rem',
                  color: '#fca5a5',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                {usedDate && (
                  <div>
                    <strong>Quemado el:</strong> {new Date(usedDate).toLocaleString('es-AR')}
                  </div>
                )}
                {usedOperator && (
                  <div>
                    <strong>Operador:</strong> {usedOperator}
                  </div>
                )}
              </div>
            )}
            <div
              style={{
                gridColumn: '1 / -1',
                fontSize: '0.76rem',
                color: 'var(--text-muted)',
                borderTop: '1px solid var(--border)',
                paddingTop: '0.5rem'
              }}
            >
              Token: <span style={{ fontFamily: 'monospace', color: 'var(--brand-gold)' }}>{tokenStr}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (status === 'NOT_SOLD') {
    return (
      <div
        className="card-glass glow-warning"
        style={{
          padding: '1.75rem 1.5rem',
          textAlign: 'center',
          marginBottom: '1.25rem',
          borderRadius: 'var(--radius-xl)'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '0.75rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(252, 170, 1, 0.2)',
            marginBottom: '0.75rem'
          }}
        >
          <AlertTriangle size={50} color="var(--brand-gold)" />
        </div>

        <div
          style={{
            backgroundColor: '#d97706',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '0.85rem',
            letterSpacing: '0.07em',
            padding: '0.4rem 1.15rem',
            borderRadius: 'var(--radius-full)',
            display: 'inline-block',
            marginBottom: '0.9rem',
            textTransform: 'uppercase'
          }}
        >
          ⛔ ENTRADA IMPRESA NO VENDIDA
        </div>

        <p style={{ color: '#fef3c7', fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>
          {message || 'Esta entrada física aún no fue registrada como vendida. Acceso denegado.'}
        </p>

        {ticket && (
          <div
            style={{
              backgroundColor: 'rgba(12, 10, 12, 0.65)',
              border: '1px solid var(--border)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              fontSize: '0.85rem',
              color: 'var(--text-primary)'
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--brand-gold)', marginBottom: '0.4rem' }}>
              {eventDayTitle || ticket.productName} {sectorName ? `· ${sectorName}` : ''}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div>
                <strong>Lote Físico:</strong> {ticket.physicalBatchCode || 'Sin especificar'}
              </div>
              <div>
                <strong>Estado:</strong> NO VENDIDA
              </div>
              <div style={{ fontFamily: 'monospace', color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                Token: {tokenStr}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (status === 'WRONG_DAY') {
    const formattedTicketDate = eventDateRaw
      ? new Date(eventDateRaw).toLocaleDateString('es-AR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long'
        })
      : '';

    return (
      <div
        className="card-glass glow-warning"
        style={{
          padding: '1.75rem 1.5rem',
          textAlign: 'center',
          marginBottom: '1.25rem',
          borderRadius: 'var(--radius-xl)',
          border: '2px solid var(--brand-orange)'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '0.85rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(249, 120, 4, 0.22)',
            marginBottom: '0.75rem'
          }}
        >
          <Calendar size={52} color="var(--brand-gold)" />
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #a40a23 0%, #da4706 100%)',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '0.88rem',
            letterSpacing: '0.07em',
            padding: '0.45rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            display: 'inline-block',
            marginBottom: '0.9rem',
            textTransform: 'uppercase',
            boxShadow: '0 4px 15px rgba(218, 71, 6, 0.45)'
          }}
        >
          ⛔ ENTRADA DE OTRO DÍA — NO QUEMADA
        </div>

        <p style={{ color: '#fde68a', fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.35 }}>
          {message || 'Esta entrada pertenece a otra jornada de la fiesta y no puede quemarse hoy.'}
        </p>

        {ticket && (
          <div
            style={{
              backgroundColor: 'rgba(12, 10, 12, 0.7)',
              border: '1px solid rgba(252, 170, 1, 0.35)',
              padding: '1.15rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              fontSize: '0.88rem',
              color: 'var(--text-primary)',
              marginBottom: '0.9rem'
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                gap: '0.75rem',
                marginBottom: '0.75rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--border)'
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Día del Ticket Escaneado
                </span>
                <div style={{ fontWeight: 900, fontSize: '1.15rem', color: 'var(--brand-gold)' }}>
                  {eventDayTitle || 'Otro día'} {formattedTicketDate ? `(${formattedTicketDate})` : ''}
                </div>
              </div>
              {assignedDay && (
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Día Activo en Validador
                  </span>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--success)' }}>
                    {assignedDay.title}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              {sectorName && (
                <div>
                  <strong>Sector:</strong>{' '}
                  <span style={{ color: sectorColor, fontWeight: 800 }}>{sectorName}</span>
                </div>
              )}
              {buyerFullName && (
                <div>
                  <strong>Titular:</strong> {buyerFullName} {buyerDni ? `(DNI: ${buyerDni})` : ''}
                </div>
              )}
              <div style={{ gridColumn: '1 / -1', fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                Token: {tokenStr}
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.14)',
            border: '1px solid rgba(34, 197, 94, 0.35)',
            color: '#86efac',
            padding: '0.7rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem'
          }}
        >
          <ShieldCheck size={17} style={{ flexShrink: 0 }} />
          <span>
            El código QR <strong>NO fue quemado</strong> y sigue válido para su día correspondiente.
          </span>
        </div>
      </div>
    );
  }

  if (status === 'VALIDATED') {
    return (
      <div
        className="card-glass glow-success"
        style={{
          padding: '1.75rem 1.5rem',
          textAlign: 'center',
          marginBottom: '1.25rem',
          borderRadius: 'var(--radius-xl)'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '0.8rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(34, 197, 94, 0.22)',
            marginBottom: '0.75rem'
          }}
        >
          <CheckCircle2 size={54} color="var(--success)" />
        </div>

        <div
          style={{
            backgroundColor: '#16a34a',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '0.88rem',
            letterSpacing: '0.07em',
            padding: '0.42rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            display: 'inline-block',
            marginBottom: '0.9rem',
            textTransform: 'uppercase',
            boxShadow: '0 4px 16px rgba(22, 163, 74, 0.45)'
          }}
        >
          ✅ TICKET VÁLIDO — REGISTRADO Y QUEMADO
        </div>

        {ticket && (
          <div style={{ marginBottom: '1.2rem' }}>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 900,
                color: 'var(--text-primary)',
                lineHeight: 1.15,
                marginBottom: '0.6rem',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)'
              }}
            >
              {eventDayTitle ? `${eventDayTitle}` : ticket.productName}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {sectorName && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    backgroundColor: 'rgba(12, 10, 12, 0.65)',
                    border: `1px solid ${sectorColor}`,
                    padding: '0.35rem 0.9rem',
                    borderRadius: 'var(--radius-full)',
                    color: 'var(--text-primary)',
                    fontWeight: 800,
                    fontSize: '0.95rem'
                  }}
                >
                  <MapPin size={15} color={sectorColor} />
                  Sector: {sectorName}
                </span>
              )}

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  backgroundColor: 'rgba(12, 10, 12, 0.65)',
                  border: '1px solid rgba(34, 197, 94, 0.35)',
                  padding: '0.35rem 0.9rem',
                  borderRadius: 'var(--radius-full)',
                  color: '#4ade80',
                  fontWeight: 800,
                  fontSize: '0.95rem'
                }}
              >
                {isComplimentary ? (
                  '🎟️ CORTESÍA OFICIAL'
                ) : (
                  <>
                    <DollarSign size={16} />
                    {ticket.pricePaid ?? ticket.price ?? 0}
                  </>
                )}
              </span>
            </div>
          </div>
        )}

        {ticket && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.7rem',
              backgroundColor: 'rgba(12, 10, 12, 0.65)',
              border: '1px solid var(--border)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)'
            }}
          >
            {buyerFullName && (
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <User size={15} color="var(--brand-gold)" />
                <span>
                  Titular: <strong style={{ color: 'var(--text-primary)' }}>{buyerFullName}</strong>{' '}
                  {buyerDni ? `(DNI: ${buyerDni})` : ''}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Hash size={15} color="var(--brand-gold)" />
              <span>
                Ticket: <strong style={{ color: 'var(--text-primary)' }}>{seqNumber}</strong>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={15} color="var(--brand-gold)" />
              <span>
                Hora ingreso:{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {ticket.usedAt ? new Date(ticket.usedAt).toLocaleTimeString('es-AR') : new Date().toLocaleTimeString('es-AR')}
                </strong>
              </span>
            </div>
            <div
              style={{
                gridColumn: '1 / -1',
                fontSize: '0.76rem',
                color: 'var(--text-muted)',
                borderTop: '1px solid var(--border)',
                paddingTop: '0.5rem'
              }}
            >
              Token: <span style={{ fontFamily: 'monospace', color: '#86efac' }}>{tokenStr}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (status === 'ALREADY_USED') {
    const usedDate = usedAt || ticket?.usedAt || ticket?.UsedAt;
    const usedOperator = usedBy || ticket?.usedByUsername || ticket?.validatedBy || ticket?.ValidatedBy;

    return (
      <div
        className="card-glass glow-danger"
        style={{
          padding: '1.75rem 1.5rem',
          textAlign: 'center',
          marginBottom: '1.25rem',
          borderRadius: 'var(--radius-xl)'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '0.8rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.22)',
            marginBottom: '0.75rem'
          }}
        >
          <AlertTriangle size={52} color="#ef4444" />
        </div>

        <div
          style={{
            backgroundColor: '#dc2626',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '0.88rem',
            letterSpacing: '0.07em',
            padding: '0.42rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            display: 'inline-block',
            marginBottom: '0.9rem',
            textTransform: 'uppercase'
          }}
        >
          🛑 ¡ALERTA! TICKET YA FUE QUEMADO
        </div>

        <p style={{ color: '#fca5a5', fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>
          {message || 'Este ticket ya fue utilizado anteriormente. Acceso denegado.'}
        </p>

        {ticket && (
          <div
            style={{
              backgroundColor: 'rgba(12, 10, 12, 0.7)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              fontSize: '0.86rem',
              color: 'var(--text-primary)'
            }}
          >
            <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#fca5a5', marginBottom: '0.5rem' }}>
              {eventDayTitle ? `${eventDayTitle}${sectorName ? ` · ${sectorName}` : ''}` : ticket.productName}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {buyerFullName && (
                <div>
                  <strong>Titular:</strong> {buyerFullName} {buyerDni ? `(DNI: ${buyerDni})` : ''}
                </div>
              )}
              <div>
                <strong>Ticket:</strong> {seqNumber}
              </div>
              <div>
                <strong>Quemado previamente el:</strong>{' '}
                {usedDate ? new Date(usedDate).toLocaleString('es-AR') : 'Previamente registrado'}
              </div>
              {usedOperator && (
                <div>
                  <strong>Validado por:</strong> {usedOperator}
                </div>
              )}
              <div style={{ fontFamily: 'monospace', color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                Token: {tokenStr}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // INVALID / ERROR
  return (
    <div
      className="card-glass glow-warning"
      style={{
        padding: '1.75rem 1.5rem',
        textAlign: 'center',
        marginBottom: '1.25rem',
        borderRadius: 'var(--radius-xl)'
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          padding: '0.75rem',
          borderRadius: '50%',
          backgroundColor: 'rgba(252, 170, 1, 0.2)',
          marginBottom: '0.75rem'
        }}
      >
        <XCircle size={48} color="var(--brand-gold)" />
      </div>

      <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--brand-gold)', marginBottom: '0.45rem' }}>
        TICKET INVÁLIDO O NO ENCONTRADO
      </h2>
      <p style={{ color: 'var(--text-primary)', fontSize: '0.98rem', fontWeight: 600 }}>
        {message || 'No se encontró este ticket en el sistema oficial o el código QR fue adulterado.'}
      </p>
    </div>
  );
}
