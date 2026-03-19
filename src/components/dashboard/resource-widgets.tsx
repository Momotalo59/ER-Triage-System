
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Patient, ResourceSummary } from "@/lib/types";
import { LayoutList, Activity, Droplets, Wind, Edit, Check } from "lucide-react";
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

interface ResourceWidgetsProps {
  patients: Patient[];
  resources: ResourceSummary;
  onUpdateResources: (newResources: ResourceSummary) => void;
}

export function ResourceWidgets({ patients, resources, onUpdateResources }: ResourceWidgetsProps) {
  const [isBloodEditOpen, setIsBloodEditOpen] = useState(false);
  const [isVentEditOpen, setIsVentEditOpen] = useState(false);
  
  // Local state for forms
  const [tempBlood, setTempBlood] = useState(resources.bloodInventory);
  const [tempVent, setTempVent] = useState(resources.ventilators);

  const getStatusCount = (s: string) => patients.filter(p => p.status === s).length;
  const getTriageCount = (l: string) => patients.filter(p => p.triageLevel === l).length;

  const handleSaveBlood = () => {
    onUpdateResources({
      ...resources,
      bloodInventory: tempBlood
    });
    setIsBloodEditOpen(false);
  };

  const handleSaveVent = () => {
    onUpdateResources({
      ...resources,
      ventilators: tempVent
    });
    setIsVentEditOpen(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* 1. สถานะผู้ป่วย */}
      <Card className="shadow-sm border border-slate-200 bg-white overflow-hidden">
        <CardHeader className="bg-[#334155] text-white p-2 px-4 flex-row items-center gap-2 space-y-0">
          <LayoutList className="h-4 w-4" />
          <CardTitle className="text-sm font-bold">สถานะผู้ป่วย</CardTitle>
        </CardHeader>
        <CardContent className="p-3 bg-white">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
            <StatusRow label="กำลังตรวจรักษา" count={0} />
            <StatusRow label="X-Ray" count={getStatusCount('X-Ray')} />
            <StatusRow label="CT" count={getStatusCount('CT')} />
            <StatusRow label="OR" count={0} />
            <StatusRow label="Admit" count={getStatusCount('Admit')} />
            <StatusRow label="D/C" count={0} />
            <StatusRow label="Refer" count={0} />
            <StatusRow label="Dead" count={0} />
          </div>
        </CardContent>
      </Card>

      {/* 2. ED Triage */}
      <Card className="shadow-sm border border-slate-200 bg-white overflow-hidden">
        <CardHeader className="bg-[#8e24aa] text-white p-2 px-4 flex-row items-center gap-2 space-y-0">
          <Activity className="h-4 w-4" />
          <CardTitle className="text-sm font-bold">ED Triage</CardTitle>
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
      <Card id="blood-section" className="shadow-sm border border-slate-200 bg-white overflow-hidden transition-all duration-300">
        <CardHeader className="bg-[#b22222] text-white p-2 px-4 flex-row justify-between items-center gap-2 space-y-0">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            <CardTitle className="text-sm font-bold">หมู่เลือด</CardTitle>
          </div>
          <button 
            onClick={() => {
              setTempBlood(resources.bloodInventory);
              setIsBloodEditOpen(true);
            }}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <Edit className="h-3.5 w-3.5 opacity-80" />
          </button>
        </CardHeader>
        <CardContent className="p-4 bg-white">
          <div className="grid grid-cols-4 gap-2">
            <BloodItem label="A" count={resources.bloodInventory.A} />
            <BloodItem label="B" count={resources.bloodInventory.B} />
            <BloodItem label="AB" count={resources.bloodInventory.AB} />
            <BloodItem label="O" count={resources.bloodInventory.O} />
          </div>
        </CardContent>
      </Card>

      {/* 4. เครื่องช่วยหายใจ */}
      <Card id="ventilator-section" className="shadow-sm border border-slate-200 bg-white overflow-hidden transition-all duration-300">
        <CardHeader className="bg-[#004d40] text-white p-2 px-4 flex-row justify-between items-center gap-2 space-y-0">
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4" />
            <CardTitle className="text-sm font-bold">เครื่องช่วยหายใจ</CardTitle>
          </div>
          <button 
            onClick={() => {
              setTempVent(resources.ventilators);
              setIsVentEditOpen(true);
            }}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <Edit className="h-3.5 w-3.5 opacity-80" />
          </button>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          <table className="w-full text-[11px] text-slate-900 border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-1.5 text-left px-3 text-slate-500"></th>
                <th className="p-1.5 text-center border-l border-slate-200 text-slate-500">Vent</th>
                <th className="p-1.5 text-center border-l border-slate-200 text-slate-500">Bird</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100">
                <td className="p-1.5 px-3 font-bold text-slate-700">ER</td>
                <td className="p-1.5 text-center border-l border-slate-100 font-medium">{resources.ventilators.er.vent}</td>
                <td className="p-1.5 text-center border-l border-slate-100 font-medium">{resources.ventilators.er.bird}</td>
              </tr>
              <tr className="bg-slate-50/50 border-t border-slate-100">
                <td className="p-1.5 px-3 font-bold opacity-60 text-[10px] text-slate-500">รวม</td>
                <td className="p-1.5 text-center border-l border-slate-100 opacity-60 text-slate-500">26</td>
                <td className="p-1.5 text-center border-l border-slate-100 opacity-60 text-slate-500">6</td>
              </tr>
            </tbody>
          </table>
          <div className="h-4 bg-white"></div>
        </CardContent>
      </Card>

      {/* Edit Blood Dialog */}
      <Dialog open={isBloodEditOpen} onOpenChange={setIsBloodEditOpen}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#b22222]">
              <Droplets className="h-5 w-5" /> แก้ไขสต็อกหมู่เลือด
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {Object.keys(tempBlood).map((type) => (
              <div key={type} className="grid gap-2">
                <Label htmlFor={`blood-${type}`}>หมู่เลือด {type}</Label>
                <Input 
                  id={`blood-${type}`}
                  type="number"
                  value={tempBlood[type as keyof typeof tempBlood]}
                  onChange={(e) => setTempBlood(prev => ({
                    ...prev,
                    [type]: parseInt(e.target.value) || 0
                  }))}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsBloodEditOpen(false)}>ยกเลิก</Button>
            <Button className="bg-[#b22222] hover:bg-[#8b1a1a] gap-2" onClick={handleSaveBlood}>
              <Check className="h-4 w-4" /> บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Ventilator Dialog */}
      <Dialog open={isVentEditOpen} onOpenChange={setIsVentEditOpen}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#004d40]">
              <Wind className="h-5 w-5" /> แก้ไขเครื่องช่วยหายใจ
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <h3 className="font-bold text-sm border-b pb-1">ห้องฉุกเฉิน (ER)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="er-vent">Vent</Label>
                <Input 
                  id="er-vent"
                  type="number"
                  value={tempVent.er.vent}
                  onChange={(e) => setTempVent(prev => ({
                    ...prev,
                    er: { ...prev.er, vent: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="er-bird">Bird</Label>
                <Input 
                  id="er-bird"
                  type="number"
                  value={tempVent.er.bird}
                  onChange={(e) => setTempVent(prev => ({
                    ...prev,
                    er: { ...prev.er, bird: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsVentEditOpen(false)}>ยกเลิก</Button>
            <Button className="bg-[#004d40] hover:bg-[#00332a] gap-2" onClick={handleSaveVent}>
              <Check className="h-4 w-4" /> บันทึก
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
