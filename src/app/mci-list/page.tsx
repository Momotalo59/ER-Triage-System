
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Edit, 
  LayoutDashboard, 
  XCircle,
  AlertTriangle,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

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

const MOCK_MCI_DATA: MCICardProps[] = [
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
    title: '123456',
    location: '-',
    date: '13/03/2569',
    time: '13:53',
    status: 'Closed',
    stats: { red: 1, yellow: 1, green: 1, black: 0 }
  },
  {
    id: '3',
    title: '12345',
    location: '-',
    date: '12/03/2569',
    time: '20:41',
    status: 'Open',
    stats: { red: 1, yellow: 0, green: 0, black: 1 }
  }
];

export default function MCIListPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sarabun">
      {/* Header ตามรูปภาพ */}
      <header className="bg-[#b22222] text-white p-6 shadow-lg">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-lg">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 17H21C21.5523 17 22 16.5523 22 16V10C22 9.44772 21.5523 9 21 9H18.422C17.9158 9 17.4479 9.2731 17.2005 9.7142L15.6 12.5714H13V6C13 5.44772 12.5523 5 12 5H2C1.44772 5 1 5.44772 1 6V17C1 17.5523 1.44772 18 2 18H4C4 19.1046 4.89543 20 6 20C7.10457 20 8 19.1046 8 18H15C15 19.1046 15.8954 20 17 20C18.1046 20 19 19.1046 19 18C20.1046 18 21 17.1046 21 16H19V17ZM6 19C5.44772 19 5 18.5523 5 18C5 17.4477 5.44772 17 6 17C6.55228 17 7 17.4477 7 18C7 18.5523 6.55228 19 6 19ZM17 19C16.4477 19 16 18.5523 16 18C16 17.4477 16.4477 17 17 17C17.5523 17 18 17.4477 18 18C18 18.5523 17.5523 19 17 19ZM11 16H3V7H11V16Z" fill="#b22222"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">ระบบอุบัติเหตุหมู่ (MCI)</h1>
              <p className="text-sm opacity-80">Mass Casualty Incident — จุดบัญชาการเหตุการณ์ โรงพยาบาลศรีสะเกษ</p>
            </div>
          </div>
          <Button className="bg-white/10 hover:bg-white/20 border border-white text-white rounded-full px-6 py-6 text-lg font-bold gap-2">
            <Plus className="h-6 w-6" /> เปิดแผน MCI ใหม่
          </Button>
        </div>
      </header>

      {/* Grid รายการ Card */}
      <main className="max-w-[1600px] mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_MCI_DATA.map((mci) => (
            <div key={mci.id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col border border-slate-200">
              {/* Card Header */}
              <div className={`${mci.status === 'Open' ? 'bg-[#b22222]' : 'bg-slate-500'} text-white p-3 flex justify-between items-center px-4`}>
                <div className="flex items-center gap-2 font-bold truncate">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="truncate">{mci.title}</span>
                </div>
                <Badge className={`${mci.status === 'Open' ? 'bg-[#2a9d8f]' : 'bg-slate-600'} border-none text-[10px] font-bold`}>
                  {mci.status === 'Open' ? 'เปิดอยู่' : 'ปิดแล้ว'}
                </Badge>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1">
                <div className="flex flex-col gap-2 text-slate-500 text-sm mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> {mci.date} {mci.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> {mci.location}
                  </div>
                </div>

                {/* Triage Boxes */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  <TriageBox color="bg-[#e63946]" label="แดง" count={mci.stats.red} />
                  <TriageBox color="bg-[#ffb703]" label="เหลือง" count={mci.stats.yellow} />
                  <TriageBox color="bg-[#2a9d8f]" label="เขียว" count={mci.stats.green} />
                  <TriageBox color="bg-[#212529]" label="ดำ" count={mci.stats.black} />
                </div>

                <div className="flex justify-between items-center mt-4">
                  <span className="text-slate-400 font-bold text-sm">รวม {mci.stats.red + mci.stats.yellow + mci.stats.green + mci.stats.black} ราย</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="h-10 w-10 border-slate-300">
                      <Edit className="h-5 w-5 text-slate-500" />
                    </Button>
                    <Button 
                      className="bg-[#e63946] hover:bg-[#c62828] text-white gap-2 px-4 h-10 font-bold"
                      onClick={() => router.push('/')}
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Button>
                  </div>
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="border-t border-slate-100">
                <Button variant="ghost" className="w-full h-12 text-slate-400 hover:text-slate-600 font-bold gap-2">
                   <XCircle className="h-4 w-4" /> ปิดแผน MCI
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function TriageBox({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className={`${color} rounded-xl p-3 flex flex-col items-center justify-center text-white min-h-[90px]`}>
      <span className="text-3xl font-black">{count}</span>
      <span className="text-[10px] font-bold opacity-90">{label}</span>
    </div>
  );
}
