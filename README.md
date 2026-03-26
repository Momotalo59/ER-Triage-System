# ระบบบริหารจัดการจุดคัดกรองวิกฤต (ER Triage System) - Overbrook Hospital

ระบบตอบโต้ภาวะฉุกเฉินและติดตามอาการผู้ป่วยแบบเรียลไทม์ (MCI System) พัฒนาด้วย Next.js และ Firebase

## คุณสมบัติหลัก
- **MCI Dashboard**: ติดตามสถานะผู้ป่วยแบบเรียลไทม์แยกตามระดับความรุนแรง (Triage)
- **Real-time Sync**: ข้อมูลอัปเดตทันทีในทุกหน้าจอ (Dashboard, บอร์ดญาติ)
- **AI Triage Suggestion**: ระบบแนะนำระดับการคัดกรองเบื้องต้นด้วย AI
- **Resource Management**: จัดการสต็อกหมู่เลือดและเครื่องช่วยหายใจ

## การนำไปใช้งาน (Deployment)
โปรเจกต์นี้รองรับการใช้งานบน **Firebase App Hosting**
1. นำโค้ดขึ้น GitHub
2. เชื่อมต่อ GitHub กับ Firebase App Hosting ใน Firebase Console
3. ระบบจะทำการ Deploy อัตโนมัติเมื่อมีการ Push โค้ด

## ผู้พัฒนา
โรงพยาบาลโอเวอร์บรุ๊ค เชียงราย