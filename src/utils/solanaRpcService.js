/**
 * Servicio para realizar llamadas a la API de Solana a través de nuestro proxy
 * Esto evita problemas de CORS y CSP
 */
export async function callSolanaRpc(endpoint, method, params) {
  try {
    const response = await fetch('/api/solana-rpc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint,
        method,
        params,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling Solana RPC', { error: error.message });
    throw error;
  }
}

/**
 * Obtiene el último blockhash de la red Solana
 * @param {string} endpoint - URL del endpoint de Solana
 * @returns {Promise<Object>} - Objeto con el último blockhash
 */
export async function getLatestBlockhash(endpoint) {
  return callSolanaRpc(endpoint, 'getLatestBlockhash');
}

/**
 * Obtiene el balance de una cuenta
 * @param {string} endpoint - URL del endpoint de Solana
 * @param {string} publicKey - Dirección de la cuenta
 * @returns {Promise<Object>} - Objeto con el balance
 */
export async function getBalance(endpoint, publicKey) {
  return callSolanaRpc(endpoint, 'getBalance', [publicKey]);
}

/**
 * Obtiene información sobre un token
 * @param {string} endpoint - URL del endpoint de Solana
 * @param {string} mintAddress - Dirección del token
 * @returns {Promise<Object>} - Objeto con la información del token
 */
export async function getTokenSupply(endpoint, mintAddress) {
  return callSolanaRpc(endpoint, 'getTokenSupply', [mintAddress]);
}

/**
 * Envía una transacción firmada a la red Solana
 * @param {string} endpoint - URL del endpoint de Solana
 * @param {string} encodedTransaction - Transacción codificada en base64
 * @returns {Promise<Object>} - Objeto con el resultado de la transacción
 */
export async function sendTransaction(endpoint, encodedTransaction) {
  return callSolanaRpc(endpoint, 'sendTransaction', [encodedTransaction, { encoding: 'base64' }]);
}