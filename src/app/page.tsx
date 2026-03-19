"use client";

import React, { useState } from 'react';
import { KPICards } from "@/components/dashboard/kpi-cards";
import { PatientTable } from "@/components/dashboard/patient-table";
import { ResourceWidgets } from "@/components/dashboard/resource-widgets";
import { PatientFormDialog } from "@/components/dashboard/patient-form-dialog";
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
  Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";

const MOCK_PATIENTS: Patient[] = [
  { id: '1', scene: 'แดง 1', triageLevel: 'Critical', name: '-', hn: '-', age: 0, edTriage: 'Critical', diagnosis: 'Acute psychosis', status: 'Admit', destination: 'หอผู้ป่วยกมลรักษ์', o2: '-', arrival: '10:04', disp: '-', blood: '-', note: '', timestamp: new Date().toISOString() },
  { id: '2', scene: 'แดง 2', triageLevel: 'Critical', name: '-', hn: '-', age: 0, edTriage: 'Critical', diagnosis: 'SDH SAH', status: 'Admit', destination: 'Neurosurgical Intensive Care Unit (Ns ICU)', o2: 'ETT', arrival: '10:19', disp: '-', blood: '-', note: '', timestamp: new Date().toISOString() },
  { id: '3', scene: 'แดง 3', triageLevel: 'Critical', name: '-', hn: '-', age: 0, edTriage: 'Critical', diagnosis: 'Tension pneumothorax', status: 'Admit', destination: 'ตึกกุมารเวชกรรม2 (อ.9 เฟส2 ชั้น4)', o2: '-', arrival: '10:28', disp: '-', blood: '-', note: '', timestamp: new Date().toISOString() },
  { id: '4', scene: 'แดง 4', triageLevel: 'Critical', name: '-', hn: '-', age: 0, edTriage: 'Critical', diagnosis: 'Second degree burn 30%', status: 'Admit', destination: 'SICU (อาคาร10 ชั้น3)', o2: 'ETT', arrival: '10:34', disp: '-', blood: '-', note: '', timestamp: new Date().toISOString() },
  { id: '5', scene: 'แดง 5', triageLevel: 'Critical', name: '-', hn: '-', age: 0, edTriage: 'Critical', diagnosis: 'EDH c skull fracture', status: 'Admit', destination: 'Neuro Surgery (อาคาร4 ชั้น3) (ยกเลิก)', o2: 'ETT', arrival: '10:34', disp: '-', blood: '-', note: '', timestamp: new Date().toISOString() },
  { id: '6', scene: 'แดง 7', triageLevel: 'Critical', name: '-', hn: '-', age: 0, edTriage: 'Critical', diagnosis: '-', status: 'X-Ray', destination: '-', o2: '-', arrival: '11:02', disp: '-', blood: '-', note: '', timestamp: new Date().toISOString() },
  { id: '7', scene: 'แดง 9', triageLevel: 'Critical', name: '-', hn: '-', age: 0, edTriage: 'Critical', diagnosis: '-', status: 'X-Ray', destination: '-', o2: '-', arrival: '11:03', disp: '-', blood: '-', note: '', timestamp: new Date().toISOString() },
];

const MOCK_RESOURCES: ResourceSummary = {
  bloodInventory: { 'A': 84, 'B': 229, 'AB': 38, 'O': 91 },
  ventilators: {
    er: { vent: 5, bird: 2 },
    center: { vent: 21, bird: 4 }
  }
};

