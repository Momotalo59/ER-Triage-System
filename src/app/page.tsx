
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Edit, 
  LayoutDashboard, 
  XCircle,
  AlertTriangle,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

interface MCICardProps {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  status: 'Open' | 'Closed';
  stats: {
    red: number;
    yellow: number;
    green: number;
    black: number;
  };
}

const INITIAL_MCI_DATA: MCICardProps[] = [
  {
    id: '1',
    title: 'เพลิงไหม้โรงเรียนสตรีสิริเกศ',
    location: 'โรงเรียนสตรีสิริเกศ',
    date: '18/03/2569',
    time: '09:15',
    status: 'Open',
    stats: { red: 11, yellow: 0, green: 0, black: 0 }
  },
  {
    id: '2',
    title: 'อุบัติเหตุรถทัวร์ชนกัน',
    location: 'ถ.ศรีสะเกษ-อุบล',
    date: '13/03/2569',
    time: '13:53',
    status: 'Closed',
    stats: { red: 1, yellow: 1, green: 1, black: 0 }
  },
  {
    id: '3',
    title: 'อาคารถล่มย่านเศรษฐกิจ',
    location: 'ตลาดสดเทศบาล',
    date: '12/03/2569',
    time: '20:41',
    status: 'Open',
    stats: { red: 1, yellow: 0, green: 0, black: 1 }
  }
];

export default function MCIListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [mciList, setMciList] = useState<MCICardProps[]>(INITIAL_MCI_DATA);

  const handleDeleteMCI = (id: string, title: string) => {
    if (confirm(`คุณต้องการลบแผน "${title}" ใช่หรือไม่?`)) {
      setMciList(prev => prev.filter(item => item.id !== id));
      toast({
        variant: "destructive",
        title: "ลบแผนสำเร็จ",
        description: `แผน ${title} ถูกลบออกจากระบบแล้ว`,
      });
    }
  };

  const handleClosePlan = (title: string) => {
    toast({
      title: "กำลังปิดแผน",
      description: `สถานะของแผน ${title} กำลังถูกเปลี่ยนเป็น 'ปิดแล้ว'`,
    });
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sarabun text-slate-900 pb-20">
      {/* Header ตามรูปภาพ */}
      <header className="bg-[#b22222] text-white p-6 shadow-lg">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-white p-1 rounded-xl w-16 h-16 flex items-center justify-center overflow-hidden shadow-inner">
               <Image 
                 src="https://img1.pic.in.th/images/LOGO-OVERBROOK-2023-03_0.png" 
                 alt="Overbrook Logo" 
                 width={60}
                 height={60}
                 className="object-contain"
                 priority
               />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">ระบบอุบัติเหตุหมู่ (MCI)</h1>
              <p className="text-lg opacity-90 mt-1 font-light">
                Mass Casualty Incident — จุดบัญชาการเหตุการณ์ โรงพยาบาลโอเวอร์บรุ๊คเชียงราย
              </p>
            </div>
          </div>
          <Button 
            className="bg-white/10 hover:bg-white/20 border-2 border-white text-white rounded-full px-8 py-7 text-xl font-black gap-3 transition-all"
            onClick={() => router.push('/dashboard')}
          >
            <Plus className="h-7 w-7" /> เปิดแผน MCI ใหม่
          </Button>
        </div>
      </header>

      {/* Grid รายการ Card */}
      <main className="max-w-[1600px] mx-auto p-8">
        {mciList.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-slate-300">
            <AlertTriangle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 text-xl font-medium">ไม่พบรายการแผน MCI ในขณะนี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mciList.map((mci) => (
              <div key={mci.id} className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-200 transition-transform hover:scale-[1.01]">
                {/* Card Header */}
                <div className={`${mci.status === 'Open' ? 'bg-[#b22222]' : 'bg-slate-600'} text-white p-4 flex justify-between items-center px-5`}>
                  <div className="flex items-center gap-3 font-bold truncate">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="text-lg truncate">{mci.title}</span>
                  </div>
                  <Badge className={`${mci.status === 'Open' ? 'bg-[#2a9d8f]' : 'bg-slate-500'} border-none text-xs font-black px-3 py-1 uppercase`}>
                    {mci.status === 'Open' ? 'เปิดอยู่' : 'ปิดแล้ว'}
                  </Badge>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1">
                  <div className="flex flex-col gap-3 text-slate-500 text-sm mb-8">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-[#b22222]" /> <span className="text-slate-700 font-medium">{mci.date} {mci.time}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-[#b22222]" /> <span className="text-slate-700 font-medium">{mci.location}</span>
                    </div>
                  </div>

                  {/* Triage Boxes */}
                  <div className="grid grid-cols-4 gap-3 mb-8">
                    <TriageBox color="bg-[#e63946]" label="แดง" count={mci.stats.red} />
                    <TriageBox color="bg-[#ffb703]" label="เหลือง" count={mci.stats.yellow} />
                    <TriageBox color="bg-[#2a9d8f]" label="เขียว" count={mci.stats.green} />
                    <TriageBox color="bg-[#212529]" label="ดำ" count={mci.stats.black} />
                  </div>

                  <div className="flex justify-between items-center mt-6">
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">จำนวนผู้ป่วย</span>
                      <span className="text-slate-900 font-black text-xl">รวม {mci.stats.red + mci.stats.yellow + mci.stats.green + mci.stats.black} ราย</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="h-12 w-12 border-slate-300 bg-slate-900 rounded-xl hover:bg-slate-800">
                        <Edit className="h-6 w-6 text-white" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-12 w-12 border-red-100 bg-red-50 hover:bg-red-100 rounded-xl"
                        onClick={() => handleDeleteMCI(mci.id, mci.title)}
                      >
                        <Trash2 className="h-6 w-6 text-red-600" />
                      </Button>
                      <Button 
                        className="bg-[#e63946] hover:bg-[#c62828] text-white gap-2 px-6 h-12 font-black rounded-xl shadow-lg shadow-red-100"
                        onClick={() => router.push('/dashboard')}
                      >
                        <LayoutDashboard className="h-5 w-5" /> DASHBOARD
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Card Footer Button */}
                <div className="border-t border-slate-100 bg-slate-50/50">
                  <Button 
                    variant="ghost" 
                    className="w-full h-14 text-slate-400 hover:text-red-600 hover:bg-red-50 font-bold gap-2 rounded-none transition-colors"
                    onClick={() => handleClosePlan(mci.title)}
                  >
                     <XCircle className="h-5 w-5" /> ปิดแผน MCI
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function TriageBox({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className={`${color} rounded-2xl p-4 flex flex-col items-center justify-center text-white min-h-[100px] shadow-sm`}>
      <span className="text-4xl font-black leading-none mb-1">{count}</span>
      <span className="text-xs font-bold opacity-80 uppercase tracking-tighter">{label}</span>
    </div>
  );
}
