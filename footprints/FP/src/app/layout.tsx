import type { Metadata } from 'next';
import { Heebo, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const heebo = Heebo({ subsets: ['hebrew', 'latin'], variable: '--font-sans' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-numbers' });

export const metadata: Metadata = {
  title: 'עקבות - אבטיפוס מקיף',
  description: 'Dog walking app prototype',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${jakarta.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="text-dark antialiased min-h-screen bg-default font-sans pb-32">
        <div className="max-w-md mx-auto relative flex flex-col min-h-screen pt-10">
          {children}
        </div>
      </body>
    </html>
  );
}
