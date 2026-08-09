import { create } from "zustand";
import type { ProposalContent } from "@/lib/proposal-generation";

export interface ProposalMilestoneInput {
  label: string;
  pct: number | "";
}

export interface ProposalAddOnInput {
  label: string;
  amount: string;
}

const DEFAULT_MILESTONES: ProposalMilestoneInput[] = [
  { label: "Discovery & scope", pct: 20 },
  { label: "Design sign-off", pct: 25 },
  { label: "Build & integration", pct: 35 },
  { label: "Launch & handover", pct: 20 },
];

const TOTAL_STEPS = 4; // Who's this for, The pitch, Investment & terms, Scope/timeline & review

type TextField =
  | "clientCompany"
  | "projectName"
  | "problemNotes"
  | "approachNotes"
  | "whyUsNotes"
  | "scopeOverview"
  | "timelineOverview"
  | "budget"
  | "assumptionsExclusions"
  | "nextSteps"
  | "validityDays";

interface ProposalFormState {
  step: number;

  clientName: string;
  clientId: string | null;
  clientCompany: string;
  projectName: string;

  problemNotes: string;
  approachNotes: string;
  whyUsNotes: string;

  scopeOverview: string;
  timelineOverview: string;

  budget: string;
  milestones: ProposalMilestoneInput[];
  addOns: ProposalAddOnInput[];

  assumptionsExclusions: string;
  nextSteps: string;
  validityDays: string;
  includeAcceptanceSignature: boolean;

  generated: ProposalContent | null;
  generatedDocumentId: string | null;

  setClientName: (value: string) => void;
  selectClient: (client: { id: string; name: string } | null) => void;
  setField: (field: TextField, value: string) => void;
  setMilestoneLabel: (index: number, value: string) => void;
  setMilestonePct: (index: number, value: string) => void;
  addMilestone: () => void;
  removeMilestone: (index: number) => void;
  setAddOnLabel: (index: number, value: string) => void;
  setAddOnAmount: (index: number, value: string) => void;
  addAddOn: () => void;
  removeAddOn: (index: number) => void;
  toggleAcceptanceSignature: () => void;
  goToStep: (step: number) => void;
  next: () => void;
  back: () => void;
  setGenerated: (content: ProposalContent, documentId: string) => void;
}

export const useProposalFormStore = create<ProposalFormState>((set) => ({
  step: 0,

  clientName: "",
  clientId: null,
  clientCompany: "",
  projectName: "",

  problemNotes: "",
  approachNotes: "",
  whyUsNotes: "",

  scopeOverview: "",
  timelineOverview: "",

  budget: "",
  milestones: DEFAULT_MILESTONES,
  addOns: [],

  assumptionsExclusions: "",
  nextSteps: "",
  validityDays: "30",
  includeAcceptanceSignature: true,

  generated: null,
  generatedDocumentId: null,

  setClientName: (value) => set({ clientName: value, clientId: null, generated: null }),
  selectClient: (client) =>
    set({ clientId: client?.id ?? null, clientName: client?.name ?? "", generated: null }),
  setField: (field, value) => set({ [field]: value, generated: null }),
  setMilestoneLabel: (index, value) =>
    set((s) => ({
      milestones: s.milestones.map((m, i) => (i === index ? { ...m, label: value } : m)),
      generated: null,
    })),
  setMilestonePct: (index, value) =>
    set((s) => ({
      milestones: s.milestones.map((m, i) =>
        i === index ? { ...m, pct: value === "" ? "" : Number(value) } : m
      ),
      generated: null,
    })),
  addMilestone: () =>
    set((s) => ({ milestones: [...s.milestones, { label: "", pct: "" }], generated: null })),
  removeMilestone: (index) =>
    set((s) => ({ milestones: s.milestones.filter((_, i) => i !== index), generated: null })),
  setAddOnLabel: (index, value) =>
    set((s) => ({
      addOns: s.addOns.map((a, i) => (i === index ? { ...a, label: value } : a)),
      generated: null,
    })),
  setAddOnAmount: (index, value) =>
    set((s) => ({
      addOns: s.addOns.map((a, i) => (i === index ? { ...a, amount: value } : a)),
      generated: null,
    })),
  addAddOn: () => set((s) => ({ addOns: [...s.addOns, { label: "", amount: "" }], generated: null })),
  removeAddOn: (index) =>
    set((s) => ({ addOns: s.addOns.filter((_, i) => i !== index), generated: null })),
  toggleAcceptanceSignature: () =>
    set((s) => ({ includeAcceptanceSignature: !s.includeAcceptanceSignature, generated: null })),
  goToStep: (step) => set({ step: Math.max(0, Math.min(TOTAL_STEPS - 1, step)) }),
  next: () => set((s) => ({ step: Math.min(TOTAL_STEPS - 1, s.step + 1) })),
  back: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
  setGenerated: (content, documentId) => set({ generated: content, generatedDocumentId: documentId }),
}));
