"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Patient, ResourceSummary } from "@/lib/types";
import { Droplets, Wind, Stethoscope } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip
} from 'recharts';

interface ResourceWidgetsProps {
  patients: Patient[];
  resources: ResourceSummary;
}

export function ResourceWidgets({ patients, resources }: ResourceWidgetsProps) {
  const ventUsage = (resources.ventilators.inUse / resources.ventilators.total) * 100;
  
  const statusCounts = patients.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = [
    { name: 'รอตรวจ', value: statusCounts['Waiting'] || 0, color: 'hsl(var(--accent))' },
    { name: 'เอกซเรย์', value: statusCounts['X-Ray'] || 0, color: 'hsl(var(--primary))' },
    { name: 'ห้องแล็บ', value: statusCounts['Lab'] || 0, color: 'hsl(var(--primary))' },
    { name: 'รับไว้รักษา', value: statusCounts['Admit'] || 0, color: 'hsl(var(--primary))' },
  ];

  const bloodData = Object.entries(resources.bloodInventory).map(([type, units]) => ({
    type,
    units
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Patient Status Breakdown */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-accent" />
            การกระจายตัวของผู้ป่วยในแผนกฉุกเฉิน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[180px] w-full mt-4">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Blood Inventory */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Droplets className="h-4 w-4 text-primary" />
            คลังเลือดสำรอง (ยูนิต)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {bloodData.map((blood) => (
              <div key={blood.type} className="flex flex-col items-center p-2 rounded-md bg-secondary/50 border border-border">
                <span className="text-[10px] font-bold text-muted-foreground">{blood.type}</span>
                <span className="text-lg font-headline font-bold text-primary">{blood.units}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ventilator Usage */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Wind className="h-4 w-4 text-accent" />
            การใช้งานเครื่องช่วยหายใจ
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center h-full pb-8">
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-3xl font-bold font-headline">{resources.ventilators.inUse}</span>
              <span className="text-muted-foreground ml-1">/ {resources.ventilators.total}</span>
            </div>
            <span className="text-sm font-medium text-accent">{Math.round(ventUsage)}%</span>
          </div>
          <Progress value={ventUsage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
            ระบบติดตามทรัพยากรวิกฤตทำงานปกติ <span className="text-primary font-semibold">เหลือเครื่องว่าง {resources.ventilators.total - resources.ventilators.inUse} เครื่อง</span> พร้อมใช้งานทันที
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
