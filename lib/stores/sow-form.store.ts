import { create } from "zustand";
import { defaultClauseSelection, type ClauseSelection } from "@/lib/contract-clauses";
import type { SowContent } from "@/lib/sow-generation";

export interface SowDeliverableInput {
  item: string;
  acceptanceCriteria: string;
}

export interface SowMilestoneInput {
  label: string;
  pct: number | "";
  targetDate: string;
}

const DEFAULT_DELIVERABLES: SowDeliverableInput[] = [{ item: "", acceptanceCriteria: "" }];

const DEFAULT_MILESTONES: SowMilestoneInput[] = [
  { label: "Discovery & scope", pct: 20, targetDate: "" },
  { label: "Design sign-off", pct: 25, targetDate: "" },
  { label: "Build & integration", pct: 35, targetDate: "" },
  { label: "Launch & handover", pct: 20, targetDate: "" },
];

const TOTAL_STEPS = 5; // Who's this for, The work, Deliverables & responsibilities, Timeline & payment, Terms & review

type TextField =
  | "clientCompany"
  | "projectName"
  | "version"
  | "overviewNotes"
  | "scopeNotes"
  | "outOfScope"
  | "clientResponsibilities"
  | "assumptions"
  | "budget";

interface SowFormState {
  step: number;

  clientName: string;
  clientId: string | null;
  clientCompany: string;
  projectName: string;
  version: string;

  relatedProposalId: string | null;
  relatedContractId: string | null;

  overviewNotes: string;
  scopeNotes: string;
  outOfScope: string;

  deliverables: SowDeliverableInput[];
  clientResponsibilities: string;
  assumptions: string;

  budget: string;
  milestones: SowMilestoneInput[];

  clauses: ClauseSelection;

  generated: SowContent | null;
  generatedDocumentId: string | null;

  setClientName: (value: string) => void;
  selectClient: (client: { id: string; name: string } | null) => void;
  setField: (field: TextField, value: string) => void;
  selectRelatedProposal: (documentId: string | null) => void;
  selectRelatedContract: (documentId: string | null) => void;
  setDeliverableItem: (index: number, value: string) => void;
  setDeliverableCriteria: (index: number, value: string) => void;
  addDeliverable: () => void;
  removeDeliverable: (index: number) => void;
  setMilestoneLabel: (index: number, value: string) => void;
  setMilestonePct: (index: number, value: string) => void;
  setMilestoneTargetDate: (index: number, value: string) => void;
  addMilestone: () => void;
  removeMilestone: (index: number) => void;
  toggleClause: (id: keyof ClauseSelection) => void;
  setClauseField: (key: keyof ClauseSelection, value: string) => void;
  goToStep: (step: number) => void;
  next: () => void;
  back: () => void;
  setGenerated: (content: SowContent, documentId: string) => void;
}

export const useSowFormStore = create<SowFormState>((set) => ({
  step: 0,

  clientName: "",
  clientId: null,
  clientCompany: "",
  projectName: "",
  version: "1.0",

  relatedProposalId: null,
  relatedContractId: null,

  overviewNotes: "",
  scopeNotes: "",
  outOfScope: "",

  deliverables: DEFAULT_DELIVERABLES,
  clientResponsibilities: "",
  assumptions: "",

  budget: "",
  milestones: DEFAULT_MILESTONES,

  clauses: defaultClauseSelection("sow"),

  generated: null,
  generatedDocumentId: null,

  setClientName: (value) => set({ clientName: value, clientId: null, generated: null }),
  selectClient: (client) =>
    set({ clientId: client?.id ?? null, clientName: client?.name ?? "", generated: null }),
  setField: (field, value) => set({ [field]: value, generated: null }),
  selectRelatedProposal: (documentId) => set({ relatedProposalId: documentId, generated: null }),
  selectRelatedContract: (documentId) => set({ relatedContractId: documentId, generated: null }),
  setDeliverableItem: (index, value) =>
    set((s) => ({
      deliverables: s.deliverables.map((d, i) => (i === index ? { ...d, item: value } : d)),
      generated: null,
    })),
  setDeliverableCriteria: (index, value) =>
    set((s) => ({
      deliverables: s.deliverables.map((d, i) =>
        i === index ? { ...d, acceptanceCriteria: value } : d
      ),
      generated: null,
    })),
  addDeliverable: () =>
    set((s) => ({
      deliverables: [...s.deliverables, { item: "", acceptanceCriteria: "" }],
      generated: null,
    })),
  removeDeliverable: (index) =>
    set((s) => ({ deliverables: s.deliverables.filter((_, i) => i !== index), generated: null })),
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
  setMilestoneTargetDate: (index, value) =>
    set((s) => ({
      milestones: s.milestones.map((m, i) => (i === index ? { ...m, targetDate: value } : m)),
      generated: null,
    })),
  addMilestone: () =>
    set((s) => ({
      milestones: [...s.milestones, { label: "", pct: "", targetDate: "" }],
      generated: null,
    })),
  removeMilestone: (index) =>
    set((s) => ({ milestones: s.milestones.filter((_, i) => i !== index), generated: null })),
  toggleClause: (id) =>
    set((s) => ({ clauses: { ...s.clauses, [id]: !s.clauses[id] }, generated: null })),
  setClauseField: (key, value) =>
    set((s) => ({ clauses: { ...s.clauses, [key]: value }, generated: null })),
  goToStep: (step) => set({ step: Math.max(0, Math.min(TOTAL_STEPS - 1, step)) }),
  next: () => set((s) => ({ step: Math.min(TOTAL_STEPS - 1, s.step + 1) })),
  back: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
  setGenerated: (content, documentId) => set({ generated: content, generatedDocumentId: documentId }),
}));
