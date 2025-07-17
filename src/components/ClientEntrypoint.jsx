'use client';

import dynamic from 'next/dynamic';

// Importamos el layout cliente de forma dinámica con ssr: false
const ClientLayout = dynamic(() => import('../app/client-layout'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
      <div className="text-white text-lg">Loading application...</div>
    </div>
  )
});

// Este componente sirve como punto de entrada para los componentes cliente
export default function ClientEntrypoint({ children }) {
  return <ClientLayout>{children}</ClientLayout>;
}