import { NextResponse } from 'next/server';

/**
 * API endpoint que actúa como proxy específico para la Mainnet de Solana
 * Esto evita problemas de CORS y CSP al hacer llamadas directamente desde el frontend
 */
export async function POST(request) {
  try {
    // Obtener el cuerpo de la solicitud
    const body = await request.json();
    
    // Usar un endpoint confiable para la Mainnet
    // Ankr es generalmente más confiable que otros endpoints públicos
    const rpcEndpoint = 'https://rpc.ankr.com/solana';
    
    // Construir la solicitud RPC
    const rpcRequest = body;
    
    console.log(`Proxy request to Solana Mainnet: ${rpcEndpoint}`, { method: rpcRequest.method });
    
    // Realizar la solicitud al endpoint de Solana con un timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
    
    try {
      const response = await fetch(rpcEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rpcRequest),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Solana Mainnet RPC error: ${response.status}`, { error: errorText });
        return NextResponse.json(
          { error: `Error en la solicitud RPC: ${response.status}` },
          { status: response.status }
        );
      }
      
      // Devolver la respuesta
      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        console.error('Solana Mainnet RPC timeout');
        return NextResponse.json(
          { error: 'Timeout al conectar con Solana Mainnet' },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error en el proxy de Solana Mainnet', { error: error.message });
    return NextResponse.json(
      { error: `Error interno del servidor: ${error.message}` },
      { status: 500 }
    );
  }
}