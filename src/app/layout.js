import { Montserrat } from "next/font/google";
import "./globals.css";
import AppWalletProvider from "@/provider/AppWalletProvider";
import ClientOnly from "@/components/ClientOnly";
import { Toaster } from "sonner";

const montserrat = Montserrat({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata = {
  title: "Solana Token Creator",
  description: "Create your own Solana token",
  icons: {
    icon: '/flower-logo.png',
    apple: '/flower-logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/flower-logo.png" />
      </head>
      <body className={`${montserrat.variable}`}>
        <ClientOnly fallback={<div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
          <AppWalletProvider>
            <Toaster position="top-center" />
            {children}
          </AppWalletProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
