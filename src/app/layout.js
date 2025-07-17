import { Montserrat } from "next/font/google";
import "./globals.css";
import { metadata } from './metadata';

// Importamos el componente cliente desde su ubicación correcta
import ClientEntrypoint from "@/components/ClientEntrypoint";

const montserrat = Montserrat({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-montserrat",
});

// Exportamos la metadata desde el archivo separado
export { metadata };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/flower-logo.png" />
      </head>
      <body className={montserrat.variable}>
        <ClientEntrypoint>
          {children}
        </ClientEntrypoint>
      </body>
    </html>
  );
}
