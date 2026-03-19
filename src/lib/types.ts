export type TriageLevel = 'Critical' | 'Urgent' | 'Minor' | 'Deceased';

export type PatientStatus = 'Waiting' | 'X-Ray' | 'Lab' | 'Admit' | 'Discharged';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  symptoms: string;
  triageLevel: TriageLevel;
  diagnosis: string;
  destination: string;
  status: PatientStatus;
  timestamp: string;
}

export interface ResourceSummary {
  bloodInventory: {
    'A+': number;
    'B+': number;
    'AB+': number;
    'O+': number;
    'A-': number;
    'B-': number;
    'AB-': number;
    'O-': number;
  };
  ventilators: {
    total: number;
    inUse: number;
  };
}