import { useEffect, useRef } from 'react';

/**
 * Custom hook to listen globally for USB/Bluetooth barcode and QR scanners operating in HID keyboard mode.
 * 
 * @param {Function} onScan - Callback function called when a barcode/QR string is completed (on Enter key)
 * @param {boolean} enabled - Whether the scanner listener is currently active
 */
export function useBarcodeScanner(onScan, enabled = true) {
  const bufferRef = useRef([]);
  const lastKeyTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Do not intercept if user is typing inside an editable field like an input or textarea
      const targetTag = e.target?.tagName?.toUpperCase();
      const isEditable = e.target?.isContentEditable;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || isEditable) {
        return;
      }

      const now = Date.now();
      // If time between keystrokes is too long (> 500ms), clear buffer (manual keypress reset)
      if (now - lastKeyTimeRef.current > 500) {
        bufferRef.current = [];
      }
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        if (bufferRef.current.length > 0) {
          const scannedCode = bufferRef.current.join('');
          bufferRef.current = [];
          if (scannedCode.trim()) {
            onScan(scannedCode.trim());
          }
        }
      } else if (e.key.length === 1) {
        // Append single printable character to buffer
        bufferRef.current.push(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onScan, enabled]);
}
