export type TriageLevel = 'Critical' | 'Urgent' | 'Minor' | 'Deceased' | 'Non-Urgent';

export type PatientStatus = 'Waiting' | 'X-Ray' | 'CT' | 'Lab' | 'Admit' | 'OR' | 'D/C' | 'Refer' | 'Dead';

export interface Patient {
  id: string;
  scene: string;
  triageLevel: TriageLevel;
  name: string;
  hn: string;
  age: number;
  edTriage: TriageLevel;
  diagnosis: string;
  status: PatientStatus;
  destination: string;
  o2: string;
  arrival: string;
  disp: string;
  blood: string;
  note: string;
  timestamp: string;
}

export interface ResourceSummary {
  bloodInventory: {
    'A': number;
    'B': number;
    'AB': number;
    'O': number;
  };
  ventilators: {
    er: { vent: number; bird: number };
    center: { vent: number; bird: number };
  };
}
