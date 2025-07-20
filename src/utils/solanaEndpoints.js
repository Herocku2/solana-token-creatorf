/**
 * Utilidad para gestionar endpoints de Solana con fallback
 */
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import logger from './logger';

// Endpoints principales y de respaldo
export const SOLANA_ENDPOINTS = {
  [WalletAdapterNetwork.Devnet]: [
    process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC || clusterApiUrl(WalletAdapterNetwork.Devnet),
    'https://api.devnet.solana.com',
    'https://solana-devnet-rpc.allthatnode.com',
  ],
  [WalletAdapterNetwork.Mainnet]: [
    process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC || 'https://rpc.ankr.com/solana',
    'https://solana-api.projectserum.com',
    'https://api.mainnet-beta.solana.com',
    'https://solana-mainnet-rpc.allthatnode.com',
  ],
};

// Caché de endpoints probados
const endpointCache = {
  [WalletAdapterNetwork.Devnet]: null,
  [WalletAdapterNetwork.Mainnet]: null,
  lastChecked: {
    [WalletAdapterNetwork.Devnet]: 0,
    [WalletAdapterNetwork.Mainnet]: 0,
  }
};

// Tiempo de caché en milisegundos (5 minutos)
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Comprueba si un endpoint está activo
 * @param {string} endpoint - URL del endpoint a comprobar
 * @returns {Promise<boolean>} - true si está activo, false en caso contrario
 */
async function isEndpointActive(endpoint) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getHealth',
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) return false;
    
    const data = await response.json();
    return data?.result === 'ok';
  } catch (error) {
    logger.warn(`Endpoint ${endpoint} check failed:`, { error: error.message });
    return false;
  }
}

/**
 * Obtiene el mejor endpoint disponible para una red
 * @param {string} network - Red (devnet o mainnet)
 * @returns {Promise<string>} - URL del mejor endpoint disponible
 */
export async function getBestEndpoint(network) {
  // Si hay un endpoint en caché y no ha expirado, usarlo
  const now = Date.now();
  if (
    endpointCache[network] && 
    now - endpointCache.lastChecked[network] < CACHE_TTL
  ) {
    return endpointCache[network];
  }
  
  // Obtener endpoints para la red
  const endpoints = SOLANA_ENDPOINTS[network] || [clusterApiUrl(network)];
  
  // Comprobar todos los endpoints en paralelo
  const results = await Promise.all(
    endpoints.map(async (endpoint) => {
      const startTime = performance.now();
      const isActive = await isEndpointActive(endpoint);
      const endTime = performance.now();
      
      return {
        endpoint,
        isActive,
        latency: isActive ? endTime - startTime : Infinity,
      };
    })
  );
  
  // Filtrar endpoints activos y ordenar por latencia
  const activeEndpoints = results
    .filter((result) => result.isActive)
    .sort((a, b) => a.latency - b.latency);
  
  // Si hay endpoints activos, usar el más rápido
  if (activeEndpoints.length > 0) {
    const bestEndpoint = activeEndpoints[0].endpoint;
    
    // Actualizar caché
    endpointCache[network] = bestEndpoint;
    endpointCache.lastChecked[network] = now;
    
    logger.info(`Using best endpoint for ${network}:`, { endpoint: bestEndpoint, latency: activeEndpoints[0].latency });
    return bestEndpoint;
  }
  
  // Si no hay endpoints activos, usar el endpoint por defecto
  logger.warn(`No active endpoints found for ${network}, using default`);
  return clusterApiUrl(network);
}