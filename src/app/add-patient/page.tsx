
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Save, 
  UserPlus, 
  Activity, 
  MapPin, 
  ClipboardList 
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

export default function AddPatientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    hn: '',
    age: 0,
    gender: 'ชาย',
    scene: 'แดง 1',
    symptoms: '',
    triageLevel: 'Minor',
    diagnosis: '',
    destination: 'จุดพักคอย ER',
    status: 'Waiting',
    o2: '-',
    arrival: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    disp: '-',
    blood: '-',
    note: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ในที่นี้จำลองการบันทึกข้อมูล (ในอนาคตจะเชื่อมต่อกับ Firestore)
    toast({
      title: "ลงทะเบียนสำเร็จ",
      description: `ผู้ป่วย ${formData.name} ถูกเพิ่มเข้าในระบบแล้ว`,
    });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] font-sarabun text-white pb-10">
      {/* Header */}
      <header className="bg-[#b22222] text-white p-4 shadow-md sticky top-0 z-40">
        <div className="max-w-[1000px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
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
            <h1 className="text-xl font-bold flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> ลงทะเบียนผู้ป่วยใหม่ (MCI Registration)
            </h1>
          </div>
          <Button 
            className="bg-white text-[#b22222] hover:bg-slate-100 font-bold gap-2"
            onClick={handleSubmit}
          >
            <Save className="h-4 w-4" /> บันทึกข้อมูล
          </Button>
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto p-6 mt-4">
        <div className="bg-[#262626] rounded-2xl p-8 shadow-2xl border border-white/5">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: ข้อมูลพื้นฐาน */}
            <section className="space-y-4">
              <h2 className="text-[#b22222] font-bold flex items-center gap-2 border-b border-white/10 pb-2">
                <ClipboardList className="h-4 w-4" /> ข้อมูลพื้นฐานและอาการ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">ชื่อ-นามสกุล (หรือสัญลักษณ์ระบุตัวตน)</Label>
                  <Input 
                    id="name" 
                    className="bg-[#333] border-white/10 text-white"
                    placeholder="ระบุชื่อหรือรหัสผู้ป่วย"
                    value={formData.name} 
                    onChange={e => setFormData(p => ({...p, name: e.target.value}))} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hn">เลข HN (ถ้ามี)</Label>
                  <Input 
                    id="hn" 
                    className="bg-[#333] border-white/10 text-white"
                    placeholder="Hospital Number"
                    value={formData.hn} 
                    onChange={e => setFormData(p => ({...p, hn: e.target.value}))} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">อายุ</Label>
                    <Input 
                      id="age" 
                      type="number" 
                      className="bg-[#333] border-white/10 text-white"
                      value={formData.age} 
                      onChange={e => setFormData(p => ({...p, age: parseInt(e.target.value)}))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">เพศ</Label>
                    <Select value={formData.gender} onValueChange={v => setFormData(p => ({...p, gender: v}))}>
                      <SelectTrigger className="bg-[#333] border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#333] text-white border-white/10">
                        <SelectItem value="ชาย">ชาย</SelectItem>
                        <SelectItem value="หญิง">หญิง</SelectItem>
                        <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptoms">อาการสำคัญ (Chief Complaint)</Label>
                <Textarea 
                  id="symptoms" 
                  className="bg-[#333] border-white/10 text-white min-h-[100px]"
                  placeholder="ระบุอาการแรกรับของผู้ป่วย..."
                  value={formData.symptoms} 
                  onChange={e => setFormData(p => ({...p, symptoms: e.target.value}))}
                />
              </div>
            </section>

            {/* Section 2: การคัดกรองและสถานะ */}
            <section className="space-y-4">
              <h2 className="text-[#b22222] font-bold flex items-center gap-2 border-b border-white/10 pb-2">
                <Activity className="h-4 w-4" /> การคัดกรองและแผนการรักษา
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="triage">ระดับความรุนแรง (Triage Level)</Label>
                  <Select value={formData.triageLevel} onValueChange={v => setFormData(p => ({...p, triageLevel: v as TriageLevel}))}>
                    <SelectTrigger className={`border-none font-bold ${
                      formData.triageLevel === 'Critical' ? 'bg-[#e63946] text-white' :
                      formData.triageLevel === 'Urgent' ? 'bg-[#ffb703] text-black' :
                      formData.triageLevel === 'Minor' ? 'bg-[#2a9d8f] text-white' : 'bg-[#212529] text-white'
                    }`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#333] text-white border-white/10">
                      <SelectItem value="Critical">วิกฤต (แดง)</SelectItem>
                      <SelectItem value="Urgent">เร่งด่วน (เหลือง)</SelectItem>
                      <SelectItem value="Minor">ไม่รุนแรง (เขียว)</SelectItem>
                      <SelectItem value="Deceased">เสียชีวิต (ดำ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">สถานะปัจจุบัน</Label>
                  <Select value={formData.status} onValueChange={v => setFormData(p => ({...p, status: v as PatientStatus}))}>
                    <SelectTrigger className="bg-[#333] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#333] text-white border-white/10">
                      <SelectItem value="Waiting">รอตรวจ</SelectItem>
                      <SelectItem value="X-Ray">เอกซเรย์</SelectItem>
                      <SelectItem value="Lab">ส่งแล็บ</SelectItem>
                      <SelectItem value="Admit">รับไว้รักษา</SelectItem>
                      <SelectItem value="Discharged">จำหน่ายกลับบ้าน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scene">จุดเกิดเหตุ / รถนำส่ง</Label>
                  <Input 
                    id="scene" 
                    className="bg-[#333] border-white/10 text-white"
                    placeholder="เช่น แดง 1, กู้ชีพ..."
                    value={formData.scene} 
                    onChange={e => setFormData(p => ({...p, scene: e.target.value}))} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">การวินิจฉัยเบื้องต้น (Initial Diagnosis)</Label>
                  <Input 
                    id="diagnosis" 
                    className="bg-[#333] border-white/10 text-white"
                    value={formData.diagnosis} 
                    onChange={e => setFormData(p => ({...p, diagnosis: e.target.value}))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">จุดหมาย/หน่วยรับต่อ (Destination)</Label>
                  <div className="flex gap-2">
                    <MapPin className="h-10 w-10 p-2 bg-[#333] rounded-md text-slate-400" />
                    <Input 
                      id="destination" 
                      className="bg-[#333] border-white/10 text-white"
                      value={formData.destination} 
                      onChange={e => setFormData(p => ({...p, destination: e.target.value}))} 
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-6 flex gap-4">
              <Button 
                type="submit" 
                className="flex-1 bg-[#b22222] hover:bg-[#8b1a1a] h-12 text-lg font-bold"
              >
                ยืนยันการลงทะเบียน
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="px-8 h-12 border-white/10 text-white hover:bg-white/5"
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
