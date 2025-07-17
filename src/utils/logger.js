/**
 * Sistema de logging para la aplicación
 * Proporciona funciones para registrar eventos, errores y actividad sospechosa
 */

// Niveles de log
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

// Configuración
const config = {
  logToConsole: true,
  logToStorage: true,
  storageKey: 'app_logs',
  maxLogEntries: 100,
  minLevel: process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG
};

// Mapa de niveles de log a métodos de consola
const consoleMethods = {
  [LOG_LEVELS.ERROR]: console.error,
  [LOG_LEVELS.WARN]: console.warn,
  [LOG_LEVELS.INFO]: console.info,
  [LOG_LEVELS.DEBUG]: console.debug
};

/**
 * Guarda un log en localStorage
 * @param {Object} logEntry - Entrada de log a guardar
 */
function saveToStorage(logEntry) {
  if (typeof window === 'undefined' || !config.logToStorage) return;
  
  try {
    // Obtener logs existentes
    const storedLogs = JSON.parse(localStorage.getItem(config.storageKey) || '[]');
    
    // Añadir nuevo log
    storedLogs.push(logEntry);
    
    // Limitar el número de logs almacenados
    while (storedLogs.length > config.maxLogEntries) {
      storedLogs.shift();
    }
    
    // Guardar logs actualizados
    localStorage.setItem(config.storageKey, JSON.stringify(storedLogs));
  } catch (error) {
    console.error('Error saving log to storage:', error);
  }
}

/**
 * Registra un mensaje de log
 * @param {string} level - Nivel de log
 * @param {string} message - Mensaje de log
 * @param {Object} [data] - Datos adicionales
 */
function log(level, message, data = {}) {
  // Verificar nivel mínimo de log
  const levels = Object.values(LOG_LEVELS);
  if (levels.indexOf(level) < levels.indexOf(config.minLevel)) return;
  
  // Crear entrada de log
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    data
  };
  
  // Log a consola
  if (config.logToConsole && consoleMethods[level]) {
    consoleMethods[level](`[${timestamp}] [${level.toUpperCase()}] ${message}`, data);
  }
  
  // Log a storage
  saveToStorage(logEntry);
  
  return logEntry;
}

// Exportar funciones específicas para cada nivel
export const logger = {
  error: (message, data) => log(LOG_LEVELS.ERROR, message, data),
  warn: (message, data) => log(LOG_LEVELS.WARN, message, data),
  info: (message, data) => log(LOG_LEVELS.INFO, message, data),
  debug: (message, data) => log(LOG_LEVELS.DEBUG, message, data),
  
  // Función para obtener todos los logs almacenados
  getLogs: () => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(config.storageKey) || '[]');
    } catch (error) {
      console.error('Error retrieving logs:', error);
      return [];
    }
  },
  
  // Función para limpiar logs
  clearLogs: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(config.storageKey);
  }
};

export default logger;