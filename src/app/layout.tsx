import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ระบบบริหารจัดการจุดคัดกรองวิกฤต',
  description: 'ระบบตอบโต้ภาวะฉุกเฉินและติดตามอาการผู้ป่วยแบบเรียลไทม์',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Sarabun:wght@100;400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
