import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, AlertCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export default function Scanner({ onVerifyToken, isProcessing }) {
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const scannerRef = useRef(null);

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
    const isSecure = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isSecure) {
      setCameraError(
        `⚠️ Los navegadores móviles requieren conexión segura HTTPS ("https://${window.location.host}") para activar la cámara.`
      );
      setIsCameraActive(false);
      return;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError("Tu navegador no soporta o tiene restringido el acceso a la cámara.");
      setIsCameraActive(false);
      return;
    }

    try {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        stream.getTracks().forEach(track => track.stop());
      } catch (permErr) {
        if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
          setCameraError("⛔ Permiso de cámara denegado. Habilitá la cámara desde la barra de direcciones de tu navegador.");
          setIsCameraActive(false);
          return;
        }
      }

      await stopScannerSilently();

      const html5QrCode = new Html5Qrcode("reader-container");
      scannerRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          onVerifyToken(decodedText);
        },
        () => {}
      );
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera start error:", err);
      const errStr = err?.toString() || '';
      if (errStr.includes("NotAllowedError") || errStr.includes("Permission")) {
        setCameraError("⛔ Permiso denegado. Habilitá el acceso a la Cámara en la configuración de tu navegador.");
      } else {
        setCameraError(`No se pudo acceder a la cámara (${err?.message || err}). Asegúrate de no tener otra app usándola.`);
      }
      setIsCameraActive(false);
      scannerRef.current = null;
    }
  };

  return (
    <div style={{ width: '100%', marginBottom: '1.5rem' }}>
      <div className="card-glass" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Camera size={16} color="#6366f1" /> Escáner de Cámara del Dispositivo
          </span>
          <button
            onClick={toggleCamera}
            style={{
              backgroundColor: isCameraActive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: isCameraActive ? '#fca5a5' : '#6ee7b7',
              border: isCameraActive ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '0.6rem',
              padding: '0.3rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            {isCameraActive ? 'Pausar Cámara' : 'Reactivar Cámara'}
          </button>
        </div>

        {isCameraActive ? (
          <div style={{ overflow: 'hidden', borderRadius: '1rem', border: '2px solid #6366f1', position: 'relative' }}>
            <div id="reader-container" style={{ width: '100%', minHeight: '280px', backgroundColor: '#000' }}></div>
            {isProcessing && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.95rem'
                }}
              >
                Procesando validación...
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={toggleCamera}
            style={{
              height: '200px',
              backgroundColor: '#111827',
              borderRadius: '1rem',
              border: '2px dashed #374151',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              gap: '0.5rem',
              color: '#9ca3af'
            }}
          >
            <Camera size={36} color="#6366f1" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Toca para activar la cámara del dispositivo</span>
          </div>
        )}

        {cameraError && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.75rem',
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
