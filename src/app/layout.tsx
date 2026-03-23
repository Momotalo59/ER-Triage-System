import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from "@/components/ui/toaster";

/**
 * ไฟล์นี้ทำหน้าที่เป็น Root Layout ซึ่งเทียบเท่ากับ index.html และ entry point หลัก
 * จัดการส่วนของ <html>, <body> และ Providers ทั้งหมด
 */
export const metadata: Metadata = {
  title: 'ระบบบริหารจัดการจุดคัดกรองวิกฤต - Overbrook Hospital',
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
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@100;400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sarabun antialiased">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}