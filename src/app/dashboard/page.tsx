"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
  PlusCircle,
  Trash2,
  Loader2,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  return <span className="flex items-center gap-1 font-mono text-[10px]"><Calendar className="h-3 w-3" /> {time || "..."}</span>;
});

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

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('id') || "";
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const planDocRef = useMemoFirebase(() => planId ? doc(firestore, 'mci_plans', planId) : null, [planId, firestore]);
  const { data: planData } = useDoc<MCIPlan>(planDocRef);

  const resourceDocRef = useMemoFirebase(() => doc(firestore, 'resources', 'current'), [firestore]);
  const { data: resources } = useDoc<ResourceSummary>(resourceDocRef);

  const patientsRef = collection(firestore, 'patients');
  const memoizedQuery = useMemoFirebase(() => planId ? query(patientsRef, where('planId', '==', planId)) : query(patientsRef), [planId, firestore]);
  const { data: patientsData, isLoading: isPatientsLoading } = useCollection<Patient>(memoizedQuery);
  
  const patients = useMemo(() => {
    if (!patientsData) return [];
    return [...patientsData].sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
  }, [patientsData]);

  const [activeDialog, setActiveDialog] = useState<'plan' | 'blood' | 'vent' | null>(null);
  const [tempPlan, setTempPlan] = useState({ title: '', location: '' });
  const [tempVents, setTempVents] = useState<VentilatorDept[]>([]);
  const [tempBlood, setTempBlood] = useState<any>({});

  useEffect(() => {
    if (activeDialog === 'plan' && planData) setTempPlan({ title: planData.title, location: planData.location });
    if (activeDialog === 'blood' && resources) setTempBlood(resources.bloodInventory || {});
    if (activeDialog === 'vent' && resources) setTempVents(resources.ventilators || []);
  }, [activeDialog, planData, resources]);

  const handleDeletePatient = useCallback((id: string) => {
    if (confirm('ยืนยันการลบข้อมูลผู้ป่วย?')) {
      deleteDocumentNonBlocking(doc(firestore, 'patients', id));
      toast({ title: "ลบข้อมูลสำเร็จ", variant: "destructive" });
    }
  }, [firestore, toast]);

  const handleUpdatePlan = () => {
    if (planId) updateDocumentNonBlocking(doc(firestore, 'mci_plans', planId), tempPlan);
    setActiveDialog(null);
    toast({ title: "บันทึกสำเร็จ", description: "อัปเดตข้อมูลเหตุการณ์แล้ว" });
  };

  const handleSaveResources = (updated: any) => {
    setDocumentNonBlocking(resourceDocRef, updated, { merge: true });
    setActiveDialog(null);
    toast({ title: "บันทึกสำเร็จ", description: "อัปเดตทรัพยากรเรียบร้อย" });
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sarabun text-slate-900">
      <header className="bg-[#b22222] text-white p-4 shadow-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="bg-white p-1 rounded-md w-12 h-12 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
               <Image src="https://img1.pic.in.th/images/LOGO-OVERBROOK-2023-03_0.png" alt="Logo" width={48} height={48} className="object-contain" priority />
            </Link>
            <div>
              <h1 className="text-xl font-bold truncate max-w-[300px]">{planData?.title || "MCI System"}</h1>
              <div className="flex items-center gap-3 opacity-90">
                <RealTimeClock />
                <span className="flex items-center gap-1 text-[10px]"><MapPin className="h-3 w-3" /> {planData?.location || "-"}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm" className="bg-black/20 hover:bg-black/40 text-white border-none gap-1.5 h-8 text-[11px]">
              <Link href="/">
                <LayoutList className="h-3.5 w-3.5" /> รายการ MCI
              </Link>
            </Button>
            <Button variant="secondary" size="sm" className="bg-black/20 hover:bg-black/40 text-white border-none gap-1.5 h-8 text-[11px]" onClick={() => setActiveDialog('plan')}>
              <Edit className="h-3.5 w-3.5" /> แก้ไขชื่อแผน
            </Button>
            <Button asChild variant="secondary" size="sm" className="bg-black/20 hover:bg-black/40 text-white border-none gap-1.5 h-8 text-[11px]">
              <Link href={`/relative-board?id=${planId}`} prefetch={true}>
                <Monitor className="h-3.5 w-3.5" /> บอร์ดญาติ
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold gap-1.5 h-8 text-[11px]">
              <Link href={`/add-patient?planId=${planId}`} prefetch={true}>
                <Plus className="h-3.5 w-3.5" /> เพิ่มผู้ป่วย
              </Link>
            </Button>
            <Button variant="secondary" size="sm" className="bg-white text-black gap-1.5 h-8 text-[11px] hover:bg-slate-100" onClick={() => setActiveDialog('blood')}>
              <Droplets className="h-3.5 w-3.5 text-red-600" /> หมู่เลือด
            </Button>
            <Button variant="secondary" size="sm" className="bg-white text-black gap-1.5 h-8 text-[11px] hover:bg-slate-100" onClick={() => setActiveDialog('vent')}>
              <LungsImageIcon className="h-3.5 w-3.5" /> เครื่องช่วยหายใจ
            </Button>
            <Button asChild variant="destructive" size="sm" className="h-8 gap-1.5 text-[11px]">
              <Link href="/">
                <XCircle className="h-3.5 w-3.5" /> ปิดแผน
              </Link>
            </Button>
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
        <ResourceWidgets patients={patients} onEditBlood={() => setActiveDialog('blood')} onEditVent={() => setActiveDialog('vent')} />
      </main>

      {/* Popups (Dialogs) */}
      <Dialog open={activeDialog === 'plan'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[425px] bg-white text-slate-900 border-slate-200">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-[#b22222] font-bold"><Edit className="h-5 w-5" /> แก้ไขเหตุการณ์</DialogTitle></DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2"><Label className="font-bold">ชื่อเหตุการณ์</Label><Input value={tempPlan.title} onChange={(e) => setTempPlan({...tempPlan, title: e.target.value})} /></div>
            <div className="grid gap-2"><Label className="font-bold">สถานที่</Label><Input value={tempPlan.location} onChange={(e) => setTempPlan({...tempPlan, location: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={handleUpdatePlan} className="bg-[#b22222] font-bold">บันทึก</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'blood'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[400px] bg-white text-slate-900">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-[#b22222] text-xl font-bold"><Droplets className="h-6 w-6" /> สต็อกหมู่เลือด</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-6">
            {['A', 'B', 'AB', 'O'].map((type) => (
              <div key={type} className="grid gap-2">
                <Label className="font-bold">หมู่เลือด {type}</Label>
                <Input type="number" value={tempBlood[type] || 0} onChange={(e) => setTempBlood({...tempBlood, [type]: parseInt(e.target.value) || 0})} />
              </div>
            ))}
          </div>
          <DialogFooter><Button onClick={() => handleSaveResources({ bloodInventory: tempBlood })} className="bg-[#b22222] font-bold">บันทึกข้อมูล</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'vent'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[550px] bg-white text-slate-900 max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-[#1a5f7a] text-xl font-bold"><LungsImageIcon className="h-6 w-6" /> เครื่องช่วยหายใจ</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            {tempVents.map((dept) => (
              <div key={dept.id} className="space-y-4 p-4 border rounded-lg relative bg-slate-50">
                <button onClick={() => setTempVents(tempVents.filter(d => d.id !== dept.id))} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                <div className="grid gap-2"><Label className="text-xs font-bold">ชื่อแผนก</Label><Input value={dept.name} onChange={(e) => setTempVents(tempVents.map(d => d.id === dept.id ? {...d, name: e.target.value} : d))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label className="text-xs font-bold">Vent</Label><Input type="number" value={dept.vent} onChange={(e) => setTempVents(tempVents.map(d => d.id === dept.id ? {...d, vent: parseInt(e.target.value) || 0} : d))} /></div>
                  <div className="grid gap-2"><Label className="text-xs font-bold">Bird</Label><Input type="number" value={dept.bird} onChange={(e) => setTempVents(tempVents.map(d => d.id === dept.id ? {...d, bird: parseInt(e.target.value) || 0} : d))} /></div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full border-dashed h-12" onClick={() => setTempVents([...tempVents, { id: Date.now().toString(), name: '', vent: 0, bird: 0 }])}><PlusCircle className="h-4 w-4" /> เพิ่มแผนก</Button>
          </div>
          <DialogFooter><Button onClick={() => handleSaveResources({ ventilators: tempVents })} className="bg-[#1a5f7a] font-bold">บันทึก</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CrisisTriageDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center font-sarabun">
        <Loader2 className="h-10 w-10 animate-spin text-[#b22222]" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}