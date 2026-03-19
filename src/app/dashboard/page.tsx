
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KPICards } from "@/components/dashboard/kpi-cards";
import { PatientTable } from "@/components/dashboard/patient-table";
import { ResourceWidgets } from "@/components/dashboard/resource-widgets";
import { Patient, ResourceSummary } from "@/lib/types";
import { 
  Plus, 
  MapPin, 
  Calendar,
  RefreshCw,
  LayoutList,
  Edit,
  Monitor,
  Droplets,
  Wind,
  XCircle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

const MOCK_PATIENTS: Patient[] = [
  { id: '1', scene: 'แดง 1', triageLevel: 'Critical', name: '-', hn: '-', age: 0, edTriage: 'Critical', diagnosis: 'Acute psychosis', status: 'Admit', destination: 'หอผู้ป่วยกมลรักษ์', o2: '-', arrival: '10:04', disp: '-', blood: '-', note: '', timestamp: new Date().toISOString() },
  { id: '2', scene: 'แดง 2', triageLevel: 'Critical', name: '-', hn: '-', age: 0, edTriage: 'Critical', diagnosis: 'SDH SAH', status: 'Admit', destination: 'Ns ICU', o2: 'ETT', arrival: '10:19', disp: '-', blood: '-', note: '', timestamp: new Date().toISOString() },
  { id: '3', scene: 'แดง 3', triageLevel: 'Critical', name: '-', hn: '-', age: 0, edTriage: 'Critical', diagnosis: 'Tension pneumothorax', status: 'Admit', destination: 'ตึกกุมารเวชกรรม2', o2: '-', arrival: '10:28', disp: '-', blood: '-', note: '', timestamp: new Date().toISOString() },
  { id: '4', scene: 'แดง 4', triageLevel: 'Critical', name: '-', hn: '-', age: 0, edTriage: 'Critical', diagnosis: 'Second degree burn 30%', status: 'Admit', destination: 'SICU (อาคาร10 ชั้น3)', o2: 'ETT', arrival: '10:34', disp: '-', blood: '-', note: '', timestamp: new Date().toISOString() },
  { id: '5', scene: 'แดง 5', triageLevel: 'Critical', name: '-', hn: '-', age: 0, edTriage: 'Critical', diagnosis: 'EDH c skull fracture', status: 'Admit', destination: 'Neuro Surgery', o2: 'ETT', arrival: '10:34', disp: '-', blood: '-', note: '', timestamp: new Date().toISOString() },
];

const MOCK_RESOURCES: ResourceSummary = {
  bloodInventory: { 'A': 84, 'B': 229, 'AB': 38, 'O': 91 },
  ventilators: {
    er: { vent: 5, bird: 2 },
    center: { vent: 21, bird: 4 }
  }
};

export default function CrisisTriageDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [isPlanEditOpen, setIsPlanEditOpen] = useState(false);
  
  const [planName, setPlanName] = useState("เพลิงไหม้โรงเรียนสตรีสิริเกศ");
  const [planLocation, setPlanLocation] = useState("โรงเรียนสตรีสิริเกศ");
  const [tempPlanName, setTempPlanName] = useState(planName);
  const [tempPlanLocation, setTempPlanLocation] = useState(planLocation);

  const [currentDateTime, setCurrentDateTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear() + 543;
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentDateTime(`${day}/${month}/${year} ${hours}:${minutes}:${seconds}`);
    };
    
    updateTime();
    const timer = setInterval(updateTime, 15000); 
    return () => clearInterval(timer);
  }, []);

  const handleDeletePatient = (id: string) => {
    if (confirm('ยืนยันการลบข้อมูล?')) {
      setPatients(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleUpdatePlan = () => {
    setPlanName(tempPlanName);
    setPlanLocation(tempPlanLocation);
    setIsPlanEditOpen(false);
    toast({
      title: "บันทึกสำเร็จ",
      description: "ข้อมูลเหตุการณ์ถูกอัปเดตแล้ว",
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] font-sarabun text-slate-900">
      <header className="bg-[#b22222] text-white p-4 shadow-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-md w-14 h-14 flex items-center justify-center overflow-hidden shadow-sm">
               <Image 
                 src="https://img1.pic.in.th/images/LOGO-OVERBROOK-2023-03_0.png" 
                 alt="Overbrook Logo" 
                 width={56}
                 height={56}
                 className="object-contain"
                 priority
               />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {planName}
              </h1>
              <div className="flex items-center gap-4 text-xs opacity-90 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {currentDateTime || "กำลังโหลด..."}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {planLocation}
                </span>
                <span className="flex items-center gap-1 text-yellow-300">
                  <RefreshCw className="h-3 w-3 animate-spin-slow" /> รีเฟรชอัตโนมัติ (15 วินาที)
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-8 bg-black/20 hover:bg-black/40 text-white border-none gap-2"
              onClick={() => router.push('/')}
            >
              <LayoutList className="h-4 w-4" /> รายการ MCI
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-8 bg-black/20 hover:bg-black/40 text-white border-none gap-2"
              onClick={() => {
                setTempPlanName(planName);
                setTempPlanLocation(planLocation);
                setIsPlanEditOpen(true);
              }}
            >
              <Edit className="h-4 w-4" /> แก้ไขชื่อแผน
            </Button>
            <Button variant="secondary" size="sm" className="h-8 bg-black/20 hover:bg-black/40 text-white border-none gap-2">
              <Monitor className="h-4 w-4" /> บอร์ดญาติ
            </Button>
            <Button 
              size="sm" 
              className="h-8 bg-yellow-400 hover:bg-yellow-500 text-black font-bold gap-2" 
              onClick={() => router.push('/add-patient')}
            >
              <Plus className="h-4 w-4" /> เพิ่มผู้ป่วย
            </Button>
            <Button variant="secondary" size="sm" className="h-8 bg-white text-black hover:bg-slate-100 gap-2">
              <Droplets className="h-4 w-4 text-red-600" /> หมู่เลือด
            </Button>
            <Button variant="secondary" size="sm" className="h-8 bg-white text-black hover:bg-slate-100 gap-2">
              <Wind className="h-4 w-4 text-slate-600" /> เครื่องช่วยหายใจ
            </Button>
            <Button variant="destructive" size="sm" className="h-8 gap-2" onClick={() => router.push('/')}>
              <XCircle className="h-4 w-4" /> ปิดแผน
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 space-y-4">
        <KPICards patients={patients} />

        <section className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-[#e63946] text-white px-4 py-2 flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2">
              <LayoutList className="h-4 w-4" /> รายชื่อผู้ป่วย ({patients.length} ราย)
            </h2>
            <Button size="sm" className="h-7 bg-white text-black hover:bg-slate-100" onClick={() => router.push('/add-patient')}>
              <Plus className="h-3.5 w-3.5" /> เพิ่มรายใหม่
            </Button>
          </div>
          <PatientTable 
            patients={patients} 
            onEdit={(p) => router.push(`/add-patient?id=${p.id}`)} 
            onDelete={handleDeletePatient} 
          />
        </section>

        <ResourceWidgets patients={patients} resources={MOCK_RESOURCES} />
      </main>

      <Dialog open={isPlanEditOpen} onOpenChange={setIsPlanEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#b22222]">
              <Edit className="h-5 w-5" /> แก้ไขข้อมูลเหตุการณ์
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="planName">ชื่อเหตุการณ์ / แผน MCI</Label>
              <Input 
                id="planName" 
                value={tempPlanName} 
                onChange={(e) => setTempPlanName(e.target.value)}
                placeholder="เช่น เพลิงไหม้โรงเรียน..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="planLocation">สถานที่เกิดเหตุ</Label>
              <Input 
                id="planLocation" 
                value={tempPlanLocation} 
                onChange={(e) => setTempPlanLocation(e.target.value)}
                placeholder="เช่น โรงเรียนสตรีสิริเกศ"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPlanEditOpen(false)}>ยกเลิก</Button>
            <Button className="bg-[#b22222] hover:bg-[#8b1a1a] gap-2" onClick={handleUpdatePlan}>
              <Check className="h-4 w-4" /> บันทึกการเปลี่ยนแปลง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
