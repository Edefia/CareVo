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
  completedInterpretationsCount: number;
  submitLabResult: (referralCode: string, labData: Record<string, any[]>, notes: string) => void;
  publishInterpretation: (referralCode: string, assessmentData: any) => void;
  markClientArrived: (referralCode: string) => void;
}

// Initial mock data removed as requested
const INITIAL_CLIENTS: AssignedClient[] = [];

const INITIAL_PENDING: PendingInterpretation[] = [];

export const useResultsStore = create<ResultsState>((set) => ({
  assignedClients: INITIAL_CLIENTS,
  pendingInterpretations: INITIAL_PENDING,
  completedInterpretationsCount: 0,

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
      completedInterpretationsCount: state.completedInterpretationsCount + 1,
    }));
  }
}));
