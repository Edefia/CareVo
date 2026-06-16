import { create } from 'zustand';

export type LabStatus = 'PENDING_ARRIVAL' | 'ATTENDED' | 'RESULTS_ENTERED' | 'SUBMITTED';

export interface AssignedClient {
  id: string;
  referralCode: string;
  clientName: string;
  package: string;
  packageId: string;
  pillar: string;
  bookedFor: string;
  status: LabStatus;
}

export interface PendingInterpretation {
  id: string;
  submittedAt: string;
  referralCode: string;
  clientName: string;
  package: string;
  packageId: string;
  pillar: string;
  pillars: string[];
  lab: string;
  labData: Record<string, any[]>;
  labNotes?: string;
}

interface ResultsState {
  assignedClients: AssignedClient[];
  pendingInterpretations: PendingInterpretation[];
  submitLabResult: (referralCode: string, labData: Record<string, any[]>, notes: string) => void;
  publishInterpretation: (referralCode: string, assessmentData: any) => void;
  markClientArrived: (referralCode: string) => void;
}

// Initial mock data
const INITIAL_CLIENTS: AssignedClient[] = [
  {
    id: "bkg-1",
    referralCode: "CRV-2025-A7K3P2",
    clientName: "Kwame Mensah",
    package: "Complete Wellness",
    packageId: "pkg-4",
    pillar: "METABOLIC",
    bookedFor: "Today, 09:00 AM",
    status: "PENDING_ARRIVAL"
  },
  {
    id: "bkg-2",
    referralCode: "CRV-2025-M9B4R1",
    clientName: "Ama Serwaa",
    package: "Complete Wellness",
    packageId: "pkg-4",
    pillar: "METABOLIC",
    bookedFor: "Today, 11:30 AM",
    status: "ATTENDED"
  },
  {
    id: "bkg-3",
    referralCode: "CRV-2025-X2L8J4",
    clientName: "Kofi Annan",
    package: "Renal Check",
    packageId: "pkg-2",
    pillar: "RENAL",
    bookedFor: "Yesterday, 02:00 PM",
    status: "RESULTS_ENTERED"
  }
];

const INITIAL_PENDING: PendingInterpretation[] = [
  {
    id: "res-1",
    submittedAt: "2 hours ago",
    referralCode: "CRV-2025-V5N1C9",
    clientName: "Abena Osei",
    package: "Metabolic Profile",
    packageId: "pkg-3",
    pillar: "METABOLIC",
    pillars: ["METABOLIC"],
    lab: "MediScan Ghana",
    labData: {
      METABOLIC: [
        { name: "Fasting Blood Glucose", value: "7.1", unit: "mmol/L", normalRange: "3.9 - 5.5", isOutlier: true },
        { name: "HbA1c", value: "6.4", unit: "%", normalRange: "< 5.7", isOutlier: true },
        { name: "Body Mass Index", value: "24.5", unit: "kg/m²", normalRange: "18.5 - 24.9", isOutlier: false }
      ]
    }
  }
];

export const useResultsStore = create<ResultsState>((set) => ({
  assignedClients: INITIAL_CLIENTS,
  pendingInterpretations: INITIAL_PENDING,

  markClientArrived: (referralCode) => {
    set((state) => ({
      assignedClients: state.assignedClients.map((client) =>
        client.referralCode === referralCode
          ? { ...client, status: 'ATTENDED' as LabStatus }
          : client
      ),
    }));
  },

  submitLabResult: (referralCode, labData, notes) => {
    set((state) => {
      const client = state.assignedClients.find((c) => c.referralCode === referralCode);
      if (!client) return state;

      // Ensure 'pillars' array exists correctly based on package
      const pillars = client.package === "Complete Wellness" 
        ? ["CARDIO", "RENAL", "METABOLIC"] 
        : [client.pillar];

      const newPending: PendingInterpretation = {
        id: `res-${Date.now()}`,
        submittedAt: "Just now",
        referralCode: client.referralCode,
        clientName: client.clientName,
        package: client.package,
        packageId: client.packageId,
        pillar: client.pillar,
        pillars,
        lab: "Current Lab (Self)",
        labData,
        labNotes: notes
      };

      return {
        assignedClients: state.assignedClients.map((c) =>
          c.referralCode === referralCode ? { ...c, status: 'SUBMITTED' as LabStatus } : c
        ),
        pendingInterpretations: [newPending, ...state.pendingInterpretations]
      };
    });
  },

  publishInterpretation: (referralCode, _assessmentData) => {
    set((state) => ({
      pendingInterpretations: state.pendingInterpretations.filter(
        (p) => p.referralCode !== referralCode
      ),
    }));
  }
}));
