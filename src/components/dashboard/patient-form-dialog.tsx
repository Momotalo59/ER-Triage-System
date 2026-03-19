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
    gender: 'Male',
    symptoms: '',
    triageLevel: 'Minor',
    diagnosis: '',
    destination: 'ER Waiting',
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
        gender: 'Male',
        symptoms: '',
        triageLevel: 'Minor',
        diagnosis: '',
        destination: 'ER Waiting',
        status: 'Waiting',
      });
    }
  }, [initialData, open]);

  const handleAiTriage = async () => {
    if (!formData.symptoms) {
      toast({ title: "Symptoms Required", description: "Please enter patient symptoms first.", variant: "destructive" });
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
      toast({ title: "AI Analysis Complete", description: `Suggested Triage: ${result.triageLevel}` });
    } catch (error) {
      toast({ title: "AI Tool Unavailable", description: "Could not retrieve suggestion.", variant: "destructive" });
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
            {initialData ? "Update Patient Record" : "New Patient Registration"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={e => setFormData(p => ({...p, name: e.target.value}))} 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input 
                  id="age" 
                  type="number" 
                  value={formData.age} 
                  onChange={e => setFormData(p => ({...p, age: parseInt(e.target.value)}))} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={v => setFormData(p => ({...p, gender: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2 relative">
            <div className="flex justify-between items-center">
              <Label htmlFor="symptoms">Symptoms & Chief Complaint</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="text-[10px] h-7 gap-1 border-accent/50 text-accent hover:bg-accent/10"
                onClick={handleAiTriage}
                disabled={aiLoading}
              >
                {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3 w-3" />}
                AI SUGGEST
              </Button>
            </div>
            <Textarea 
              id="symptoms" 
              placeholder="Describe symptoms for AI triage assistance..."
              value={formData.symptoms} 
              onChange={e => setFormData(p => ({...p, symptoms: e.target.value}))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="triage">Triage Level</Label>
              <Select value={formData.triageLevel} onValueChange={v => setFormData(p => ({...p, triageLevel: v as TriageLevel}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="Minor">Minor</SelectItem>
                  <SelectItem value="Deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData(p => ({...p, status: v as PatientStatus}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Waiting">Waiting</SelectItem>
                  <SelectItem value="X-Ray">X-Ray</SelectItem>
                  <SelectItem value="Lab">Lab</SelectItem>
                  <SelectItem value="Admit">Admit</SelectItem>
                  <SelectItem value="Discharged">Discharged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis / AI Justification</Label>
            <Input 
              id="diagnosis" 
              value={formData.diagnosis} 
              onChange={e => setFormData(p => ({...p, diagnosis: e.target.value}))} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input 
              id="destination" 
              value={formData.destination} 
              onChange={e => setFormData(p => ({...p, destination: e.target.value}))} 
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {initialData ? "Save Changes" : "Register Patient"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}