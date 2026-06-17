import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Apple-style шрифт — Geist таза жана окууга ыңгайлуу
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "AI Student PRO",
  description: "AI Student PRO — студенттер үчүн акылдуу жардамчы Telegram Mini App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ky" className={`${geistSans.variable} h-full`}>
      <head>
        {/* Telegram Web App SDK — интерактивдүүлүктөн мурун жүктөлүшү керек */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen bg-[#0B0F19] text-white antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
