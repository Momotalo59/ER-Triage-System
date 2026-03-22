import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from "@/components/ui/toaster";

/**
 * ไฟล์นี้ทำหน้าที่เป็นโครงสร้างหลักของ HTML (เทียบเท่า index.html)
 * จัดการส่วนของ <head>, <body> และการดึงฟอนต์มาใช้งาน
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Sarabun:wght@100;400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}