export default function CrisisTriageDashboard() {
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const handleAddPatient = (data: Partial<Patient>) => {
    if (editingPatient) {
      setPatients(prev => prev.map(p => p.id === editingPatient.id ? { ...p, ...data } as Patient : p));
      setEditingPatient(null);
    } else {
      const newPatient: Patient = {
        ...data as any,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
      };
      setPatients(prev => [newPatient, ...prev]);
    }
    setIsDialogOpen(false);
  };

  const handleDeletePatient = (id: string) => {
    if (confirm('ยืนยันการลบข้อมูล?')) {
      setPatients(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] font-sarabun text-slate-900">
      {/* Red Header Bar */}
      <header className="bg-[#b22222] text-white p-4 shadow-md">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b22222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49 0 2.82.94 3.28 2.35.45 1.42-.14 2.98-1.4 3.73-1.25.75-2.88.54-3.92-.5l-.36-.36-1.59 1.59.36.36c1.04 1.04 1.25 2.67.5 3.92-.75 1.26-2.31 1.85-3.73 1.4-1.41-.46-2.35-1.79-2.35-3.28v-2.17c0-1.49-.94-2.82-2.35-3.28-1.42-.45-2.98.14-3.73 1.4-.75 1.25-.54 2.88.5 3.92l.36.36-1.59 1.59-.36-.36c-1.04-1.04-2.67-1.25-3.92-.5-1.26.75-1.85 2.31-1.4 3.73.46 1.41 1.79 2.35 3.28 2.35h2.17c1.49 0 2.82-.94 3.28-2.35.45-1.42-.14-2.98 1.4-3.73 1.25-.75 2.88-.54 3.92.5l.36.36 1.59-1.59-.36-.36c-1.04-1.04-1.25-2.67-.5-3.92.75-1.26 2.31-1.85 3.73-1.4 1.41.46 2.35 1.79 2.35 3.28v2.17z"/></svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                เพลิงไหม้โรงเรียนสตรีสิริเกศ
                <span className="bg-emerald-500 text-[10px] px-1.5 rounded-full flex items-center gap-1">
                  <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" /> LIVE
                </span>
              </h1>
              <div className="flex items-center gap-4 text-xs opacity-90 mt-1">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> 18/03/2569 09:15</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> โรงเรียนสตรีสิริเกศ</span>
                <span className="flex items-center gap-1 text-yellow-300"><RefreshCw className="h-3 w-3" /> รีเฟรชใน 5 วิ</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" className="h-8 bg-black/20 hover:bg-black/40 text-white border-none gap-2">
              <LayoutList className="h-4 w-4" /> รายการ MCI
            </Button>
            <Button variant="secondary" size="sm" className="h-8 bg-black/20 hover:bg-black/40 text-white border-none gap-2">
              <Edit className="h-4 w-4" /> แก้ไขชื่อแผน
            </Button>
            <Button variant="secondary" size="sm" className="h-8 bg-black/20 hover:bg-black/40 text-white border-none gap-2">
              <Monitor className="h-4 w-4" /> บอร์ดญาติ
            </Button>
            <Button size="sm" className="h-8 bg-yellow-400 hover:bg-yellow-500 text-black font-bold gap-2" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4" /> เพิ่มผู้ป่วย
            </Button>
            <Button variant="secondary" size="sm" className="h-8 bg-white text-black hover:bg-slate-100 gap-2">
              <Droplets className="h-4 w-4 text-red-600" /> หมู่เลือด
            </Button>
            <Button variant="secondary" size="sm" className="h-8 bg-white text-black hover:bg-slate-100 gap-2">
              <Wind className="h-4 w-4 text-slate-600" /> เครื่องช่วยหายใจ
            </Button>
            <Button variant="destructive" size="sm" className="h-8 gap-2">
              <XCircle className="h-4 w-4" /> ปิดแผน
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1600px] mx-auto p-4 space-y-4">
        {/* KPI Section */}
        <KPICards patients={patients} />

        {/* Patient Table Section */}
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-[#e63946] text-white px-4 py-2 flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2">
              <LayoutList className="h-4 w-4" /> รายชื่อผู้ป่วย ({patients.length} ราย)
            </h2>
            <div className="flex gap-2 items-center">
               <Button variant="outline" size="sm" className="h-7 bg-white/10 hover:bg-white/20 border-white/30 text-white gap-1">
                <Printer className="h-3.5 w-3.5" /> Print
              </Button>
              <Button size="sm" className="h-7 bg-white text-black hover:bg-slate-100" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> เพิ่ม
              </Button>
            </div>
          </div>
          <PatientTable 
            patients={patients} 
            onEdit={(p) => { setEditingPatient(p); setIsDialogOpen(true); }} 
            onDelete={handleDeletePatient} 
          />
        </section>

        {/* Bottom Widgets */}
        <ResourceWidgets patients={patients} resources={MOCK_RESOURCES} />
      </main>

      <PatientFormDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSubmit={handleAddPatient}
        initialData={editingPatient}
      />
      <Toaster />
    </div>
  );
}
