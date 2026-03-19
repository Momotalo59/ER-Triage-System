
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { KPICards } from "@/components/dashboard/kpi-cards";
import { PatientTable } from "@/components/dashboard/patient-table";
import { ResourceWidgets } from "@/components/dashboard/resource-widgets";
import { Patient, MCIPlan } from "@/lib/types";
import { 
  Plus, 
  MapPin, 
  Calendar,
  RefreshCw,
  LayoutList,
  Edit,
  Monitor,
  Droplets,
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
import { useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking, useDoc, updateDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, doc, where } from "firebase/firestore";

export default function CrisisTriageDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('id');
  const { toast } = useToast();
  const firestore = useFirestore();
  
  // Fetch specific plan details
  const planDocRef = useMemoFirebase(() => planId ? doc(firestore, 'mci_plans', planId) : null, [planId]);
  const { data: planData } = useDoc<MCIPlan>(planDocRef);

  const [planName, setPlanName] = useState("กำลังโหลดข้อมูล...");
  const [planLocation, setPlanLocation] = useState("กำลังโหลด...");
  const [isPlanEditOpen, setIsPlanEditOpen] = useState(false);
  const [tempPlanName, setTempPlanName] = useState("");
  const [tempPlanLocation, setTempPlanLocation] = useState("");

  useEffect(() => {
    if (planData) {
      setPlanName(planData.title);
      setPlanLocation(planData.location);
      setTempPlanName(planData.title);
      setTempPlanLocation(planData.location);
    }
  }, [planData]);

  // Fetch patients filtered by planId
  const patientsRef = collection(firestore, 'patients');
  const memoizedQuery = useMemoFirebase(() => {
    // ปรับ Query ให้เรียบง่ายที่สุดเพื่อเลี่ยงปัญหา Index Permission ในช่วงแรก
    if (planId) {
      return query(patientsRef, where('planId', '==', planId));
    }
    return query(patientsRef);
  }, [planId]);

  const { data: patientsData, isLoading: isPatientsLoading } = useCollection<Patient>(memoizedQuery);
  const patients = (patientsData || []).sort((a, b) => {
    // จัดเรียงข้อมูลใน Client side แทนเพื่อให้ Query ไม่ติดเรื่อง Index
    return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
  });

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
    const timer = setInterval(updateTime, 1000); 
    return () => clearInterval(timer);
  }, []);

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
    setPlanName(tempPlanName);
    setPlanLocation(tempPlanLocation);
    setIsPlanEditOpen(false);
    toast({
      title: "บันทึกสำเร็จ",
      description: "ข้อมูลเหตุการณ์ถูกอัปเดตในฐานข้อมูลแล้ว",
    });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sarabun text-slate-900">
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
              <h1 className="text-2xl font-bold text-white">
                {planName}
              </h1>
              <div className="flex items-center gap-4 text-xs opacity-90 mt-1 text-white">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {currentDateTime || "กำลังโหลด..."}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {planLocation}
                </span>
                <span className="flex items-center gap-1 text-yellow-300">
                  <RefreshCw className="h-3 w-3 animate-spin-slow" /> เชื่อมต่อฐานข้อมูลจริง
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
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-8 bg-black/20 hover:bg-black/40 text-white border-none gap-2"
              onClick={() => router.push(`/relative-board?id=${planId}`)}
            >
              <Monitor className="h-4 w-4" /> บอร์ดญาติ
            </Button>
            <Button 
              size="sm" 
              className="h-8 bg-yellow-400 hover:bg-yellow-500 text-black font-bold gap-2" 
              onClick={() => router.push(`/add-patient?planId=${planId}`)}
            >
              <Plus className="h-4 w-4" /> เพิ่มผู้ป่วย
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-8 bg-white text-black hover:bg-slate-100 gap-2"
              onClick={() => scrollToSection('blood-section')}
            >
              <Droplets className="h-4 w-4 text-red-600" /> หมู่เลือด
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-8 bg-white text-black hover:bg-slate-100 gap-2"
              onClick={() => scrollToSection('ventilator-section')}
            >
              <div className="relative h-4 w-4 overflow-hidden">
                <Image 
                  src="https://img2.pic.in.th/depositphotos_399665024-stock-illustration-lungs-silhouette-with-tracheal-branches.webp" 
                  alt="Ventilator" 
                  fill
                  className="object-contain"
                />
              </div>
              เครื่องช่วยหายใจ
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
          <div className="bg-[#b22222] text-white px-4 py-2 flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2 text-white">
              <LayoutList className="h-4 w-4 text-white" /> รายชื่อผู้ป่วย ({isPatientsLoading ? '...' : patients.length} ราย)
            </h2>
            <Button size="sm" className="h-7 bg-white text-black hover:bg-slate-100" onClick={() => router.push(`/add-patient?planId=${planId}`)}>
              <Plus className="h-3.5 w-3.5" /> เพิ่มรายใหม่
            </Button>
          </div>
          <PatientTable 
            patients={patients} 
            onEdit={(p) => router.push(`/add-patient?id=${p.id}&planId=${planId}`)} 
            onDelete={handleDeletePatient} 
          />
        </section>

        <ResourceWidgets patients={patients} />
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

      <Toaster />
    </div>
  );
}
