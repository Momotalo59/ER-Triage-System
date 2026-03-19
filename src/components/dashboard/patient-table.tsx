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
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Edit2, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const triageColors: Record<TriageLevel, string> = {
  Critical: "bg-primary text-primary-foreground border-primary",
  Urgent: "bg-accent text-accent-foreground border-accent",
  Minor: "bg-secondary text-secondary-foreground border-border",
  Deceased: "bg-muted text-muted-foreground border-muted",
};

const triageLabels: Record<TriageLevel, string> = {
  Critical: "วิกฤต",
  Urgent: "เร่งด่วน",
  Minor: "ไม่รุนแรง",
  Deceased: "เสียชีวิต",
};

const statusLabels: Record<PatientStatus, string> = {
  Waiting: "รอตรวจ",
  "X-Ray": "เอกซเรย์",
  Lab: "ส่งแล็บ",
  Admit: "รับไว้รักษา",
  Discharged: "จำหน่ายกลับ",
};

interface PatientTableProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
}

export function PatientTable({ patients, onEdit, onDelete }: PatientTableProps) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[180px]">ชื่อผู้ป่วย</TableHead>
            <TableHead>คัดกรอง</TableHead>
            <TableHead>การวินิจฉัย</TableHead>
            <TableHead>จุดส่งต่อ</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead className="hidden md:table-cell">เวลาที่มาถึง</TableHead>
            <TableHead className="text-right">จัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                ไม่พบข้อมูลผู้ป่วยในขณะนี้
              </TableCell>
            </TableRow>
          ) : (
            patients.map((patient) => (
              <TableRow key={patient.id} className="group transition-colors duration-150">
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{patient.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {patient.age} ปี • {patient.gender}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${triageColors[patient.triageLevel]} font-semibold`}>
                    {triageLabels[patient.triageLevel]}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={patient.diagnosis}>
                  {patient.diagnosis || "รอดำเนินการ..."}
                </TableCell>
                <TableCell>{patient.destination}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${patient.status === 'Waiting' ? 'bg-accent animate-pulse' : 'bg-muted-foreground'}`} />
                    {statusLabels[patient.status]}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {format(new Date(patient.timestamp), "HH:mm", { locale: th })} น.
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(patient)} className="h-8 w-8" title="แก้ไข">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(patient.id)} className="h-8 w-8 text-destructive hover:text-destructive" title="ลบ">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
