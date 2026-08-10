/**
 * Formats and sanitizes the API URL for fetch calls.
 * If the application is accessed over HTTPS (window.location.protocol === 'https:'),
 * any insecure http:// URL will be blocked by browser Mixed Content rules.
 * In that case, it returns an empty string '' to route requests relatively (/api/...)
 * through the Vite HTTPS dev server proxy.
 */
export function formatApiUrlForFetch(apiUrl) {
  if (!apiUrl) return '';
  const trimmed = apiUrl.trim().replace(/\/+$/, '');
  if (window.location.protocol === 'https:' && trimmed.startsWith('http://')) {
    return '';
  }
  return trimmed;
}

export function getDefaultApiUrl() {
  const isHttps = window.location.protocol === 'https:';
  const saved = localStorage.getItem('validator_api_url');

  if (saved !== null && saved !== '') {
    if (isHttps && saved.startsWith('http://')) {
      return '';
    }
    return saved;
  }

  if (import.meta.env.VITE_API_URL) {
    const envUrl = import.meta.env.VITE_API_URL;
    if (isHttps && envUrl.startsWith('http://')) {
      return '';
    }
    return envUrl;
  }

  if (isHttps) {
    return '';
  }

  const host = window.location.hostname || 'localhost';
  const port = import.meta.env.VITE_API_PORT || '6100';
  return `http://${host}:${port}`;
}
