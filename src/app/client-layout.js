'use client';

import AppWalletProvider from "@/provider/AppWalletProvider";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";

export default function ClientLayout({ children }) {
  // Estado para controlar si estamos en el cliente
  const [mounted, setMounted] = useState(false);

  // Efecto para marcar que estamos en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Si no estamos montados, mostramos un estado de carga
  // Esto evita problemas de hidratación
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading application...</div>
      </div>
    );
  }

  return (
    <AppWalletProvider>
      <Toaster position="top-center" />
      {children}
    </AppWalletProvider>
  );
}