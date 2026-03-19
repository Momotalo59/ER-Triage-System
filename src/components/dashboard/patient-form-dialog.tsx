"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Patient, TriageLevel, PatientStatus } from "@/lib/types";
import { getTriageSuggestion } from "@/ai/flows/ai-powered-triage-suggestion-flow";
import { BrainCircuit, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PatientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (patient: Partial<Patient>) => void;
  initialData?: Patient | null;
}

export function PatientFormDialog({ open, onOpenChange, onSubmit, initialData }: PatientFormDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    age: 0,
    gender: 'ชาย',
    symptoms: '',
    triageLevel: 'Minor',
    diagnosis: '',
    destination: 'จุดพักคอย ER',
    status: 'Waiting',
  });
  
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        age: 0,
        gender: 'ชาย',
        symptoms: '',
        triageLevel: 'Minor',
        diagnosis: '',
        destination: 'จุดพักคอย ER',
        status: 'Waiting',
      });
    }
  }, [initialData, open]);

  const handleAiTriage = async () => {
    if (!formData.symptoms) {
      toast({ title: "จำเป็นต้องระบุอาการ", description: "กรุณาระบุอาการเบื้องต้นของผู้ป่วยก่อนใช้ AI", variant: "destructive" });
      return;
    }

    setAiLoading(true);
    try {
      const result = await getTriageSuggestion({ patientSymptoms: formData.symptoms });
      setFormData(prev => ({
        ...prev,
        triageLevel: result.triageLevel as TriageLevel,
        diagnosis: result.justification
      }));
      toast({ title: "วิเคราะห์โดย AI สำเร็จ", description: `ระดับคัดกรองที่แนะนำ: ${result.triageLevel}` });
    } catch (error) {
      toast({ title: "ระบบ AI ไม่พร้อมใช้งาน", description: "ไม่สามารถเรียกข้อมูลคำแนะนำได้ในขณะนี้", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-headline flex items-center gap-2">
            {initialData ? "แก้ไขข้อมูลผู้ป่วย" : "ลงทะเบียนผู้ป่วยใหม่"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อ-นามสกุล</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={e => setFormData(p => ({...p, name: e.target.value}))} 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="age">อายุ</Label>
                <Input 
                  id="age" 
                  type="number" 
                  value={formData.age} 
                  onChange={e => setFormData(p => ({...p, age: parseInt(e.target.value)}))} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">เพศ</Label>
                <Select value={formData.gender} onValueChange={v => setFormData(p => ({...p, gender: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ชาย">ชาย</SelectItem>
                    <SelectItem value="หญิง">หญิง</SelectItem>
                    <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2 relative">
            <div className="flex justify-between items-center">
              <Label htmlFor="symptoms">อาการสำคัญ (Chief Complaint)</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="text-[10px] h-7 gap-1 border-accent/50 text-accent hover:bg-accent/10"
                onClick={handleAiTriage}
                disabled={aiLoading}
              >
                {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3 w-3" />}
                AI แนะนำระดับการคัดกรอง
              </Button>
            </div>
            <Textarea 
              id="symptoms" 
              placeholder="ระบุอาการเพื่อให้ AI ช่วยประเมินระดับความรุนแรง..."
              value={formData.symptoms} 
              onChange={e => setFormData(p => ({...p, symptoms: e.target.value}))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="triage">ระดับการคัดกรอง</Label>
              <Select value={formData.triageLevel} onValueChange={v => setFormData(p => ({...p, triageLevel: v as TriageLevel}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">วิกฤต (สีแดง)</SelectItem>
                  <SelectItem value="Urgent">เร่งด่วน (สีชมพู/ส้ม)</SelectItem>
                  <SelectItem value="Minor">ไม่รุนแรง (สีเขียว)</SelectItem>
                  <SelectItem value="Deceased">เสียชีวิต (สีดำ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="status">สถานะผู้ป่วย</Label>
              <Select value={formData.status} onValueChange={v => setFormData(p => ({...p, status: v as PatientStatus}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Waiting">รอตรวจ</SelectItem>
                  <SelectItem value="X-Ray">เอกซเรย์</SelectItem>
                  <SelectItem value="Lab">ส่งแล็บ</SelectItem>
                  <SelectItem value="Admit">รับไว้รักษา</SelectItem>
                  <SelectItem value="Discharged">จำหน่ายกลับบ้าน</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">การวินิจฉัย / เหตุผลประกอบจาก AI</Label>
            <Input 
              id="diagnosis" 
              value={formData.diagnosis} 
              onChange={e => setFormData(p => ({...p, diagnosis: e.target.value}))} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">จุดหมาย/หน่วยรับต่อ</Label>
            <Input 
              id="destination" 
              value={formData.destination} 
              onChange={e => setFormData(p => ({...p, destination: e.target.value}))} 
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>ยกเลิก</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {initialData ? "บันทึกการเปลี่ยนแปลง" : "ลงทะเบียนผู้ป่วย"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
