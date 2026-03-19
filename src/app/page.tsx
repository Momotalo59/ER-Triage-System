"use client";

import React, { useState } from 'react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { PatientTable } from "@/components/dashboard/patient-table";
import { ResourceWidgets } from "@/components/dashboard/resource-widgets";
import { PatientFormDialog } from "@/components/dashboard/patient-form-dialog";
import { Patient, ResourceSummary } from "@/lib/types";
import { 
  Plus, 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Activity,
  Bell,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toaster";

const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'สมชาย รักดี',
    age: 45,
    gender: 'ชาย',
    symptoms: 'เจ็บหน้าอก หายใจลำบาก',
    triageLevel: 'Critical',
    diagnosis: 'สงสัยภาวะกล้ามเนื้อหัวใจขาดเลือดเฉียบพลัน',
    destination: 'ห้องฉีดสีหัวใจ (Cath Lab)',
    status: 'Admit',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: '2',
    name: 'วิภา วงศ์วรรณ',
    age: 28,
    gender: 'หญิง',
    symptoms: 'ไข้สูง ไอต่อเนื่อง',
    triageLevel: 'Urgent',
    diagnosis: 'ปอดอักเสบรุนแรง',
    destination: 'วอร์ด A',
    status: 'Waiting',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: '3',
    name: 'อนันต์ สุขุม',
    age: 62,
    gender: 'ชาย',
    symptoms: 'แผลฉีกขาดที่แขนขวา',
    triageLevel: 'Minor',
    diagnosis: 'บาดแผลเนื้อเยื่ออ่อน',
    destination: 'หน่วยฉุกเฉิน 2',
    status: 'X-Ray',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
  }
];

const MOCK_RESOURCES: ResourceSummary = {
  bloodInventory: {
    'A+': 12, 'B+': 8, 'AB+': 4, 'O+': 24,
    'A-': 2, 'B-': 1, 'AB-': 0, 'O-': 6
  },
  ventilators: {
    total: 20,
    inUse: 14
  }
};

export default function CrisisTriageDashboard() {
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPatient = (data: Partial<Patient>) => {
    if (editingPatient) {
      setPatients(prev => prev.map(p => p.id === editingPatient.id ? { ...p, ...data } as Patient : p));
      setEditingPatient(null);
    } else {
      const newPatient: Patient = {
        ...data as any,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
      };
      setPatients(prev => [newPatient, ...prev]);
    }
    setIsDialogOpen(false);
  };

  const handleDeletePatient = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลผู้ป่วยรายนี้?')) {
      setPatients(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsDialogOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar className="border-r border-border/50 bg-card">
          <SidebarHeader className="p-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg shadow-lg shadow-primary/20">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-headline font-black tracking-tight leading-none">
                CRISIS <span className="text-primary">TRIAGE</span>
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive tooltip="แผงควบคุมหลัก">
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="font-medium">แผงควบคุม</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="รายชื่อผู้ป่วย">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">ผู้ป่วย</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="ตั้งค่าระบบ">
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">ตั้งค่า</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="mt-auto p-4 absolute bottom-0 left-0 w-full">
               <SidebarMenuButton className="text-muted-foreground hover:text-white">
                <LogOut className="h-5 w-5" />
                <span className="font-medium">ออกจากระบบ</span>
              </SidebarMenuButton>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header Bar */}
          <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="ค้นหาชื่อผู้ป่วย, ID หรือการวินิจฉัย..." 
                  className="pl-10 bg-secondary/30 border-none focus-visible:ring-1 ring-accent/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-accent rounded-full border-2 border-card" />
              </Button>
              <Button 
                onClick={() => { setEditingPatient(null); setIsDialogOpen(true); }}
                className="bg-primary hover:bg-primary/90 text-white font-semibold flex gap-2 rounded-full px-6 shadow-xl shadow-primary/20"
              >
                <Plus className="h-4 w-4" />
                รับผู้ป่วยใหม่
              </Button>
            </div>
          </header>

          {/* Scrollable Dashboard Grid */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* KPI Overviews */}
            <section>
              <div className="flex items-end justify-between mb-4">
                <h2 className="text-2xl font-headline font-bold">สรุปสถานะปัจจุบัน</h2>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  อัปเดตล่าสุด: เมื่อสักครู่นี้
                </div>
              </div>
              <KPICards patients={patients} />
            </section>

            {/* Patient Monitor List */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-headline font-semibold">ติดตามอาการผู้ป่วยแบบเรียลไทม์</h2>
                <Button variant="link" size="sm" className="text-accent p-0 h-auto">ดูผู้ป่วยทั้งหมด</Button>
              </div>
              <PatientTable 
                patients={filteredPatients} 
                onEdit={handleEditPatient} 
                onDelete={handleDeletePatient} 
              />
            </section>

            {/* Resource Widgets Grid */}
            <section>
              <h2 className="text-lg font-headline font-semibold mb-4">การจัดการทรัพยากรและเวชภัณฑ์</h2>
              <ResourceWidgets patients={patients} resources={MOCK_RESOURCES} />
            </section>
          </div>
        </main>
      </div>

      <PatientFormDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSubmit={handleAddPatient}
        initialData={editingPatient}
      />
      <Toaster />
    </SidebarProvider>
  );
}
