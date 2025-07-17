/**
 * Utilidad para protección CSRF en el frontend
 */
import logger from './logger';

/**
 * Genera un token CSRF aleatorio
 * @returns {string} Token CSRF
 */
export function generateCSRFToken() {
  if (typeof window === 'undefined') return '';
  
  // Generar token aleatorio
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  const token = Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Guardar en localStorage
  localStorage.setItem('csrf-token', token);
  return token;
}

/**
 * Obtiene el token CSRF actual o genera uno nuevo
 * @returns {string} Token CSRF
 */
export function getCSRFToken() {
  if (typeof window === 'undefined') return '';
  
  // Obtener token existente o generar uno nuevo
  let token = localStorage.getItem('csrf-token');
  if (!token) {
    token = generateCSRFToken();
  }
  
  return token;
}

/**
 * Añade el token CSRF a los headers de una petición fetch
 * @param {Object} options - Opciones de fetch
 * @returns {Object} Opciones con token CSRF
 */
export function addCSRFToken(options = {}) {
  const token = getCSRFToken();
  
  // Añadir token a los headers
  const headers = {
    ...(options.headers || {}),
    'X-CSRF-Token': token,
  };
  
  return {
    ...options,
    headers,
  };
}

/**
 * Wrapper para fetch que añade el token CSRF
 * @param {string} url - URL a la que hacer fetch
 * @param {Object} options - Opciones de fetch
 * @returns {Promise} Resultado de fetch
 */
export async function fetchWithCSRF(url, options = {}) {
  try {
    // Añadir token CSRF
    const optionsWithToken = addCSRFToken(options);
    
    // Hacer fetch
    const response = await fetch(url, optionsWithToken);
    
    // Verificar respuesta
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    logger.error('CSRF fetch error:', { url, error: error.message });
    throw error;
  }
}