
"use client";

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Patient, TriageLevel, PatientStatus } from "@/lib/types";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const triageColorMap: Record<TriageLevel, string> = {
  Critical: "bg-[#e63946] text-white",
  Urgent: "bg-[#ffb703] text-black",
  Minor: "bg-[#2a9d8f] text-white",
  Deceased: "bg-[#212529] text-white",
  "Non-Urgent": "bg-slate-200 text-slate-800",
};

const statusColorMap: Record<PatientStatus, string> = {
  Waiting: "bg-slate-400 text-white",
  Lab: "bg-purple-500 text-white",
  "X-Ray": "bg-sky-400 text-white",
  Admit: "bg-orange-500 text-white",
  Pharmacy: "bg-pink-400 text-white",
  Discharged: "bg-emerald-500 text-white",
};

const statusThaiMap: Record<PatientStatus, string> = {
  Waiting: "รอตรวจ",
  Lab: "ห้องปฏิบัติการ",
  "X-Ray": "X-Ray",
  Admit: "Admit",
  Pharmacy: "รอรับยา",
  Discharged: "กลับบ้าน",
};

interface PatientTableProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
}

export function PatientTable({ patients, onEdit, onDelete }: PatientTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table className="text-[13px]">
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-10 text-center">#</TableHead>
            <TableHead>Scene</TableHead>
            <TableHead>Triage</TableHead>
            <TableHead>ชื่อ-นามสกุล</TableHead>
            <TableHead>HN</TableHead>
            <TableHead>อายุ</TableHead>
            <TableHead>ED Triage</TableHead>
            <TableHead>วินิจฉัย</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>O2</TableHead>
            <TableHead>Arrival</TableHead>
            <TableHead>Disp.</TableHead>
            <TableHead>เลือด</TableHead>
            <TableHead className="min-w-[150px]">หมายเหตุ</TableHead>
            <TableHead className="text-right">จัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient, idx) => (
            <TableRow key={patient.id} className="hover:bg-slate-50/50 h-10">
              <TableCell className="text-center text-slate-500">{idx + 1}</TableCell>
              <TableCell className="font-medium">{patient.scene}</TableCell>
              <TableCell>
                <div className={`w-12 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${triageColorMap[patient.triageLevel]}`}>
                  {patient.triageLevel === 'Critical' ? 'แดง' : 
                   patient.triageLevel === 'Urgent' ? 'เหลือง' :
                   patient.triageLevel === 'Minor' ? 'เขียว' : 'ดำ'}
                </div>
              </TableCell>
              <TableCell className="font-bold">{patient.name}</TableCell>
              <TableCell className="text-slate-400">{patient.hn}</TableCell>
              <TableCell>{patient.age || '-'}</TableCell>
              <TableCell>
                 <div className={`w-8 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${triageColorMap[patient.edTriage]}`}>
                  {patient.edTriage === 'Critical' ? 'แดง' : 
                   patient.edTriage === 'Urgent' ? 'เหลือง' :
                   patient.edTriage === 'Minor' ? 'เขียว' : 'แดง'}
                </div>
              </TableCell>
              <TableCell className="max-w-[150px] truncate">{patient.diagnosis}</TableCell>
              <TableCell>
                <Badge variant="outline" className={`${statusColorMap[patient.status]} border-none rounded-sm px-2 py-0 h-5 text-[10px]`}>
                  {statusThaiMap[patient.status] || patient.status}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">{patient.destination}</TableCell>
              <TableCell>
                {patient.o2 && patient.o2 !== '-' ? (
                  <Badge className="bg-cyan-400 hover:bg-cyan-500 text-white border-none rounded-sm px-1.5 py-0 h-5 text-[10px]">
                    {patient.o2}
                  </Badge>
                ) : '-'}
              </TableCell>
              <TableCell>{patient.arrival}</TableCell>
              <TableCell>{patient.disp}</TableCell>
              <TableCell>{patient.blood}</TableCell>
              <TableCell className="text-slate-600 max-w-[200px] italic">
                {patient.note || '-'}
              </TableCell>
              <TableCell className="text-right p-1">
                <div className="flex justify-end gap-1">
                  <Button variant="outline" size="icon" className="h-7 w-7 text-blue-500 border-blue-200" onClick={() => onEdit(patient)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-7 w-7 text-red-500 border-red-200" onClick={() => onDelete(patient.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
