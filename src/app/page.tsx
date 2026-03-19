
"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Edit, 
  LayoutDashboard, 
  XCircle,
  AlertTriangle,
  Trash2,
  Loader2,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { MCIPlan, Patient } from "@/lib/types";

const TriageBox = React.memo(function TriageBox({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className={`${color} rounded-2xl p-4 flex flex-col items-center justify-center text-white min-h-[100px] shadow-sm`}>
      <span className="text-4xl font-black leading-none mb-1 text-white">{count}</span>
      <span className="text-xs font-bold opacity-80 uppercase tracking-tighter text-white">{label}</span>
    </div>
  );
});

export default function MCIListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const mciPlansRef = collection(firestore, 'mci_plans');
  const plansQuery = useMemoFirebase(() => query(mciPlansRef, orderBy('timestamp', 'desc')), []);
  const { data: mciPlans, isLoading: isPlansLoading } = useCollection<MCIPlan>(plansQuery);

  const patientsRef = collection(firestore, 'patients');
  const patientsQuery = useMemoFirebase(() => query(patientsRef), []);
  const { data: allPatients, isLoading: isPatientsLoading } = useCollection<Patient>(patientsQuery);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState("");
  const [newPlanLocation, setNewPlanLocation] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<{ id: string, title: string } | null>(null);

  const planStatsMap = useMemo(() => {
    const map: Record<string, { red: number; yellow: number; green: number; black: number; total: number }> = {};
    if (!allPatients) return map;
    
    for (const p of allPatients) {
      const pId = p.planId || 'unknown';
      if (!map[pId]) {
        map[pId] = { red: 0, yellow: 0, green: 0, black: 0, total: 0 };
      }
      map[pId].total++;
      if (p.triageLevel === 'Critical') map[pId].red++;
      else if (p.triageLevel === 'Urgent') map[pId].yellow++;
      else if (p.triageLevel === 'Minor') map[pId].green++;
      else if (p.triageLevel === 'Deceased') map[pId].black++;
    }
    return map;
  }, [allPatients]);

  const handleDeleteClick = useCallback((id: string, title: string) => {
    setPlanToDelete({ id, title });
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmDeleteMCI = useCallback(() => {
    if (planToDelete) {
      const docRef = doc(firestore, 'mci_plans', planToDelete.id);
      deleteDocumentNonBlocking(docRef);
      toast({
        variant: "destructive",
        title: "ลบแผนสำเร็จ",
        description: `แผน ${planToDelete.title} ถูกลบออกจากฐานข้อมูลแล้ว`,
      });
      setIsDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  }, [planToDelete, firestore, toast]);

  const handleClosePlan = useCallback((id: string, title: string) => {
    const docRef = doc(firestore, 'mci_plans', id);
    updateDocumentNonBlocking(docRef, { status: 'Closed' });
    toast({
      title: "ปิดแผนสำเร็จ",
      description: `สถานะของแผน ${title} ถูกเปลี่ยนเป็น 'ปิดแล้ว'`,
    });
  }, [firestore, toast]);

  const handleConfirmCreatePlan = () => {
    if (!newPlanTitle || !newPlanLocation) {
      toast({
        variant: "destructive",
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาระบุชื่อแผนและสถานที่เกิดเหตุ",
      });
      return;
    }

    const now = new Date();
    const newPlan = {
      title: newPlanTitle,
      location: newPlanLocation,
      date: now.toLocaleDateString('th-TH'),
      time: now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: 'Open',
      timestamp: now.toISOString()
    };
    
    addDocumentNonBlocking(mciPlansRef, newPlan);
    setIsCreateDialogOpen(false);
    setNewPlanTitle("");
    setNewPlanLocation("");
    
    toast({ title: "สร้างแผนใหม่สำเร็จ", description: `แผน ${newPlanTitle} ถูกเพิ่มลงในฐานข้อมูลแล้ว` });
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sarabun text-slate-900 pb-20">
      <header className="bg-[#b22222] text-white p-6 shadow-lg">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="relative bg-white p-1 rounded-xl w-16 h-16 flex items-center justify-center overflow-hidden shadow-inner">
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
              <h1 className="text-4xl font-bold tracking-tight text-white">ระบบอุบัติเหตุหมู่ (MCI)</h1>
              <p className="text-lg opacity-90 mt-1 font-light text-white">
                Mass Casualty Incident — จุดบัญชาการเหตุการณ์ โรงพยาบาลโอเวอร์บรุ๊คเชียงราย
              </p>
            </div>
          </div>
          <Button 
            className="bg-white/10 hover:bg-white/20 border-2 border-white text-white rounded-full px-8 py-7 text-xl font-black gap-3 transition-all"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-7 w-7" /> เปิดแผน MCI ใหม่
          </Button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-8">
        {(isPlansLoading || isPatientsLoading) ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#b22222]" />
            <p className="text-slate-500 font-medium">กำลังโหลดข้อมูลแผนงาน...</p>
          </div>
        ) : !mciPlans || mciPlans.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-slate-300">
            <AlertTriangle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 text-xl font-medium">ไม่พบรายการแผน MCI ในฐานข้อมูล</p>
            <Button variant="link" onClick={() => setIsCreateDialogOpen(true)} className="text-[#b22222] font-bold mt-2">
              สร้างแผนแรกของคุณที่นี่
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mciPlans.map((mci) => {
              const stats = planStatsMap[mci.id] || { red: 0, yellow: 0, green: 0, black: 0, total: 0 };
              return (
                <div key={mci.id} className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-200 transition-all hover:translate-y-[-4px]">
                  <div className={`${mci.status === 'Open' ? 'bg-[#b22222]' : 'bg-[#4a5568]'} text-white p-4 flex justify-between items-center px-5`}>
                    <div className="flex items-center gap-3 font-bold truncate">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="text-lg truncate">{mci.title}</span>
                    </div>
                    <Badge className={`${mci.status === 'Open' ? 'bg-[#2a9d8f]' : 'bg-[#718096]'} border-none text-xs font-black px-3 py-1 uppercase text-white`}>
                      {mci.status === 'Open' ? 'เปิดอยู่' : 'ปิดแล้ว'}
                    </Badge>
                  </div>

                  <div className="p-6 flex-1">
                    <div className="flex flex-col gap-3 text-slate-500 text-sm mb-8">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-[#b22222]" /> <span className="text-slate-700 font-medium">{mci.date} {mci.time} น.</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-[#b22222]" /> <span className="text-slate-700 font-medium truncate">{mci.location}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mb-8">
                      <TriageBox color="bg-[#e63946]" label="แดง" count={stats.red} />
                      <TriageBox color="bg-[#ffb703]" label="เหลือง" count={stats.yellow} />
                      <TriageBox color="bg-[#2a9d8f]" label="เขียว" count={stats.green} />
                      <TriageBox color="bg-[#212529]" label="ดำ" count={stats.black} />
                    </div>

                    <div className="flex justify-between items-center mt-6">
                      <div className="flex flex-col">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">จำนวนผู้ป่วย</span>
                        <span className="text-slate-900 font-black text-xl">รวม {stats.total} ราย</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          asChild
                          variant="outline" 
                          size="icon" 
                          className="h-12 w-12 border-slate-300 bg-slate-900 rounded-xl hover:bg-slate-800"
                        >
                          <Link href={`/dashboard?id=${mci.id}`}>
                            <Edit className="h-6 w-6 text-white" />
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-12 w-12 border-red-100 bg-red-50 hover:bg-red-100 rounded-xl"
                          onClick={() => handleDeleteClick(mci.id, mci.title)}
                        >
                          <Trash2 className="h-6 w-6 text-red-600" />
                        </Button>
                        <Button 
                          asChild
                          className="bg-[#e63946] hover:bg-[#c62828] text-white gap-2 px-6 h-12 font-black rounded-xl shadow-lg shadow-red-100"
                        >
                          <Link href={`/dashboard?id=${mci.id}`}>
                            <LayoutDashboard className="h-5 w-5" /> บอร์ดหลัก
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 bg-slate-50/50">
                    <Button 
                      variant="ghost" 
                      className={`w-full h-14 font-bold gap-2 rounded-none transition-colors ${mci.status === 'Open' ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-300 cursor-not-allowed opacity-50'}`}
                      onClick={() => mci.status === 'Open' && handleClosePlan(mci.id, mci.title)}
                      disabled={mci.status === 'Closed'}
                    >
                       <XCircle className="h-5 w-5" /> ปิดแผน MCI
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white text-slate-900 border-slate-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#b22222] font-bold text-xl">
              <Plus className="h-6 w-6 text-[#b22222]" /> เปิดแผน MCI ใหม่
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newPlanTitle" className="font-bold text-slate-700">ชื่อเหตุการณ์ / แผน MCI</Label>
              <Input 
                id="newPlanTitle" 
                placeholder="ระบุชื่อเหตุการณ์ เช่น เพลิงไหม้..."
                className="bg-slate-50 border-slate-200 text-slate-900 h-12"
                value={newPlanTitle} 
                onChange={(e) => setNewPlanTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPlanLocation" className="font-bold text-slate-700">สถานที่เกิดเหตุ</Label>
              <Input 
                id="newPlanLocation" 
                placeholder="ระบุสถานที่..."
                className="bg-slate-50 border-slate-200 text-slate-900 h-12"
                value={newPlanLocation} 
                onChange={(e) => setNewPlanLocation(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-slate-200 text-slate-600 h-12" onClick={() => setIsCreateDialogOpen(false)}>ยกเลิก</Button>
            <Button className="bg-[#b22222] hover:bg-[#8b1a1a] text-white font-bold gap-2 h-12 px-6" onClick={handleConfirmCreatePlan}>
              <Check className="h-4 w-4" /> ยืนยันการเปิดแผน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white text-slate-900 border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="h-6 w-6" /> ยืนยันการลบแผน MCI
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-lg py-2">
              คุณต้องการลบแผน <strong>"{planToDelete?.title}"</strong> ใช่หรือไม่? <br />
              การลบทิ้งจะส่งผลถาวรและไม่สามารถกู้คืนข้อมูลได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="border-slate-200 text-slate-600 h-12 px-6 font-medium hover:bg-slate-50">
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white font-bold h-12 px-8 rounded-lg shadow-lg"
              onClick={confirmDeleteMCI}
            >
              ลบทิ้งถาวร
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
