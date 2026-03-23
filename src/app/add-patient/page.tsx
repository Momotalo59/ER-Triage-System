"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronLeft, 
  Save, 
  Activity, 
  MapPin, 
  ClipboardList,
  Thermometer,
  Droplets,
  HeartPulse,
  MessageSquare,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Patient, TriageLevel, PatientStatus } from "@/lib/types";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, updateDocumentNonBlocking, addDocumentNonBlocking, useDoc } from "@/firebase";
import { collection, doc } from "firebase/firestore";

function AddPatientContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('id');
  const planIdFromUrl = searchParams.get('planId');
  const { toast } = useToast();
  const firestore = useFirestore();

  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    hn: '',
    age: 0,
    gender: 'ชาย',
    scene: '',
    symptoms: '',
    triageLevel: 'Minor',
    diagnosis: '',
    destination: 'จุดพักคอย ER',
    status: 'Waiting',
    o2: '',
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    arrival: '',
    disp: '-',
    blood: 'O',
    note: '',
    planId: planIdFromUrl || "",
  });

  const patientDocRef = patientId ? doc(firestore, 'patients', patientId) : null;
  const { data: existingPatient } = useDoc<Patient>(patientDocRef);

  useEffect(() => {
    if (planIdFromUrl) {
      setFormData(prev => ({ ...prev, planId: planIdFromUrl }));
    }
  }, [planIdFromUrl]);

  useEffect(() => {
    if (existingPatient) {
      setFormData(existingPatient);
    }
  }, [existingPatient]);

  useEffect(() => {
    if (!patientId && !formData.arrival) {
      setFormData(prev => ({
        ...prev,
        arrival: new Date().toLocaleTimeString('th-TH', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      }));
    }
  }, [patientId, formData.arrival]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    const currentPlanId = planIdFromUrl || formData.planId || "";
    
    const dataToSave = {
      ...formData,
      planId: currentPlanId,
      timestamp: formData.timestamp || new Date().toISOString(),
      edTriage: formData.triageLevel,
    };

    if (patientId) {
      updateDocumentNonBlocking(doc(firestore, 'patients', patientId), dataToSave);
      toast({
        title: "อัปเดตข้อมูลสำเร็จ",
        description: `แก้ไขข้อมูลผู้ป่วย ${formData.name} เรียบร้อยแล้ว`,
      });
    } else {
      addDocumentNonBlocking(collection(firestore, 'patients'), dataToSave);
      toast({
        title: "ลงทะเบียนสำเร็จ",
        description: `ผู้ป่วย ${formData.name} ถูกเพิ่มเข้าในระบบแล้ว`,
      });
    }
    
    // บังคับเปลี่ยนหน้ากลับทันทีหลังบันทึก เพื่อความรวดเร็วและป้องกันเครื่องค้าง
    if (currentPlanId) {
      router.push(`/dashboard?id=${currentPlanId}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sarabun text-slate-900 pb-10">
      <header className="bg-[#b22222] text-white p-3 shadow-md sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
             <Button 
               variant="ghost" 
               size="icon" 
               className="text-white hover:bg-white/20"
               onClick={() => router.back()}
             >
               <ChevronLeft className="h-6 w-6" />
             </Button>
             <div className="bg-white p-1 rounded-md w-10 h-10 flex items-center justify-center overflow-hidden">
               <Image 
                 src="https://img1.pic.in.th/images/LOGO-OVERBROOK-2023-03_0.png" 
                 alt="Overbrook Logo" 
                 width={40}
                 height={40}
                 className="object-contain"
               />
            </div>
            <h1 className="text-xl font-bold flex items-center gap-2 text-white">
              <Activity className="h-5 w-5" /> {patientId ? 'แก้ไขข้อมูลผู้ป่วย' : 'ลงทะเบียนผู้ป่วยใหม่'}
            </h1>
          </div>
          <Button 
            className="bg-white text-[#b22222] hover:bg-slate-100 font-bold gap-2 rounded-lg h-9"
            onClick={() => handleSubmit()}
          >
            <Save className="h-4 w-4" /> บันทึกข้อมูล
          </Button>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto p-6 mt-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-10">
            <section className="space-y-6">
              <h2 className="text-[#e63946] font-bold flex items-center gap-2 text-2xl border-b border-slate-200 pb-3">
                <ClipboardList className="h-7 w-7" /> ข้อมูลพื้นฐานและอาการ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="name" className="text-slate-600 font-medium">ชื่อ-นามสกุล (หรือสัญลักษณ์ระบุตัวตน)</Label>
                  <Input 
                    id="name" 
                    className="bg-slate-50 border-slate-200 text-slate-900 h-12"
                    placeholder="ระบุชื่อหรือรหัสผู้ป่วย"
                    value={formData.name || ''} 
                    onChange={e => setFormData(p => ({...p, name: e.target.value}))} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hn" className="text-slate-600 font-medium">เลข HN (ถ้ามี)</Label>
                  <Input 
                    id="hn" 
                    className="bg-slate-50 border-slate-200 text-slate-900 h-12"
                    placeholder="Hospital Number"
                    value={formData.hn || ''} 
                    onChange={e => setFormData(p => ({...p, hn: e.target.value}))} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-slate-600 font-medium">อายุ</Label>
                    <Input 
                      id="age" 
                      type="number" 
                      className="bg-slate-50 border-slate-200 text-slate-900 h-12"
                      value={formData.age || 0} 
                      onChange={e => setFormData(p => ({...p, age: parseInt(e.target.value) || 0}))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-slate-600 font-medium">เพศ</Label>
                    <Select value={formData.gender || 'ชาย'} onValueChange={v => setFormData(p => ({...p, gender: v}))}>
                      <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ชาย">ชาย</SelectItem>
                        <SelectItem value="หญิง">หญิง</SelectItem>
                        <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptoms" className="text-slate-600 font-medium">อาการสำคัญ (Chief Complaint)</Label>
                <Textarea 
                  id="symptoms" 
                  className="bg-slate-50 border-slate-200 text-slate-900 min-h-[100px] text-lg"
                  placeholder="ระบุอาการแรกรับของผู้ป่วย..."
                  value={formData.symptoms || ''} 
                  onChange={e => setFormData(p => ({...p, symptoms: e.target.value}))}
                />
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-[#e63946] font-bold flex items-center gap-2 text-2xl border-b border-slate-200 pb-3">
                <HeartPulse className="h-7 w-7" /> สัญญาณชีพและข้อมูลทางคลินิก
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="blood" className="text-slate-600 font-medium flex items-center gap-1">
                    <Droplets className="h-4 w-4 text-red-500" /> หมู่เลือด
                  </Label>
                  <Select value={formData.blood || 'O'} onValueChange={v => setFormData(p => ({...p, blood: v}))}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="AB">AB</SelectItem>
                      <SelectItem value="O">O</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bp" className="text-slate-600 font-medium">BP (mmHg)</Label>
                  <Input 
                    id="bp" 
                    className="bg-slate-50 border-slate-200 text-slate-900 h-12 font-bold"
                    placeholder="เช่น 120/80"
                    value={formData.bloodPressure || ''} 
                    onChange={e => setFormData(p => ({...p, bloodPressure: e.target.value}))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hr" className="text-slate-600 font-medium">Heart Rate (bpm)</Label>
                  <Input 
                    id="hr" 
                    className="bg-slate-50 border-slate-200 text-slate-900 h-12 font-bold"
                    placeholder="เช่น 80"
                    value={formData.heartRate || ''} 
                    onChange={e => setFormData(p => ({...p, heartRate: e.target.value}))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temp" className="text-slate-600 font-medium flex items-center gap-1">
                    <Thermometer className="h-4 w-4 text-orange-500" /> Temp (°C)
                  </Label>
                  <Input 
                    id="temp" 
                    className="bg-slate-50 border-slate-200 text-slate-900 h-12 font-bold"
                    placeholder="เช่น 36.5"
                    value={formData.temperature || ''} 
                    onChange={e => setFormData(p => ({...p, temperature: e.target.value}))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="o2" className="text-slate-600 font-medium">O2 Sat (%)</Label>
                  <Input 
                    id="o2" 
                    className="bg-slate-50 border-slate-200 text-slate-900 h-12 font-bold"
                    placeholder="เช่น 98"
                    value={formData.o2 || ''} 
                    onChange={e => setFormData(p => ({...p, o2: e.target.value}))} 
                  />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-[#e63946] font-bold flex items-center gap-2 text-2xl border-b border-slate-200 pb-3">
                <Activity className="h-7 w-7" /> การคัดกรองและแผนการรักษา
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="triage" className="text-slate-600 font-medium">ระดับความรุนแรง (Triage Level)</Label>
                  <Select value={formData.triageLevel || 'Minor'} onValueChange={v => setFormData(p => ({...p, triageLevel: v as TriageLevel}))}>
                    <SelectTrigger className={`border-none font-bold h-12 ${
                      formData.triageLevel === 'Critical' ? 'bg-[#e63946] text-white' :
                      formData.triageLevel === 'Urgent' ? 'bg-[#ffb703] text-black' :
                      formData.triageLevel === 'Minor' ? 'bg-[#2a9d8f] text-white' : 'bg-[#212529] text-white'
                    }`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Critical">วิกฤต (แดง)</SelectItem>
                      <SelectItem value="Urgent">เร่งด่วน (เหลือง)</SelectItem>
                      <SelectItem value="Minor">ไม่รุนแรง (เขียว)</SelectItem>
                      <SelectItem value="Deceased">เสียชีวิต (ดำ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-slate-600 font-medium">สถานะปัจจุบัน</Label>
                  <Select value={formData.status || 'Waiting'} onValueChange={v => setFormData(p => ({...p, status: v as PatientStatus}))}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Waiting">รอตรวจ</SelectItem>
                      <SelectItem value="Lab">ห้องปฏิบัติการ</SelectItem>
                      <SelectItem value="X-Ray">X-Ray</SelectItem>
                      <SelectItem value="Admit">Admit</SelectItem>
                      <SelectItem value="Pharmacy">รอรับยา</SelectItem>
                      <SelectItem value="Discharged">กลับบ้าน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scene" className="text-slate-600 font-medium">จุดเกิดเหตุ / รถนำส่ง</Label>
                  <Input 
                    id="scene" 
                    className="bg-slate-50 border-slate-200 text-slate-900 h-12"
                    placeholder="เช่น แดง 1, กู้ชีพ..."
                    value={formData.scene || ''} 
                    onChange={e => setFormData(p => ({...p, scene: e.target.value}))} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="diagnosis" className="text-slate-600 font-medium">การวินิจฉัยเบื้องต้น (Initial Diagnosis)</Label>
                  <Input 
                    id="diagnosis" 
                    className="bg-slate-50 border-slate-200 text-slate-900 h-12"
                    value={formData.diagnosis || ''} 
                    onChange={e => setFormData(p => ({...p, diagnosis: e.target.value}))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination" className="text-slate-600 font-medium">จุดหมาย/หน่วยรับต่อ (Destination)</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center h-12 w-12 bg-slate-100 rounded-lg border border-slate-200 text-slate-400">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <Input 
                      id="destination" 
                      className="bg-slate-50 border-slate-200 text-slate-900 h-12 flex-1"
                      value={formData.destination || ''} 
                      onChange={e => setFormData(p => ({...p, destination: e.target.value}))} 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="note" className="text-slate-600 font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> หมายเหตุ (Notes)
                </Label>
                <Textarea 
                  id="note" 
                  className="bg-slate-50 border-slate-200 text-slate-900 min-h-[80px]"
                  placeholder="ข้อมูลเพิ่มเติมอื่นๆ..."
                  value={formData.note || ''} 
                  onChange={e => setFormData(p => ({...p, note: e.target.value}))}
                />
              </div>
            </section>

            <div className="pt-8 flex gap-4">
              <Button 
                type="submit" 
                className="flex-1 bg-[#b22222] hover:bg-[#8b1a1a] h-14 text-xl font-bold rounded-xl shadow-lg"
              >
                {patientId ? 'ยืนยันการแก้ไข' : 'ยืนยันการลงทะเบียน'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="px-10 h-14 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-lg font-medium"
                onClick={() => router.back()}
              >
                ยกเลิก
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function AddPatientPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center font-sarabun">
        <Loader2 className="h-10 w-10 animate-spin text-[#b22222]" />
      </div>
    }>
      <AddPatientContent />
    </Suspense>
  );
}