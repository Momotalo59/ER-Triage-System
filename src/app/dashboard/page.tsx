
"use client";

import React, { useState, useEffect, useMemo } from 'react';
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

// Memoized RealTimeClock to prevent re-rendering the entire page
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

  return <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {time || "กำลังโหลด..."}</span>;
});

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

  const [isPlanEditOpen, setIsPlanEditOpen] = useState(false);
  const [tempPlanName, setTempPlanName] = useState("");
  const [tempPlanLocation, setTempPlanLocation] = useState("");

  const [isBloodEditOpen, setIsBloodEditOpen] = useState(false);
  const [isVentEditOpen, setIsVentEditOpen] = useState(false);
  const [tempBlood, setTempBlood] = useState({ 'A': 0, 'B': 0, 'AB': 0, 'O': 0 });
  const [tempVents, setTempVents] = useState<VentilatorDept[]>([]);

  useEffect(() => {
    if (planData) {
      setTempPlanName(planData.title);
      setTempPlanLocation(planData.location);
    }
  }, [planData]);

  useEffect(() => {
    if (resources) {
      setTempBlood(resources.bloodInventory || { 'A': 0, 'B': 0, 'AB': 0, 'O': 0 });
      setTempVents(resources.ventilators || []);
    }
  }, [resources, isBloodEditOpen, isVentEditOpen]);

  const patientsRef = collection(firestore, 'patients');
  const memoizedQuery = useMemoFirebase(() => {
    if (planId) {
      return query(patientsRef, where('planId', '==', planId));
    }
    return query(patientsRef);
  }, [planId]);

  const { data: patientsData, isLoading: isPatientsLoading } = useCollection<Patient>(memoizedQuery);
  
  // Memoize sorted patients to improve performance
  const patients = useMemo(() => {
    return (patientsData || []).sort((a, b) => {
      return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
    });
  }, [patientsData]);

  const handleDeletePatient = (id: string) => {
    if (confirm('ยืนยันการลบข้อมูล?')) {
      const docRef = doc(firestore, 'patients', id);
      deleteDocumentNonBlocking(docRef);
      toast({
        title: "ลบข้อมูลสำเร็จ",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePlan = () => {
    if (planId) {
       const docRef = doc(firestore, 'mci_plans', planId);
       updateDocumentNonBlocking(docRef, { 
         title: tempPlanName, 
         location: tempPlanLocation 
       });
    }
    setIsPlanEditOpen(false);
    toast({
      title: "บันทึกสำเร็จ",
      description: "ข้อมูลเหตุการณ์ถูกอัปเดตเรียบร้อยแล้ว",
    });
  };

  const handleSaveResources = (updatedResources: Partial<ResourceSummary>) => {
    setDocumentNonBlocking(resourceDocRef, {
      ...resources,
      ...updatedResources
    }, { merge: true });
    setIsBloodEditOpen(false);
    setIsVentEditOpen(false);
    toast({
      title: "บันทึกข้อมูลสำเร็จ",
      description: "ข้อมูลทรัพยากรถูกอัปเดตเรียบร้อยแล้ว",
    });
  };

  const handleAddVentDept = () => {
    setTempVents([...tempVents, { id: Date.now().toString(), name: '', vent: 0, bird: 0 }]);
  };

  const handleRemoveVentDept = (id: string) => {
    setTempVents(tempVents.filter(d => d.id !== id));
  };

  const handleUpdateVentDept = (id: string, field: keyof VentilatorDept, value: string | number) => {
    setTempVents(tempVents.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sarabun text-slate-900">
      <header className="bg-[#b22222] text-white p-4 shadow-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-md w-14 h-14 flex items-center justify-center overflow-hidden shadow-sm text-slate-900">
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
              <h1 className="text-2xl font-bold text-white">
                {planData?.title || "กำลังโหลดข้อมูล..."}
              </h1>
              <div className="flex items-center gap-4 text-[10px] opacity-90 mt-1 text-white">
                <RealTimeClock />
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {planData?.location || "กำลังโหลด..."}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-8 bg-black/20 hover:bg-black/40 text-white border-none gap-2 text-xs"
              onClick={() => router.push('/')}
            >
              <LayoutList className="h-4 w-4" /> รายการ MCI
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-8 bg-black/20 hover:bg-black/40 text-white border-none gap-2 text-xs"
              onClick={() => {
                setTempPlanName(planData?.title || "");
                setTempPlanLocation(planData?.location || "");
                setIsPlanEditOpen(true);
              }}
            >
              <Edit className="h-4 w-4" /> แก้ไขชื่อแผน
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-8 bg-black/20 hover:bg-black/40 text-white border-none gap-2 text-xs"
              onClick={() => router.push(`/relative-board?id=${planId}`)}
            >
              <Monitor className="h-4 w-4" /> บอร์ดญาติ
            </Button>
            <Button 
              size="sm" 
              className="h-8 bg-yellow-400 hover:bg-yellow-500 text-black font-bold gap-2 text-xs" 
              onClick={() => router.push(`/add-patient?planId=${planId}`)}
            >
              <Plus className="h-4 w-4" /> เพิ่มผู้ป่วย
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-8 bg-white text-black hover:bg-slate-100 gap-2 text-xs"
              onClick={() => setIsBloodEditOpen(true)}
            >
              <Droplets className="h-4 w-4 text-red-600" /> หมู่เลือด
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-8 bg-white text-black hover:bg-slate-100 gap-2 text-xs"
              onClick={() => setIsVentEditOpen(true)}
            >
              <LungsImageIcon className="h-4 w-4" /> เครื่องช่วยหายใจ
            </Button>
            <Button variant="destructive" size="sm" className="h-8 gap-2 text-xs" onClick={() => router.push('/')}>
              <XCircle className="h-4 w-4" /> ปิดแผน
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 space-y-4">
        <KPICards patients={patients} />

        <section className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-[#b22222] text-white px-4 py-2 flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2 text-white text-sm">
              <LayoutList className="h-4 w-4 text-white" /> รายชื่อผู้ป่วย ({isPatientsLoading ? '...' : patients.length} ราย)
            </h2>
            <Button size="sm" className="h-7 bg-white text-black hover:bg-slate-100 text-[10px]" onClick={() => router.push(`/add-patient?planId=${planId}`)}>
              <Plus className="h-3.5 w-3.5" /> เพิ่มรายใหม่
            </Button>
          </div>
          <PatientTable 
            patients={patients} 
            onEdit={(p) => router.push(`/add-patient?id=${p.id}&planId=${planId}`)} 
            onDelete={handleDeletePatient} 
          />
        </section>

        <ResourceWidgets 
          patients={patients} 
          onEditBlood={() => setIsBloodEditOpen(true)} 
          onEditVent={() => setIsVentEditOpen(true)}
        />
      </main>

      <Dialog open={isPlanEditOpen} onOpenChange={setIsPlanEditOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white text-slate-900 border-slate-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#b22222] font-bold">
              <Edit className="h-5 w-5 text-[#b22222]" /> แก้ไขข้อมูลเหตุการณ์
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="planName" className="font-bold text-slate-700">ชื่อเหตุการณ์ / แผน MCI</Label>
              <Input 
                id="planName" 
                className="bg-slate-50 border-slate-200 text-slate-900"
                value={tempPlanName} 
                onChange={(e) => setTempPlanName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="planLocation" className="font-bold text-slate-700">สถานที่เกิดเหตุ</Label>
              <Input 
                id="planLocation" 
                className="bg-slate-50 border-slate-200 text-slate-900"
                value={tempPlanLocation} 
                onChange={(e) => setTempPlanLocation(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-slate-200 text-slate-600" onClick={() => setIsPlanEditOpen(false)}>ยกเลิก</Button>
            <Button className="bg-[#b22222] hover:bg-[#8b1a1a] text-white font-bold gap-2" onClick={handleUpdatePlan}>
              <Check className="h-4 w-4" /> บันทึกการเปลี่ยนแปลง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Blood Stock Dialog */}
      <Dialog open={isBloodEditOpen} onOpenChange={setIsBloodEditOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white text-slate-900 border-slate-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#b22222] text-xl font-bold">
              <Droplets className="h-6 w-6 text-[#b22222]" /> แก้ไขสต็อกหมู่เลือด
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-6">
            {['A', 'B', 'AB', 'O'].map((type) => (
              <div key={type} className="grid gap-2">
                <Label htmlFor={`blood-${type}`} className="font-bold text-slate-700">หมู่เลือด {type}</Label>
                <Input 
                  id={`blood-${type}`}
                  type="number"
                  className="bg-slate-50 border-slate-200 text-slate-900"
                  value={tempBlood[type as keyof typeof tempBlood]}
                  onChange={(e) => setTempBlood(prev => ({
                    ...prev,
                    [type]: parseInt(e.target.value) || 0
                  }))}
                />
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-slate-200 text-slate-600" onClick={() => setIsBloodEditOpen(false)}>ยกเลิก</Button>
            <Button className="bg-[#b22222] hover:bg-[#8b1a1a] text-white font-bold gap-2 px-6" onClick={() => handleSaveResources({ bloodInventory: tempBlood })}>
              <Check className="h-4 w-4" /> บันทึกข้อมูล
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ventilator Dialog */}
      <Dialog open={isVentEditOpen} onOpenChange={setIsVentEditOpen}>
        <DialogContent className="sm:max-w-[550px] bg-white text-slate-900 border-slate-200 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#1a5f7a] text-xl font-bold">
              <LungsImageIcon className="h-6 w-6" /> แก้ไขเครื่องช่วยหายใจ
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {tempVents.map((dept, index) => (
              <div key={dept.id} className="space-y-4 p-4 border border-slate-100 rounded-lg relative bg-slate-50/50">
                <button 
                  onClick={() => handleRemoveVentDept(dept.id)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="grid gap-2">
                  <Label className="font-bold text-xs text-slate-700">ชื่อแผนก/หน่วยงาน</Label>
                  <Input 
                    placeholder="เช่น ER, ICU, ศูนย์ฯ"
                    className="bg-white border-slate-200 text-slate-900"
                    value={dept.name}
                    onChange={(e) => handleUpdateVentDept(dept.id, 'name', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="font-bold text-xs text-slate-700">Vent (เครื่อง)</Label>
                    <Input 
                      type="number"
                      className="bg-white border-slate-200 text-slate-900"
                      value={dept.vent}
                      onChange={(e) => handleUpdateVentDept(dept.id, 'vent', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-bold text-xs text-slate-700">Bird (เครื่อง)</Label>
                    <Input 
                      type="number"
                      className="bg-white border-slate-200 text-slate-900"
                      value={dept.bird}
                      onChange={(e) => handleUpdateVentDept(dept.id, 'bird', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full border-dashed border-2 hover:bg-slate-50 gap-2 h-12 text-slate-500"
              onClick={handleAddVentDept}
            >
              <Plus className="h-4 w-4" /> เพิ่มแผนกใหม่
            </Button>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-slate-200 text-slate-600" onClick={() => setIsVentEditOpen(false)}>ยกเลิก</Button>
            <Button className="bg-[#1a5f7a] hover:bg-[#134458] text-white font-bold gap-2 px-6" onClick={() => handleSaveResources({ ventilators: tempVents })}>
              <Check className="h-4 w-4" /> บันทึกข้อมูล
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
