/**
 * Utilidades para manejo dinámico de URLs
 * Detecta automáticamente la URL base según el entorno
 */

/**
 * Obtiene la URL de redirect para Magic Link authentication
 * Detecta dinámicamente la URL base del entorno actual
 *
 * @returns URL completa para el callback de autenticación
 */
export function getMagicLinkRedirectUrl(): string {
  // Solo en el cliente podemos detectar la URL actual
  if (typeof window !== 'undefined') {
    const host = window.location.host;
    const protocol = window.location.protocol;
    const origin = window.location.origin;

    // Detectar si estamos en TouchBase (por nombre del host)
    if (host.includes('touchbase')) {
      return `${origin}/auth/callback`;
    }

    // Detectar si estamos en localhost (desarrollo)
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      return `${origin}/auth/callback`;
    }

    // Detectar si estamos en una URL de Vercel
    if (host.includes('vercel.app')) {
      return `${origin}/auth/callback`;
    }

    // Si estamos en el dominio final
    if (host === 'www.touchbase.academy' || host === 'touchbase.academy') {
      return `${origin}/auth/callback`;
    }
  }

  // Fallback a la URL de producción
  const fallbackUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.touchbase.academy';

  return `${fallbackUrl}/auth/callback`;
}

/**
 * Lista de URLs permitidas para redirect (para configurar en Supabase)
 * Estas deben agregarse en Supabase Dashboard > Authentication > URL Configuration
 */
export const ALLOWED_REDIRECT_URLS = [
  // Desarrollo local
  'http://localhost:3000/auth/callback',
  'http://localhost:3001/auth/callback',
  'http://127.0.0.1:3000/auth/callback',

  // Production domain
  'https://www.touchbase.academy/auth/callback',
  'https://www.touchbase.academy/es/auth/callback',
  'https://www.touchbase.academy/en/auth/callback',
  'https://touchbase.academy/auth/callback',

  // Vercel Preview URLs (pattern for all preview deployments)
  'https://touchbase-*.vercel.app/auth/callback',
  'https://touchbase-git-*.vercel.app/auth/callback',
];

/**
 * Verifica si la URL actual es una URL permitida
 * Útil para debugging y validación
 */
export function isAllowedRedirectUrl(url: string): boolean {
  return ALLOWED_REDIRECT_URLS.some(allowedUrl => {
    // Manejo de wildcards simples
    if (allowedUrl.includes('*')) {
      const pattern = allowedUrl.replace('*', '.*');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(url);
    }
    return url === allowedUrl;
  });
}