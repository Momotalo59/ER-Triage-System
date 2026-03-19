
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Monitor,
  Users,
  MapPin,
  Clock,
  Search,
  Phone,
  CreditCard,
  Info
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
import { Patient } from "@/lib/types";

const MOCK_PATIENTS: Partial<Patient>[] = [
  { id: '1', name: 'นายสมชาย รักดี', status: 'Admit', destination: 'หอผู้ป่วยกมลรักษ์', arrival: '10:04' },
  { id: '2', name: 'นางสาววิภา ใจเย็น', status: 'Admit', destination: 'Ns ICU', arrival: '10:19' },
  { id: '3', name: 'เด็กชายเอ นามสมมติ', status: 'Admit', destination: 'ตึกกุมารเวชกรรม 2', arrival: '10:28' },
  { id: '4', name: 'นายบุญส่ง สุขภาพดี', status: 'Admit', destination: 'SICU (อาคาร 10)', arrival: '10:34' },
  { id: '5', name: 'นางมาลี มีความสุข', status: 'Admit', destination: 'Neuro Surgery', arrival: '10:34' },
  { id: '6', name: 'ไม่ทราบชื่อ (ชาย)', status: 'X-Ray', destination: 'แผนกเอกซเรย์', arrival: '10:45' },
  { id: '7', name: 'นางกนกพร อ่อนหวาน', status: 'Waiting', destination: 'ER Resuscitation', arrival: '10:50' },
];

export default function RelativeBoardPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredPatients = MOCK_PATIENTS.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f8f8] font-sarabun text-slate-900">
      {/* Header */}
      <header className="bg-[#b22222] text-white p-6 shadow-lg sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 h-12 w-12"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <div className="bg-white p-1 rounded-xl w-16 h-16 flex items-center justify-center overflow-hidden">
               <Image 
                 src="https://img1.pic.in.th/images/LOGO-OVERBROOK-2023-03_0.png" 
                 alt="Overbrook Logo" 
                 width={60}
                 height={60}
                 className="object-contain"
               />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Monitor className="h-8 w-8" /> รายชื่อผู้ป่วย (สำหรับญาติ)
              </h1>
              <p className="text-sm opacity-90 mt-1">
                จุดบริการข้อมูลญาติ โรงพยาบาลโอเวอร์บรุ๊คเชียงราย
              </p>
            </div>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="ค้นหาชื่อผู้ป่วย..." 
              className="pl-10 h-12 bg-white text-slate-900 border-none rounded-full shadow-inner text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-8">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 text-white p-6 flex items-center gap-3">
            <Users className="h-6 w-6 text-yellow-400" />
            <h2 className="text-xl font-bold">ข้อมูลการรับตัวผู้ป่วย (อัปเดตเรียลไทม์)</h2>
            <div className="ml-auto flex items-center gap-2">
              <span className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs opacity-70">กำลังเชื่อมต่อข้อมูล</span>
            </div>
          </div>

          <div className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="h-16">
                  <TableHead className="text-lg font-bold text-slate-600 px-8">#</TableHead>
                  <TableHead className="text-lg font-bold text-slate-600">ชื่อ-นามสกุล</TableHead>
                  <TableHead className="text-lg font-bold text-slate-600">สถานะปัจจุบัน</TableHead>
                  <TableHead className="text-lg font-bold text-slate-600">จุดหมาย/หน่วยรับต่อ</TableHead>
                  <TableHead className="text-lg font-bold text-slate-600">เวลาที่รับตัว</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient, idx) => (
                    <TableRow key={patient.id} className="h-20 hover:bg-slate-50 transition-colors">
                      <TableCell className="px-8 text-xl font-medium text-slate-400">{idx + 1}</TableCell>
                      <TableCell className="text-2xl font-bold text-slate-900">{patient.name}</TableCell>
                      <TableCell>
                        <Badge className={`text-lg px-4 py-1 rounded-full border-none font-bold ${
                          patient.status === 'Admit' ? 'bg-orange-100 text-orange-700' :
                          patient.status === 'X-Ray' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {patient.status === 'Admit' ? 'รับไว้รักษา (Admit)' : 
                           patient.status === 'X-Ray' ? 'กำลังเอกซเรย์' : 'รอตรวจ'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xl text-slate-600 font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-[#b22222]" />
                          {patient.destination}
                        </div>
                      </TableCell>
                      <TableCell className="text-xl text-slate-500">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          {patient.arrival} น.
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-60 text-center text-slate-400 text-xl font-medium">
                      ไม่พบรายชื่อผู้ป่วยที่ค้นหา
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard title="ติดต่อประชาสัมพันธ์" content="053-910-100 ต่อ 0" icon={<Phone className="h-6 w-6" />} />
          <InfoCard title="จุดรับแจ้งสิทธิรักษา" content="ชั้น 1 อาคารหมอกัมพล/อาคารหมอบริกส์ โรงพยาบาลโอเวอร์บรุ๊คเชียงราย" icon={<CreditCard className="h-6 w-6" />} />
          <InfoCard title="สอบถามอาการเพิ่มเติม" content="กรุณาติดต่อเคาน์เตอร์พยาบาล" icon={<Info className="h-6 w-6" />} />
        </div>
      </main>

      <footer className="p-8 text-center text-slate-400 text-sm">
        © 2024 โรงพยาบาลโอเวอร์บรุ๊คเชียงราย — ระบบบริหารจัดการภาวะวิกฤต (MCI System)
      </footer>
    </div>
  );
}

function InfoCard({ title, content, icon }: { title: string; content: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 flex items-center gap-4 h-full">
      <div className="h-12 w-12 bg-[#b22222]/10 rounded-full flex items-center justify-center text-[#b22222] shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  );
}
