
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Patient, ResourceSummary } from "@/lib/types";
import { LayoutList, Activity, Droplets, Wind, Edit } from "lucide-react";

interface ResourceWidgetsProps {
  patients: Patient[];
  resources: ResourceSummary;
}

export function ResourceWidgets({ patients, resources }: ResourceWidgetsProps) {
  const getStatusCount = (s: string) => patients.filter(p => p.status === s).length;
  const getTriageCount = (l: string) => patients.filter(p => p.triageLevel === l).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* 1. สถานะผู้ป่วย */}
      <Card className="shadow-lg border-none bg-[#111] overflow-hidden">
        <CardHeader className="bg-[#334155] text-white p-2 px-4 flex-row items-center gap-2 space-y-0">
          <LayoutList className="h-4 w-4" />
          <CardTitle className="text-sm font-bold">สถานะผู้ป่วย</CardTitle>
        </CardHeader>
        <CardContent className="p-3 bg-[#111]">
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
      <Card className="shadow-lg border-none bg-[#111] overflow-hidden">
        <CardHeader className="bg-[#8e24aa] text-white p-2 px-4 flex-row items-center gap-2 space-y-0">
          <Activity className="h-4 w-4" />
          <CardTitle className="text-sm font-bold">ED Triage</CardTitle>
        </CardHeader>
        <CardContent className="p-3 bg-[#111] space-y-1.5">
          <TriageSmallRow color="bg-[#e63946]" label="แดง" count={getTriageCount('Critical')} />
          <TriageSmallRow color="bg-[#d81b60]" label="ชมพู" count={0} />
          <TriageSmallRow color="bg-[#ffb703]" label="เหลือง" count={0} />
          <TriageSmallRow color="bg-[#2a9d8f]" label="เขียว" count={0} />
          <TriageSmallRow color="bg-white" label="ขาว" count={0} labelColor="text-slate-900" />
        </CardContent>
      </Card>

      {/* 3. หมู่เลือด */}
      <Card className="shadow-lg border-none bg-[#111] overflow-hidden">
        <CardHeader className="bg-[#b22222] text-white p-2 px-4 flex-row justify-between items-center gap-2 space-y-0">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            <CardTitle className="text-sm font-bold">หมู่เลือด</CardTitle>
          </div>
          <Edit className="h-3.5 w-3.5 opacity-80 cursor-pointer" />
        </CardHeader>
        <CardContent className="p-4 bg-[#111]">
          <div className="grid grid-cols-4 gap-2">
            <BloodItem label="A" count={resources.bloodInventory.A} />
            <BloodItem label="B" count={resources.bloodInventory.B} />
            <BloodItem label="AB" count={resources.bloodInventory.AB} />
            <BloodItem label="O" count={resources.bloodInventory.O} />
          </div>
        </CardContent>
      </Card>

      {/* 4. เครื่องช่วยหายใจ */}
      <Card className="shadow-lg border-none bg-[#111] overflow-hidden">
        <CardHeader className="bg-[#004d40] text-white p-2 px-4 flex-row justify-between items-center gap-2 space-y-0">
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4" />
            <CardTitle className="text-sm font-bold">เครื่องช่วยหายใจ</CardTitle>
          </div>
          <Edit className="h-3.5 w-3.5 opacity-80 cursor-pointer" />
        </CardHeader>
        <CardContent className="p-0 bg-[#111]">
          <table className="w-full text-[11px] text-white border-collapse">
            <thead className="bg-[#222]">
              <tr>
                <th className="p-1.5 text-left px-3"></th>
                <th className="p-1.5 text-center border-l border-[#333]">Vent</th>
                <th className="p-1.5 text-center border-l border-[#333]">Bird</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[#333]">
                <td className="p-1.5 px-3 font-bold">ER</td>
                <td className="p-1.5 text-center border-l border-[#333]">{resources.ventilators.er.vent}</td>
                <td className="p-1.5 text-center border-l border-[#333]">{resources.ventilators.er.bird}</td>
              </tr>
              <tr className="bg-[#1a1a1a] border-t border-[#333]">
                <td className="p-1.5 px-3 font-bold opacity-60 text-[10px]">รวม</td>
                <td className="p-1.5 text-center border-l border-[#333] opacity-60">26</td>
                <td className="p-1.5 text-center border-l border-[#333] opacity-60">6</td>
              </tr>
            </tbody>
          </table>
          <div className="h-4 bg-[#111]"></div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusRow({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex justify-between items-center border-b border-[#333] pb-1">
      <span className="text-slate-400 font-medium">{label}</span>
      <span className="bg-[#333] text-white rounded px-2 font-bold min-w-[24px] text-center">{count}</span>
    </div>
  );
}

function TriageSmallRow({ color, label, count, labelColor = "text-white" }: { color: string; label: string; count: number; labelColor?: string }) {
  return (
    <div className="flex justify-between items-center">
      <div className={`${color} ${labelColor} rounded-full text-[10px] px-4 py-0.5 font-bold min-w-[70px] text-center`}>
        {label}
      </div>
      <span className="text-sm font-bold text-white">{count}</span>
    </div>
  );
}

function BloodItem({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex flex-col items-center bg-white rounded-lg p-2 shadow-inner h-16 justify-center">
      <span className="text-[#b22222] font-black text-xl leading-none">{count}</span>
      <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">{label}</span>
    </div>
  );
}
