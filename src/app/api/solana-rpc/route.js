import { NextResponse } from 'next/server';

/**
 * API endpoint que actúa como proxy para las llamadas a la API de Solana
 * Esto evita problemas de CORS y CSP al hacer llamadas directamente desde el frontend
 */
export async function POST(request) {
  try {
    // Obtener el cuerpo de la solicitud
    const body = await request.json();
    
    // Obtener el endpoint de Solana a utilizar
    const { endpoint, method, params } = body;
    
    if (!endpoint || !method) {
      return NextResponse.json(
        { error: 'Se requiere endpoint y method' },
        { status: 400 }
      );
    }
    
    // Construir la solicitud RPC
    const rpcRequest = {
      jsonrpc: '2.0',
      id: 1,
      method,
      params: params || [],
    };
    
    console.log(`Proxy request to Solana RPC: ${endpoint}`, { method });
    
    // Realizar la solicitud al endpoint de Solana
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rpcRequest),
    });
    
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Solana RPC error: ${response.status}`, { error: errorText });
      return NextResponse.json(
        { error: `Error en la solicitud RPC: ${response.status}` },
        { status: response.status }
      );
    }
    
    // Devolver la respuesta
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en el proxy de Solana RPC', { error: error.message });
    return NextResponse.json(
      { error: `Error interno del servidor: ${error.message}` },
      { status: 500 }
    );
  }
}