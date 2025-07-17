import { NextResponse } from 'next/server';

// Función para generar un token CSRF aleatorio
function generateCSRFToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Implementación de rate limiting simple
const ipRequestCounts = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const RATE_LIMIT_MAX = 100; // 100 solicitudes por ventana

// Middleware principal
export function middleware(request) {
  const response = NextResponse.next();
  
  // Generar token CSRF si no existe
  if (!request.cookies.get('csrf-token')) {
    const token = generateCSRFToken();
    response.cookies.set('csrf-token', token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    // Exponer el token para que el frontend pueda usarlo
    response.headers.set('X-CSRF-Token', token);
  }
  
  // Implementar rate limiting para rutas API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip || 'unknown';
    const now = Date.now();
    
    // Limpiar entradas antiguas
    for (const [storedIp, { timestamp }] of ipRequestCounts.entries()) {
      if (now - timestamp > RATE_LIMIT_WINDOW_MS) {
        ipRequestCounts.delete(storedIp);
      }
    }
    
    // Verificar y actualizar contador para la IP actual
    const ipData = ipRequestCounts.get(ip) || { count: 0, timestamp: now };
    
    if (now - ipData.timestamp > RATE_LIMIT_WINDOW_MS) {
      // Reiniciar contador si ha pasado la ventana de tiempo
      ipData.count = 1;
      ipData.timestamp = now;
    } else {
      // Incrementar contador
      ipData.count++;
    }
    
    ipRequestCounts.set(ip, ipData);
    
    // Verificar si se ha excedido el límite
    if (ipData.count > RATE_LIMIT_MAX) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests, please try again later' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '900' // 15 minutos en segundos
          }
        }
      );
    }
    
    // Añadir headers para debugging y transparencia
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX.toString());
    response.headers.set('X-RateLimit-Remaining', (RATE_LIMIT_MAX - ipData.count).toString());
    response.headers.set('X-RateLimit-Reset', (ipData.timestamp + RATE_LIMIT_WINDOW_MS).toString());
  }
  
  // Añadir headers de seguridad adicionales
  response.headers.set('X-Powered-By', 'FlorkaFun Token Creator');
  
  return response;
}

// Configurar en qué rutas se ejecutará el middleware
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas de solicitud excepto:
     * 1. Archivos estáticos (_next/static, favicon.ico, etc.)
     * 2. Rutas de API de depuración
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};