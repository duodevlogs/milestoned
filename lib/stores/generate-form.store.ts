import { create } from "zustand";
import type { DocType, GeneratedDocumentContent } from "@/lib/document-generation";
import { defaultClauseSelection, type ClauseSelection } from "@/lib/contract-clauses";

export interface MilestoneInput {
  label: string;
  pct: number | "";
}

type TextField =
  | "clientName"
  | "projectName"
  | "budget"
  | "scope"
  | "deliverables"
  | "startDate"
  | "deliveryDate";

const DEFAULT_MILESTONES: MilestoneInput[] = [
  { label: "Discovery & scope", pct: 20 },
  { label: "Design sign-off", pct: 25 },
  { label: "Build & integration", pct: 35 },
  { label: "Launch & handover", pct: 20 },
];

const TOTAL_STEPS = 5; // Type, Project, Scope, Clauses, Milestones

interface GenerateFormState {
  step: number;
  docType: DocType;
  clientName: string;
  clientId: string | null;
  projectName: string;
  budget: string;
  scope: string;
  deliverables: string;
  milestones: MilestoneInput[];
  startDate: string;
  deliveryDate: string;
  clauses: ClauseSelection;

  generated: GeneratedDocumentContent | null;
  generatedDocumentId: string | null;

  setDocType: (docType: DocType) => void;
  setField: (field: TextField, value: string) => void;
  /** Sets clientName+clientId together (picking a saved client); pass null to clear back to free-hand typing. */
  selectClient: (client: { id: string; name: string } | null) => void;
  setMilestoneLabel: (index: number, value: string) => void;
  setMilestonePct: (index: number, value: string) => void;
  addMilestone: () => void;
  removeMilestone: (index: number) => void;
  toggleClause: (id: keyof ClauseSelection) => void;
  setClauseField: (key: keyof ClauseSelection, value: string) => void;
  /** Applies a clause bundle's selection as-is, replacing the current clauses. */
  applyBundle: (clauses: ClauseSelection) => void;
  /** Hydrates docType/scope/deliverables/clauses from a saved template/preset. */
  applyTemplate: (template: {
    docType: DocType;
    scope: string;
    deliverables: string;
    clauses: ClauseSelection;
  }) => void;
  goToStep: (step: number) => void;
  next: () => void;
  back: () => void;
  setGenerated: (content: GeneratedDocumentContent, documentId: string) => void;
}

export const useGenerateFormStore = create<GenerateFormState>((set) => ({
  step: 0,
  docType: "contract",
  clientName: "",
  clientId: null,
  projectName: "",
  budget: "",
  scope: "",
  deliverables: "",
  milestones: DEFAULT_MILESTONES,
  startDate: "",
  deliveryDate: "",
  clauses: defaultClauseSelection("contract"),
  generated: null,
  generatedDocumentId: null,

  setDocType: (docType) =>
    set({ docType, clauses: defaultClauseSelection(docType), generated: null }),
  setField: (field, value) =>
    set({
      [field]: value,
      // Typing the client name manually means it's no longer exactly the
      // picked client (if any) — clear the link so a stale clientId never
      // rides along with an edited name.
      ...(field === "clientName" ? { clientId: null } : {}),
      generated: null,
    }),
  selectClient: (client) =>
    set({
      clientId: client?.id ?? null,
      clientName: client?.name ?? "",
      generated: null,
    }),
  applyBundle: (clauses) => set({ clauses, generated: null }),
  applyTemplate: ({ docType, scope, deliverables, clauses }) =>
    set({ docType, scope, deliverables, clauses, generated: null }),
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
    set((s) => ({ milestones: [...s.milestones, { label: "", pct: 0 }], generated: null })),
  removeMilestone: (index) =>
    set((s) => ({ milestones: s.milestones.filter((_, i) => i !== index), generated: null })),
  toggleClause: (id) =>
    set((s) => ({
      clauses: { ...s.clauses, [id]: !s.clauses[id] },
      generated: null,
    })),
  setClauseField: (key, value) =>
    set((s) => ({ clauses: { ...s.clauses, [key]: value }, generated: null })),
  goToStep: (step) => set({ step: Math.max(0, Math.min(TOTAL_STEPS - 1, step)) }),
  next: () => set((s) => ({ step: Math.min(TOTAL_STEPS - 1, s.step + 1) })),
  back: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
  setGenerated: (content, documentId) =>
    set({ generated: content, generatedDocumentId: documentId }),
}));
