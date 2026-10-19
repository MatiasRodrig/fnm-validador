import React, { useEffect, useRef, useState } from 'react';
import { Camera, AlertCircle, Keyboard, Send } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export default function Scanner({ onVerifyToken, isProcessing, disabled = false }) {
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [manualToken, setManualToken] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const scannerRef = useRef(null);
  const onVerifyRef = useRef(onVerifyToken);

  useEffect(() => {
    onVerifyRef.current = onVerifyToken;
  }, [onVerifyToken]);

  useEffect(() => {
    startScanner();
    return () => {
      stopScannerSilently();
    };
  }, []);

  const stopScannerSilently = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {}
      scannerRef.current = null;
    }
  };

  const toggleCamera = async () => {
    if (isCameraActive) {
      await stopScannerSilently();
      setIsCameraActive(false);
      setCameraError(null);
    } else {
      setIsCameraActive(true);
      setCameraError(null);
      setTimeout(() => {
        startScanner();
      }, 100);
    }
  };

  const startScanner = async () => {
    const isSecure =
      window.isSecureContext ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (!isSecure) {
      setCameraError(
        `⚠️ Los navegadores móviles requieren conexión segura HTTPS ("https://${window.location.host}") para activar la cámara.`
      );
      setIsCameraActive(false);
      return;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError('Tu navegador no soporta o tiene restringido el acceso a la cámara.');
      setIsCameraActive(false);
      return;
    }

    try {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        stream.getTracks().forEach((track) => track.stop());
      } catch (permErr) {
        if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
          setCameraError(
            '⛔ Permiso de cámara denegado. Habilitá la cámara desde la barra de direcciones de tu navegador.'
          );
          setIsCameraActive(false);
          return;
        }
      }

      await stopScannerSilently();

      const html5QrCode = new Html5Qrcode('reader-container');
      scannerRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          if (onVerifyRef.current) {
            onVerifyRef.current(decodedText);
          }
        },
        () => {}
      );
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera start error:', err);
      const errStr = err?.toString() || '';
      if (errStr.includes('NotAllowedError') || errStr.includes('Permission')) {
        setCameraError('⛔ Permiso denegado. Habilitá el acceso a la Cámara en la configuración de tu navegador.');
      } else {
        setCameraError(
          `No se pudo acceder a la cámara (${err?.message || err}). Podés usar un lector USB/Bluetooth o ingresar el código manualmente.`
        );
      }
      setIsCameraActive(false);
      scannerRef.current = null;
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim() || isProcessing || disabled) return;
    onVerifyToken(manualToken.trim());
    setManualToken('');
  };

  return (
    <div style={{ width: '100%', marginBottom: '1.25rem' }}>
      <div className="card-glass" style={{ padding: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.85rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}
        >
          <span
            style={{
              fontSize: '0.88rem',
              color: 'var(--text-primary)',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <Camera size={17} color="var(--brand-gold)" /> Lector de Cámara QR / Lectora Externa
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowManualInput((v) => !v)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.32rem 0.7rem', fontSize: '0.75rem' }}
            >
              <Keyboard size={14} /> {showManualInput ? 'Ocultar Teclado' : 'Ingreso Manual'}
            </button>

            <button
              type="button"
              onClick={toggleCamera}
              style={{
                backgroundColor: isCameraActive ? 'rgba(239, 68, 68, 0.14)' : 'rgba(34, 197, 94, 0.15)',
                color: isCameraActive ? '#fca5a5' : '#86efac',
                border: isCameraActive ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(34, 197, 94, 0.35)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.32rem 0.7rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontFamily: 'inherit'
              }}
            >
              {isCameraActive ? 'Pausar Cámara' : 'Activar Cámara'}
            </button>
          </div>
        </div>

        {isCameraActive ? (
          <div
            style={{
              overflow: 'hidden',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--brand-orange)',
              position: 'relative',
              boxShadow: '0 0 25px rgba(218, 71, 6, 0.25)'
            }}
          >
            <div id="reader-container" style={{ width: '100%', minHeight: '270px', backgroundColor: '#0c0a0c' }} />
            {isProcessing && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(12, 10, 12, 0.75)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-gold)',
                  fontWeight: 800,
                  fontSize: '1rem'
                }}
              >
                Verificando ticket...
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={toggleCamera}
            style={{
              height: '185px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '2px dashed var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              gap: '0.5rem',
              color: 'var(--text-secondary)',
              padding: '1rem',
              textAlign: 'center'
            }}
          >
            <Camera size={36} color="var(--brand-gold)" />
            <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              Tocá para activar la cámara del dispositivo
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              El lector USB / Bluetooth sigue activo en segundo plano
            </span>
          </div>
        )}

        {showManualInput && (
          <form
            onSubmit={handleManualSubmit}
            style={{
              marginTop: '0.85rem',
              display: 'flex',
              gap: '0.5rem'
            }}
          >
            <input
              type="text"
              className="form-input"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Ej: EVT-A1B2C3D4E5F6..."
              disabled={isProcessing || disabled}
              style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!manualToken.trim() || isProcessing || disabled}
            >
              <Send size={16} /> Validar
            </button>
          </form>
        )}

        {cameraError && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.14)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              marginTop: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#fca5a5',
              fontSize: '0.82rem'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{cameraError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
