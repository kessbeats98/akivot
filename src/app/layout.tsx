import type { Metadata, Viewport } from "next";
import { Heebo, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/shared/ServiceWorkerRegistration";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "עקבות — Akivot",
  description: "ניהול טיולי כלבים לדוגווקרים ובעלי כלבים",
};

export const viewport: Viewport = {
  themeColor: "#14746F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${jakarta.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased min-h-screen bg-default text-dark">
        <div className="max-w-md mx-auto relative flex flex-col min-h-screen">
          {children}
        </div>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
