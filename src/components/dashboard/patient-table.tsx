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
import { Patient, TriageLevel } from "@/lib/types";
import { format } from "date-fns";
import { Edit2, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const triageColors: Record<TriageLevel, string> = {
  Critical: "bg-primary text-primary-foreground border-primary",
  Urgent: "bg-accent text-accent-foreground border-accent",
  Minor: "bg-secondary text-secondary-foreground border-border",
  Deceased: "bg-muted text-muted-foreground border-muted",
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
            <TableHead className="w-[180px]">Patient Name</TableHead>
            <TableHead>Triage</TableHead>
            <TableHead>Diagnosis</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Arrival Time</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No active patients records found.
              </TableCell>
            </TableRow>
          ) : (
            patients.map((patient) => (
              <TableRow key={patient.id} className="group transition-colors duration-150">
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{patient.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {patient.age}y • {patient.gender}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${triageColors[patient.triageLevel]} font-semibold`}>
                    {patient.triageLevel}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={patient.diagnosis}>
                  {patient.diagnosis || "Pending..."}
                </TableCell>
                <TableCell>{patient.destination}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${patient.status === 'Waiting' ? 'bg-accent animate-pulse' : 'bg-muted-foreground'}`} />
                    {patient.status}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {format(new Date(patient.timestamp), "HH:mm")}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(patient)} className="h-8 w-8">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(patient.id)} className="h-8 w-8 text-destructive hover:text-destructive">
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