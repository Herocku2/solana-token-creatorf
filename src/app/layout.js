import { Montserrat } from "next/font/google";
import "./globals.css";
import AppWalletProvider from "@/provider/AppWalletProvider";
import { Toaster } from "sonner";
const montserrat = Montserrat({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-montserrat",
});
export const metadata = {
  title: "Solana Token Creator",
  description: "Create your own Solana token",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable}`}>
        <AppWalletProvider>
          <Toaster position="top-center" />
          {children}
        </AppWalletProvider>
      </body>
    </html>
  );
}
