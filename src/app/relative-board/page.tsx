"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronLeft, 
  Monitor,
  Users,
  MapPin,
  Clock,
  Search,
  Phone,
  CreditCard,
  Info,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Patient, PatientStatus } from "@/lib/types";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";

const statusThaiMap: Record<PatientStatus, string> = {
  Waiting: "รอตรวจ",
  Lab: "ห้องปฏิบัติการ",
  "X-Ray": "X-Ray",
  Admit: "Admit",
  Pharmacy: "รอรับยา",
  Discharged: "กลับบ้าน",
};

export default function RelativeBoardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('id');
  const [searchTerm, setSearchTerm] = useState("");
  const firestore = useFirestore();

  const patientsRef = collection(firestore, 'patients');
  const memoizedQuery = useMemoFirebase(() => {
    if (planId) {
      return query(patientsRef, where('planId', '==', planId));
    }
    return query(patientsRef);
  }, [planId]);

  const { data: patientsData, isLoading } = useCollection<Patient>(memoizedQuery);

  const filteredPatients = (patientsData || [])
    .filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());

  return (
    <div className="min-h-screen bg-[#f8f8f8] font-sarabun text-slate-900">
      <header className="bg-[#b22222] text-white p-4 shadow-lg sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 h-10 w-10"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="bg-white p-1 rounded-lg w-12 h-12 flex items-center justify-center overflow-hidden">
               <Image 
                 src="https://img1.pic.in.th/images/LOGO-OVERBROOK-2023-03_0.png" 
                 alt="Overbrook Logo" 
                 width={40}
                 height={40}
                 className="object-contain"
               />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <Monitor className="h-6 w-6" /> รายชื่อผู้ป่วย (สำหรับญาติ)
              </h1>
              <p className="text-[10px] opacity-90">
                จุดบริการข้อมูลญาติ โรงพยาบาลโอเวอร์บรุ๊คเชียงราย
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="ค้นหาชื่อผู้ป่วย..." 
                className="pl-9 h-10 bg-white text-slate-900 border-none rounded-full shadow-inner text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 text-white p-3 flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-yellow-400" />
              <h2 className="text-sm font-bold">ข้อมูลการรับตัวผู้ป่วย (อัปเดตเรียลไทม์)</h2>
            </div>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="h-10 border-b border-slate-100">
                  <TableHead className="text-[10px] font-bold text-slate-600 px-6">#</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-600">ชื่อ-นามสกุล</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-600">สถานะปัจจุบัน</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-600">จุดหมาย/หน่วยรับต่อ</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-600">เวลาที่รับตัว</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient, idx) => (
                    <TableRow key={patient.id} className="h-12 hover:bg-slate-50 transition-colors border-b border-slate-50">
                      <TableCell className="px-6 text-[12px] font-medium text-slate-400">{idx + 1}</TableCell>
                      <TableCell className="text-[14px] font-bold text-slate-900">{patient.name}</TableCell>
                      <TableCell>
                        <Badge className={`text-[9px] px-2 py-0.5 rounded-full border-none font-bold ${
                          patient.status === 'Admit' ? 'bg-orange-100 text-orange-700' :
                          patient.status === 'X-Ray' ? 'bg-blue-100 text-blue-700' :
                          patient.status === 'Lab' ? 'bg-purple-100 text-purple-700' :
                          patient.status === 'Pharmacy' ? 'bg-pink-100 text-pink-700' :
                          patient.status === 'Discharged' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {statusThaiMap[patient.status] || patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[12px] text-slate-600 font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-[#b22222]" />
                          {patient.destination}
                        </div>
                      </TableCell>
                      <TableCell className="text-[12px] text-slate-500">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {patient.arrival} น.
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-slate-400 text-xs font-medium">
                      {isLoading ? 'กำลังโหลดข้อมูล...' : 'ไม่พบรายชื่อผู้ป่วยในขณะนี้'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard title="ติดต่อประชาสัมพันธ์" content="053-910-100 ต่อ 0" icon={<Phone className="h-4 w-4" />} />
          <InfoCard title="จุดรับแจ้งสิทธิรักษา" content="ชั้น 1 อาคารหมอกัมพล โรงพยาบาลโอเวอร์บรุ๊ค" icon={<CreditCard className="h-4 w-4" />} />
          <InfoCard title="สอบถามอาการเพิ่มเติม" content="กรุณาติดต่อเคาน์เตอร์พยาบาล" icon={<Info className="h-4 w-4" />} />
        </div>
      </main>

      <footer className="p-6 text-center text-slate-400 text-[10px]">
        © 2024 โรงพยาบาลโอเวอร์บรุ๊คเชียงราย — ระบบบริหารจัดการภาวะวิกฤต (MCI System)
      </footer>
    </div>
  );
}

function InfoCard({ title, content, icon }: { title: string; content: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-3 rounded-xl shadow-md border border-slate-200 flex items-center gap-3 h-full">
      <div className="h-8 w-8 bg-[#b22222]/10 rounded-full flex items-center justify-center text-[#b22222] shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-[12px] text-slate-900">{title}</h3>
        <p className="text-slate-500 text-[10px] leading-tight">{content}</p>
      </div>
    </div>
  );
}
