"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Patient, TriageLevel } from "@/lib/types";
import { Activity, AlertTriangle, Users, Skull } from "lucide-react";

interface KPICardsProps {
  patients: Patient[];
}

const triageLabels: Record<TriageLevel, string> = {
  Critical: "วิกฤต (สีแดง)",
  Urgent: "เร่งด่วน (สีชมพู/ส้ม)",
  Minor: "ไม่รุนแรง (สีเขียว)",
  Deceased: "เสียชีวิต",
};

export function KPICards({ patients }: KPICardsProps) {
  const getCount = (level: TriageLevel) => patients.filter(p => p.triageLevel === level).length;

  const stats = [
    {
      label: "Critical",
      displayLabel: triageLabels.Critical,
      count: getCount("Critical"),
      icon: Activity,
      color: "text-primary",
      borderColor: "border-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Urgent",
      displayLabel: triageLabels.Urgent,
      count: getCount("Urgent"),
      icon: AlertTriangle,
      color: "text-accent",
      borderColor: "border-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Minor",
      displayLabel: triageLabels.Minor,
      count: getCount("Minor"),
      icon: Users,
      color: "text-muted-foreground",
      borderColor: "border-muted",
      bg: "bg-muted/10",
    },
    {
      label: "Deceased",
      displayLabel: triageLabels.Deceased,
      count: getCount("Deceased"),
      icon: Skull,
      color: "text-white/50",
      borderColor: "border-white/10",
      bg: "bg-white/5",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className={`border-l-4 ${stat.borderColor} bg-card overflow-hidden transition-all hover:translate-y-[-2px]`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {stat.displayLabel}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-headline">{stat.count}</div>
            <p className="text-xs text-muted-foreground mt-1">จำนวนผู้ป่วยปัจจุบัน</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
