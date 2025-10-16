// Unified backend configuration (Firebase-friendly)
export const FUNCTIONS_BASE_URL: string =
  (import.meta as any)?.env?.VITE_FUNCTIONS_BASE_URL || 'https://em-estudio.web.app/make-server-ecf7df64';

export const FUNCTIONS_TOKEN: string =
  (import.meta as any)?.env?.VITE_FUNCTIONS_TOKEN || 'firebase-public';

export function functionsUrl(path: string): string {
  const base = FUNCTIONS_BASE_URL.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

