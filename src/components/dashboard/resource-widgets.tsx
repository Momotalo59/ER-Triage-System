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
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-600 text-white p-2 px-4 flex-row items-center gap-2 space-y-0">
          <LayoutList className="h-4 w-4" />
          <CardTitle className="text-sm font-bold">สถานะผู้ป่วย</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
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
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-[#9c27b0] text-white p-2 px-4 flex-row items-center gap-2 space-y-0">
          <Activity className="h-4 w-4" />
          <CardTitle className="text-sm font-bold">ED Triage</CardTitle>
        </CardHeader>
        <CardContent className="p-2 space-y-1">
          <TriageSmallRow color="bg-[#e63946]" label="แดง" count={getTriageCount('Critical')} />
          <TriageSmallRow color="bg-[#ff4081]" label="ชมพู" count={0} />
          <TriageSmallRow color="bg-[#ffb703]" label="เหลือง" count={0} />
          <TriageSmallRow color="bg-[#2a9d8f]" label="เขียว" count={0} />
          <TriageSmallRow color="bg-slate-100 border border-slate-200" label="ขาว" count={0} labelColor="text-slate-600" />
        </CardContent>
      </Card>

      {/* 3. หมู่เลือด */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-[#c62828] text-white p-2 px-4 flex-row justify-between items-center gap-2 space-y-0">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            <CardTitle className="text-sm font-bold">หมู่เลือด</CardTitle>
          </div>
          <Edit className="h-3 w-3 opacity-80" />
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-2">
            <BloodItem label="A" count={resources.bloodInventory.A} />
            <BloodItem label="B" count={resources.bloodInventory.B} />
            <BloodItem label="AB" count={resources.bloodInventory.AB} />
            <BloodItem label="O" count={resources.bloodInventory.O} />
          </div>
        </CardContent>
      </Card>

      {/* 4. เครื่องช่วยหายใจ */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-[#004d40] text-white p-2 px-4 flex-row justify-between items-center gap-2 space-y-0">
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4" />
            <CardTitle className="text-sm font-bold">เครื่องช่วยหายใจ</CardTitle>
          </div>
          <Edit className="h-3 w-3 opacity-80" />
        </CardHeader>
        <CardContent className="p-0 overflow-hidden">
          <table className="w-full text-[11px] border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="border-b p-1 text-left px-2"></th>
                <th className="border-b p-1 text-center border-l">Vent</th>
                <th className="border-b p-1 text-center border-l">Bird</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-1 px-2 font-bold">ER</td>
                <td className="p-1 text-center border-l">{resources.ventilators.er.vent}</td>
                <td className="p-1 text-center border-l">{resources.ventilators.er.bird}</td>
              </tr>
              <tr className="bg-slate-50">
                <td className="p-1 px-2 font-bold">ศูนย์ฯ</td>
                <td className="p-1 text-center border-l">{resources.ventilators.center.vent}</td>
                <td className="p-1 text-center border-l">{resources.ventilators.center.bird}</td>
              </tr>
              <tr className="font-bold border-t bg-slate-100">
                <td className="p-1 px-2">รวม</td>
                <td className="p-1 text-center border-l">{resources.ventilators.er.vent + resources.ventilators.center.vent}</td>
                <td className="p-1 text-center border-l">{resources.ventilators.er.bird + resources.ventilators.center.bird}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusRow({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex justify-between items-center border-b border-slate-100 py-1">
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="bg-slate-200 rounded px-2 font-bold min-w-[24px] text-center">{count}</span>
    </div>
  );
}

function TriageSmallRow({ color, label, count, labelColor = "text-white" }: { color: string; label: string; count: number; labelColor?: string }) {
  return (
    <div className="flex justify-between items-center">
      <div className={`${color} ${labelColor} rounded-full text-[10px] px-3 py-0.5 font-bold min-w-[60px] text-center`}>
        {label}
      </div>
      <span className="text-sm font-bold">{count}</span>
    </div>
  );
}

function BloodItem({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex flex-col items-center border rounded-md p-1 pt-2 bg-slate-50 shadow-inner">
      <span className="text-red-600 font-black text-lg leading-none">{count}</span>
      <span className="text-[10px] text-slate-400 font-medium uppercase mt-1">{label}</span>
    </div>
  );
}
