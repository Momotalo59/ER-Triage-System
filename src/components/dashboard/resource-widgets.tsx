
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Patient, ResourceSummary, VentilatorDept } from "@/lib/types";
import { LayoutList, Activity, Droplets, Edit, Check, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useFirestore, useDoc, setDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";

interface ResourceWidgetsProps {
  patients: Patient[];
}

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

export function ResourceWidgets({ patients }: ResourceWidgetsProps) {
  const firestore = useFirestore();
  const resourceDocRef = doc(firestore, 'resources', 'current');
  const { data: resources } = useDoc<ResourceSummary>(resourceDocRef);

  const [isBloodEditOpen, setIsBloodEditOpen] = useState(false);
  const [isVentEditOpen, setIsVentEditOpen] = useState(false);
  
  const [tempBlood, setTempBlood] = useState({ 'A': 0, 'B': 0, 'AB': 0, 'O': 0 });
  const [tempVents, setTempVents] = useState<VentilatorDept[]>([]);

  useEffect(() => {
    if (resources) {
      setTempBlood(resources.bloodInventory || { 'A': 0, 'B': 0, 'AB': 0, 'O': 0 });
      setTempVents(resources.ventilators || []);
    }
  }, [resources]);

  const getStatusCount = (s: string) => patients.filter(p => p.status === s).length;
  const getTriageCount = (l: string) => patients.filter(p => p.triageLevel === l).length;

  const handleSaveResources = (updatedResources: Partial<ResourceSummary>) => {
    setDocumentNonBlocking(resourceDocRef, {
      ...resources,
      ...updatedResources
    }, { merge: true });
    setIsBloodEditOpen(false);
    setIsVentEditOpen(false);
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

  const totalVent = (resources?.ventilators || []).reduce((sum, d) => sum + (d.vent || 0), 0);
  const totalBird = (resources?.ventilators || []).reduce((sum, d) => sum + (d.bird || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. สถานะผู้ป่วย */}
      <Card className="shadow-sm border border-slate-200 bg-white overflow-hidden">
        <CardHeader className="bg-[#334155] text-white p-2 px-4 flex-row items-center gap-2 space-y-0">
          <LayoutList className="h-4 w-4 text-white" />
          <CardTitle className="text-sm font-bold text-white">สถานะผู้ป่วย</CardTitle>
        </CardHeader>
        <CardContent className="p-3 bg-white">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
            <StatusRow label="กำลังตรวจรักษา" count={0} />
            <StatusRow label="X-Ray" count={getStatusCount('X-Ray')} />
            <StatusRow label="CT" count={getStatusCount('CT')} />
            <StatusRow label="OR" count={0} />
            <StatusRow label="Admit" count={getStatusCount('Admit')} />
            <StatusRow label="D/C" count={getStatusCount('D/C')} />
            <StatusRow label="Refer" count={getStatusCount('Refer')} />
            <StatusRow label="Dead" count={getStatusCount('Dead')} />
          </div>
        </CardContent>
      </Card>

      {/* 2. ED Triage */}
      <Card className="shadow-sm border border-slate-200 bg-white overflow-hidden">
        <CardHeader className="bg-[#8e24aa] text-white p-2 px-4 flex-row items-center gap-2 space-y-0">
          <Activity className="h-4 w-4 text-white" />
          <CardTitle className="text-sm font-bold text-white">ED Triage</CardTitle>
        </CardHeader>
        <CardContent className="p-3 bg-white space-y-1.5">
          <TriageSmallRow color="bg-[#e63946]" label="แดง" count={getTriageCount('Critical')} />
          <TriageSmallRow color="bg-[#d81b60]" label="ชมพู" count={0} />
          <TriageSmallRow color="bg-[#ffb703]" label="เหลือง" count={0} />
          <TriageSmallRow color="bg-[#2a9d8f]" label="เขียว" count={0} />
          <TriageSmallRow color="bg-white border border-slate-200" label="ขาว" count={0} labelColor="text-slate-900" />
        </CardContent>
      </Card>

      {/* 3. หมู่เลือด */}
      <Card id="blood-section" className="shadow-sm border border-slate-200 bg-white overflow-hidden">
        <CardHeader className="bg-[#b22222] text-white p-2 px-4 flex-row justify-between items-center gap-2 space-y-0">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-white" />
            <CardTitle className="text-sm font-bold text-white">หมู่เลือด</CardTitle>
          </div>
          <button 
            onClick={() => setIsBloodEditOpen(true)}
            className="p-1 hover:bg-white/20 rounded-md transition-colors border border-white/40"
          >
            <Edit className="h-3 w-3 text-white" />
          </button>
        </CardHeader>
        <CardContent className="p-4 bg-white">
          <div className="grid grid-cols-4 gap-2">
            <BloodItem label="A" count={resources?.bloodInventory?.A || 0} />
            <BloodItem label="B" count={resources?.bloodInventory?.B || 0} />
            <BloodItem label="AB" count={resources?.bloodInventory?.AB || 0} />
            <BloodItem label="O" count={resources?.bloodInventory?.O || 0} />
          </div>
        </CardContent>
      </Card>

      {/* 4. เครื่องช่วยหายใจ */}
      <Card id="ventilator-section" className="shadow-sm border border-slate-200 bg-white overflow-hidden">
        <CardHeader className="bg-[#1a5f7a] text-white p-2 px-4 flex-row justify-between items-center gap-2 space-y-0">
          <div className="flex items-center gap-2">
            <LungsImageIcon className="h-5 w-5" />
            <CardTitle className="text-sm font-bold text-white">เครื่องช่วยหายใจ</CardTitle>
          </div>
          <button 
            onClick={() => setIsVentEditOpen(true)}
            className="p-1 hover:bg-white/20 rounded-md transition-colors border border-white/40"
          >
            <Edit className="h-3 w-3 text-white" />
          </button>
        </CardHeader>
        <CardContent className="p-2 bg-white">
          <table className="w-full text-[10px] text-slate-900 border border-slate-200 border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-1.5 border border-slate-200 text-slate-600 font-bold"></th>
                <th className="p-1.5 border border-slate-200 text-slate-600 font-bold">Vent</th>
                <th className="p-1.5 border border-slate-200 text-slate-600 font-bold">Bird</th>
              </tr>
            </thead>
            <tbody>
              {(resources?.ventilators || []).map((dept) => (
                <tr key={dept.id}>
                  <td className="p-1.5 border border-slate-200 font-bold text-slate-700">{dept.name || 'ไม่ระบุ'}</td>
                  <td className="p-1.5 border border-slate-200 text-center text-slate-900">{dept.vent || 0}</td>
                  <td className="p-1.5 border border-slate-200 text-center text-slate-900">{dept.bird || 0}</td>
                </tr>
              ))}
              <tr className="bg-slate-100 font-bold">
                <td className="p-1.5 border border-slate-200 text-slate-900">รวม</td>
                <td className="p-1.5 border border-slate-200 text-center text-slate-900">{totalVent}</td>
                <td className="p-1.5 border border-slate-200 text-center text-slate-900">{totalBird}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Dialog แก้ไขหมู่เลือด */}
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

      {/* Dialog แก้ไขเครื่องช่วยหายใจ */}
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
    </div>
  );
}

function StatusRow({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex justify-between items-center border-b border-slate-100 pb-1">
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="bg-slate-100 text-slate-900 rounded px-2 font-bold min-w-[24px] text-center">{count}</span>
    </div>
  );
}

function TriageSmallRow({ color, label, count, labelColor = "text-white" }: { color: string; label: string; count: number; labelColor?: string }) {
  return (
    <div className="flex justify-between items-center">
      <div className={`${color} ${labelColor} rounded-full text-[10px] px-4 py-0.5 font-bold min-w-[70px] text-center shadow-sm`}>
        {label}
      </div>
      <span className="text-sm font-bold text-slate-900">{count}</span>
    </div>
  );
}

function BloodItem({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex flex-col items-center bg-slate-50 rounded-lg p-2 shadow-sm border border-slate-100 h-16 justify-center">
      <span className="text-[#b22222] font-black text-xl leading-none">{count}</span>
      <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">{label}</span>
    </div>
  );
}
