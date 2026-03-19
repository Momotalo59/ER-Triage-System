"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Patient, TriageLevel } from "@/lib/types";

interface KPICardsProps {
  patients: Patient[];
}

export function KPICards({ patients }: KPICardsProps) {
  const getCount = (level: TriageLevel) => patients.filter(p => p.triageLevel === level).length;

  const stats = [
    { label: "แดง (Critical)", count: getCount("Critical"), bg: "bg-[#e63946]", text: "text-white" },
    { label: "เหลือง (Urgent)", count: getCount("Urgent"), bg: "bg-[#ffb703]", text: "text-black" },
    { label: "เขียว (Minor)", count: getCount("Minor"), bg: "bg-[#2a9d8f]", text: "text-white" },
    { label: "ดำ (Deceased)", count: getCount("Deceased"), bg: "bg-[#212529]", text: "text-white" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className={`${stat.bg} ${stat.text} border-none shadow-md`}>
          <CardContent className="flex flex-col items-center justify-center p-6 py-8">
            <div className="text-6xl font-black mb-1">{stat.count}</div>
            <div className="text-lg font-bold opacity-90">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
