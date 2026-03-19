import type { Metadata, Viewport } from "next";
import { Heebo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/shared/ServiceWorkerRegistration";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "עקבות | Akivot",
  description: "ניהול טיולי כלבים חכם - Dog walking management for walkers and owners",
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#16a34a" />
      </head>
      <body
        className={`${heebo.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background`}
      >
        {/* Mobile-first centered container */}
        <div className="min-h-screen w-full max-w-[430px] mx-auto bg-background relative">
          {children}
        </div>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
