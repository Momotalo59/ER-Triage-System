
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { KPICards } from "@/components/dashboard/kpi-cards";
import { PatientTable } from "@/components/dashboard/patient-table";
import { ResourceWidgets } from "@/components/dashboard/resource-widgets";
import { Patient, MCIPlan, ResourceSummary, VentilatorDept } from "@/lib/types";
import { 
  Plus, 
  MapPin, 
  Calendar,
  LayoutList,
  Edit,
  Monitor,
  Droplets,
  XCircle,
  Check,
  Trash2
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
import { useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking, useDoc, updateDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase";
import { collection, query, doc, where } from "firebase/firestore";

const LungsImageIcon = ({ className }: { className?: string }) => (
  <div className={`relative ${className} bg-white rounded-sm overflow-hidden flex items-center justify-center`}>
    <Image 
      src="https://img2.pic.in.th/depositphotos_399665024-stock-illustration-lungs-silhouette-with-tracheal-branches.webp"
      alt="Lungs Icon"
      fill
      sizes="20px"
      className="object-contain"
    />
  </div>
);

const RealTimeClock = React.memo(function RealTimeClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear() + 543;
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTime(`${day}/${month}/${year} ${hours}:${minutes}:${seconds}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);
  return <span className="flex items-center gap-1 font-mono"><Calendar className="h-3 w-3" /> {time || "..."}</span>;
});

// แยกส่วน Dialogs ออกมาเป็น Component เพื่อไม่ให้ re-render หน้าหลัก
const BloodStockDialog = ({ open, onOpenChange, currentBlood, onSave }: any) => {
  const [temp, setTemp] = useState(currentBlood);
  useEffect(() => { if (open) setTemp(currentBlood); }, [open, currentBlood]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-white text-slate-900">
        <DialogHeader><DialogTitle className="flex items-center gap-2 text-[#b22222] text-xl font-bold"><Droplets className="h-6 w-6" /> สต็อกหมู่เลือด</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-6 py-6">
          {['A', 'B', 'AB', 'O'].map((type) => (
            <div key={type} className="grid gap-2">
              <Label className="font-bold">หมู่เลือด {type}</Label>
              <Input type="number" value={temp[type] || 0} onChange={(e) => setTemp({...temp, [type]: parseInt(e.target.value) || 0})} />
            </div>
          ))}
        </div>
        <DialogFooter><Button onClick={() => onSave(temp)} className="bg-[#b22222] font-bold">บันทึกข้อมูล</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function CrisisTriageDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('id');
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const planDocRef = useMemoFirebase(() => planId ? doc(firestore, 'mci_plans', planId) : null, [planId]);
  const { data: planData } = useDoc<MCIPlan>(planDocRef);

  const resourceDocRef = doc(firestore, 'resources', 'current');
  const { data: resources } = useDoc<ResourceSummary>(resourceDocRef);

  // States สำหรับ Dialog
  const [isPlanEditOpen, setIsPlanEditOpen] = useState(false);
  const [isBloodEditOpen, setIsBloodEditOpen] = useState(false);
  const [isVentEditOpen, setIsVentEditOpen] = useState(false);

  // ข้อมูลสำรองสำหรับแก้ไข (Isolated from main state during typing)
  const [tempPlan, setTempPlan] = useState({ title: '', location: '' });
  const [tempVents, setTempVents] = useState<VentilatorDept[]>([]);

  useEffect(() => {
    if (planData && isPlanEditOpen) setTempPlan({ title: planData.title, location: planData.location });
  }, [planData, isPlanEditOpen]);

  useEffect(() => {
    if (resources && isVentEditOpen) setTempVents(resources.ventilators || []);
  }, [resources, isVentEditOpen]);

  const patientsRef = collection(firestore, 'patients');
  const memoizedQuery = useMemoFirebase(() => planId ? query(patientsRef, where('planId', '==', planId)) : query(patientsRef), [planId]);
  const { data: patientsData, isLoading: isPatientsLoading } = useCollection<Patient>(memoizedQuery);
  
  const patients = useMemo(() => (patientsData || []).sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()), [patientsData]);

  const handleDeletePatient = useCallback((id: string) => {
    if (confirm('ยืนยันการลบข้อมูล?')) {
      deleteDocumentNonBlocking(doc(firestore, 'patients', id));
      toast({ title: "ลบข้อมูลสำเร็จ", variant: "destructive" });
    }
  }, [firestore, toast]);

  const handleUpdatePlan = () => {
    if (planId) updateDocumentNonBlocking(doc(firestore, 'mci_plans', planId), tempPlan);
    setIsPlanEditOpen(false);
    toast({ title: "บันทึกสำเร็จ", description: "อัปเดตข้อมูลเหตุการณ์แล้ว" });
  };

  const handleSaveResources = (updated: any) => {
    setDocumentNonBlocking(resourceDocRef, updated, { merge: true });
    setIsBloodEditOpen(false);
    setIsVentEditOpen(false);
    toast({ title: "บันทึกสำเร็จ", description: "อัปเดตทรัพยากรแล้ว" });
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sarabun text-slate-900">
      <header className="bg-[#b22222] text-white p-4 shadow-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-md w-14 h-14 flex items-center justify-center overflow-hidden shadow-sm">
               <Image src="https://img1.pic.in.th/images/LOGO-OVERBROOK-2023-03_0.png" alt="Logo" width={56} height={56} className="object-contain" priority />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{planData?.title || "MCI System"}</h1>
              <div className="flex items-center gap-4 text-[10px] opacity-90 mt-1">
                <RealTimeClock />
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {planData?.location || "-"}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" className="bg-black/20 hover:bg-black/40 text-white border-none gap-2 text-xs" onClick={() => router.push('/')}><LayoutList className="h-4 w-4" /> รายการ MCI</Button>
            <Button variant="secondary" size="sm" className="bg-black/20 hover:bg-black/40 text-white border-none gap-2 text-xs" onClick={() => setIsPlanEditOpen(true)}><Edit className="h-4 w-4" /> แก้ไขชื่อแผน</Button>
            <Button variant="secondary" size="sm" className="bg-black/20 hover:bg-black/40 text-white border-none gap-2 text-xs" onClick={() => router.push(`/relative-board?id=${planId}`)}><Monitor className="h-4 w-4" /> บอร์ดญาติ</Button>
            <Button size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold gap-2 text-xs" onClick={() => router.push(`/add-patient?planId=${planId}`)}><Plus className="h-4 w-4" /> เพิ่มผู้ป่วย</Button>
            <Button variant="secondary" size="sm" className="bg-white text-black gap-2 text-xs" onClick={() => setIsBloodEditOpen(true)}><Droplets className="h-4 w-4 text-red-600" /> หมู่เลือด</Button>
            <Button variant="secondary" size="sm" className="bg-white text-black gap-2 text-xs" onClick={() => setIsVentEditOpen(true)}><LungsImageIcon className="h-4 w-4" /> เครื่องช่วยหายใจ</Button>
            <Button variant="destructive" size="sm" className="h-8 gap-2 text-xs" onClick={() => router.push('/')}><XCircle className="h-4 w-4" /> ปิดแผน</Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 space-y-4">
        <KPICards patients={patients} />
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-[#b22222] text-white px-4 py-2 flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2 text-sm"><LayoutList className="h-4 w-4" /> รายชื่อผู้ป่วย ({isPatientsLoading ? '...' : patients.length})</h2>
          </div>
          <PatientTable patients={patients} onEdit={(p) => router.push(`/add-patient?id=${p.id}&planId=${planId}`)} onDelete={handleDeletePatient} />
        </section>
        <ResourceWidgets patients={patients} onEditBlood={() => setIsBloodEditOpen(true)} onEditVent={() => setIsVentEditOpen(true)} />
      </main>

      <Dialog open={isPlanEditOpen} onOpenChange={setIsPlanEditOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white text-slate-900 border-slate-200">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-[#b22222] font-bold"><Edit className="h-5 w-5" /> แก้ไขเหตุการณ์</DialogTitle></DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2"><Label className="font-bold">ชื่อเหตุการณ์</Label><Input value={tempPlan.title} onChange={(e) => setTempPlan({...tempPlan, title: e.target.value})} /></div>
            <div className="grid gap-2"><Label className="font-bold">สถานที่</Label><Input value={tempPlan.location} onChange={(e) => setTempPlan({...tempPlan, location: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={handleUpdatePlan} className="bg-[#b22222]">บันทึก</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <BloodStockDialog open={isBloodEditOpen} onOpenChange={setIsBloodEditOpen} currentBlood={resources?.bloodInventory || {}} onSave={(b: any) => handleSaveResources({ bloodInventory: b })} />

      <Dialog open={isVentEditOpen} onOpenChange={setIsVentEditOpen}>
        <DialogContent className="sm:max-w-[550px] bg-white text-slate-900 max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-[#1a5f7a] text-xl font-bold"><LungsImageIcon className="h-6 w-6" /> เครื่องช่วยหายใจ</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            {tempVents.map((dept, idx) => (
              <div key={dept.id} className="space-y-4 p-4 border rounded-lg relative bg-slate-50">
                <button onClick={() => setTempVents(tempVents.filter(d => d.id !== dept.id))} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                <div className="grid gap-2"><Label className="text-xs font-bold">ชื่อแผนก</Label><Input value={dept.name} onChange={(e) => setTempVents(tempVents.map(d => d.id === dept.id ? {...d, name: e.target.value} : d))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label className="text-xs font-bold">Vent</Label><Input type="number" value={dept.vent} onChange={(e) => setTempVents(tempVents.map(d => d.id === dept.id ? {...d, vent: parseInt(e.target.value) || 0} : d))} /></div>
                  <div className="grid gap-2"><Label className="text-xs font-bold">Bird</Label><Input type="number" value={dept.bird} onChange={(e) => setTempVents(tempVents.map(d => d.id === dept.id ? {...d, bird: parseInt(e.target.value) || 0} : d))} /></div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full border-dashed h-12" onClick={() => setTempVents([...tempVents, { id: Date.now().toString(), name: '', vent: 0, bird: 0 }])}><Plus className="h-4 w-4" /> เพิ่มแผนก</Button>
          </div>
          <DialogFooter><Button onClick={() => handleSaveResources({ ventilators: tempVents })} className="bg-[#1a5f7a]">บันทึก</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
}
