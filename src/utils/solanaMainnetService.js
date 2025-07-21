/**
 * Servicio para realizar llamadas a la API de Solana Mainnet a través de nuestro proxy específico
 * Esto evita problemas de CORS y CSP
 */
export async function callSolanaMainnet(method, params) {
  try {
    // Usar directamente el endpoint de Helius a través del proxy
    const response = await fetch('/api/proxy-solana', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Use-Helius': 'true', // Indicar que se debe usar Helius
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params: params || [],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling Solana Mainnet', { error: error.message });
    throw error;
  }
}

/**
 * Obtiene el último blockhash de la red Solana Mainnet
 * @returns {Promise<Object>} - Objeto con el último blockhash
 */
export async function getLatestBlockhash() {
  return callSolanaMainnet('getLatestBlockhash');
}

/**
 * Obtiene el balance de una cuenta en la red Solana Mainnet
 * @param {string} publicKey - Dirección de la cuenta
 * @returns {Promise<Object>} - Objeto con el balance
 */
export async function getBalance(publicKey) {
  return callSolanaMainnet('getBalance', [publicKey]);
}

/**
 * Obtiene información sobre un token en la red Solana Mainnet
 * @param {string} mintAddress - Dirección del token
 * @returns {Promise<Object>} - Objeto con la información del token
 */
export async function getTokenSupply(mintAddress) {
  return callSolanaMainnet('getTokenSupply', [mintAddress]);
}

/**
 * Envía una transacción firmada a la red Solana Mainnet
 * @param {string} encodedTransaction - Transacción codificada en base64
 * @returns {Promise<Object>} - Objeto con el resultado de la transacción
 */
export async function sendTransaction(encodedTransaction) {
  return callSolanaMainnet('sendTransaction', [encodedTransaction, { encoding: 'base64' }]);
}