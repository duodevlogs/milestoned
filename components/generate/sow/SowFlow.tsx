"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSowFormStore } from "@/lib/stores/sow-form.store";
import { SowStepIndicator } from "./SowStepIndicator";
import { ClientProjectStep } from "./ClientProjectStep";
import { TheWorkStep } from "./TheWorkStep";
import { DeliverablesStep } from "./DeliverablesStep";
import { TimelineStep } from "./TimelineStep";
import { TermsStep } from "./TermsStep";
import type { SowContent } from "@/lib/sow-generation";
import type { SowDraftFromProposal } from "@/lib/proposal-generation";
import type { ClientWithDocumentCount } from "@/server/services/client.service";
import type { LinkableRefSummary } from "@/server/services/document.service";

const LAST_STEP = 4;

const STEP_META = [
  {
    title: "Who's this for?",
    hint: "The client and project, plus the proposal/contract this SOW governs (if any).",
  },
  {
    title: "The work",
    hint: "Rough notes are fine — the AI turns these into formal, itemized prose.",
  },
  {
    title: "Deliverables",
    hint: "What gets delivered, and how each is judged done.",
  },
  {
    title: "Timeline & payment",
    hint: "One milestone schedule doubles as both the timeline and the payment terms.",
  },
  {
    title: "Terms & review",
    hint: "Confidentiality, IP, warranty, termination, and change orders — reused from Contract's clause library.",
  },
];

interface GenerateApiError {
  error?: { code?: string; message?: string };
}

interface GenerateApiSuccess {
  document: { id: string; content: SowContent };
  creditsRemaining: number;
}

export function SowFlow({
  initialCredits,
  clients,
  linkableDocuments,
  initialFromProposal,
}: {
  initialCredits: number;
  clients: ClientWithDocumentCount[];
  linkableDocuments: LinkableRefSummary[];
  initialFromProposal: SowDraftFromProposal | null;
}) {
  const {
    step,
    clientName,
    clientId,
    clientCompany,
    projectName,
    version,
    relatedProposalId,
    relatedContractId,
    overviewNotes,
    scopeNotes,
    outOfScope,
    deliverables,
    clientResponsibilities,
    assumptions,
    budget,
    milestones,
    clauses,
    generated,
    generatedDocumentId,
    setClientName,
    selectClient,
    setField,
    selectRelatedProposal,
    selectRelatedContract,
    setDeliverableItem,
    setDeliverableCriteria,
    addDeliverable,
    removeDeliverable,
    setMilestoneLabel,
    setMilestonePct,
    setMilestoneTargetDate,
    addMilestone,
    removeMilestone,
    toggleClause,
    setClauseField,
    applyFromProposal,
    next,
    back,
    setGenerated,
  } = useSowFormStore();

  const [creditsRemaining, setCreditsRemaining] = useState(initialCredits);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Hydrate from an accepted Proposal exactly once on mount — opened as
  // /generate/sow?fromProposal=<documentId> via the "Draft SOW" action on a
  // signed Proposal's detail page. Mirrors GenerateFlow's template hydration.
  useEffect(() => {
    if (!initialFromProposal) return;
    applyFromProposal(initialFromProposal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPct = milestones.reduce((sum, m) => sum + (Number(m.pct) || 0), 0);

  const requiredFieldsMissing =
    !clientName.trim() ||
    !projectName.trim() ||
    !overviewNotes.trim() ||
    !scopeNotes.trim() ||
    deliverables.length === 0 ||
    deliverables.some((d) => !d.item.trim() || !d.acceptanceCriteria.trim()) ||
    !(Number(budget) > 0) ||
    milestones.length === 0 ||
    milestones.some((m) => !m.label.trim()) ||
    totalPct !== 100;

  const clausesInvalid =
    (clauses.governingLaw && !clauses.governingLawJurisdiction.trim()) ||
    (clauses.customClause && !clauses.customClauseText.trim());

  async function handleGenerate() {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/generate-sow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          clientId,
          clientCompany: clientCompany || undefined,
          projectName,
          version: version || undefined,
          relatedProposalId,
          relatedContractId,
          overviewNotes,
          scopeNotes,
          outOfScope: outOfScope || undefined,
          deliverables,
          clientResponsibilities: clientResponsibilities || undefined,
          assumptions: assumptions || undefined,
          budget: Number(budget) || 0,
          milestones: milestones.map((m) => ({
            label: m.label,
            pct: Number(m.pct) || 0,
            targetDate: m.targetDate || undefined,
          })),
          clauses,
        }),
      });
      const json: GenerateApiSuccess & GenerateApiError = await res.json();
      if (!res.ok) {
        setSubmitError(json.error?.message ?? "Something went wrong. Please try again.");
        return;
      }
      setGenerated(json.document.content, json.document.id);
      setCreditsRemaining(json.creditsRemaining);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePrimary() {
    if (step < LAST_STEP) {
      next();
      return;
    }
    handleGenerate();
  }

  const primaryDisabled = isSubmitting || (step === LAST_STEP && (requiredFieldsMissing || clausesInvalid));

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-navy text-fg">
      <header className="flex flex-shrink-0 items-center justify-between border-b border-line-faint px-8 py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-[13.5px] text-fg-tertiary">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path
                d="M9.5 3L5 7.5L9.5 12"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Documents
          </Link>
          <span className="h-[18px] w-px bg-line-input" />
          <span className="font-display text-[15px] font-semibold tracking-[-0.01em] text-fg-bright">
            New scope of work
          </span>
        </div>
        <SowStepIndicator step={step} />
      </header>

      <div className="flex min-h-0 flex-1 justify-center overflow-y-auto px-10 pb-5 pt-9">
        <div className="w-full max-w-[560px]">
          <div className="mb-[26px]">
            <div className="mb-1.5 font-display text-xl font-semibold tracking-[-0.015em] text-fg-heading">
              {STEP_META[step].title}
            </div>
            <div className="text-sm leading-[1.5] text-fg-tertiary">{STEP_META[step].hint}</div>
          </div>

          {step === 0 && (
            <ClientProjectStep
              clientName={clientName}
              clientId={clientId}
              clients={clients}
              clientCompany={clientCompany}
              projectName={projectName}
              version={version}
              relatedProposalId={relatedProposalId}
              relatedContractId={relatedContractId}
              linkableDocuments={linkableDocuments}
              onClientName={setClientName}
              onSelectClient={selectClient}
              onClientCompany={(v) => setField("clientCompany", v)}
              onProjectName={(v) => setField("projectName", v)}
              onVersion={(v) => setField("version", v)}
              onSelectRelatedProposal={selectRelatedProposal}
              onSelectRelatedContract={selectRelatedContract}
            />
          )}
          {step === 1 && (
            <TheWorkStep
              overviewNotes={overviewNotes}
              scopeNotes={scopeNotes}
              outOfScope={outOfScope}
              onOverviewNotes={(v) => setField("overviewNotes", v)}
              onScopeNotes={(v) => setField("scopeNotes", v)}
              onOutOfScope={(v) => setField("outOfScope", v)}
            />
          )}
          {step === 2 && (
            <DeliverablesStep
              deliverables={deliverables}
              clientResponsibilities={clientResponsibilities}
              assumptions={assumptions}
              onDeliverableItem={setDeliverableItem}
              onDeliverableCriteria={setDeliverableCriteria}
              onAddDeliverable={addDeliverable}
              onRemoveDeliverable={removeDeliverable}
              onClientResponsibilities={(v) => setField("clientResponsibilities", v)}
              onAssumptions={(v) => setField("assumptions", v)}
            />
          )}
          {step === 3 && (
            <TimelineStep
              budget={budget}
              milestones={milestones}
              onBudget={(v) => setField("budget", v)}
              onMilestoneLabel={setMilestoneLabel}
              onMilestonePct={setMilestonePct}
              onMilestoneTargetDate={setMilestoneTargetDate}
              onAddMilestone={addMilestone}
              onRemoveMilestone={removeMilestone}
            />
          )}
          {step === 4 && (
            <TermsStep clauses={clauses} onToggle={toggleClause} onFieldChange={setClauseField} />
          )}

          <div className="sticky bottom-0 mt-6 w-full border-t border-line-faint bg-navy py-4">
            {submitError && (
              <div className="mb-3 text-[13px] leading-normal text-danger">{submitError}</div>
            )}
            <div className="flex items-center justify-between gap-4">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={back}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] border border-line-strong bg-transparent px-[18px] py-[11px] text-sm font-medium text-fg-soft"
                >
                  Back
                </button>
              ) : (
                <span />
              )}
              <div className="ml-auto flex items-center gap-4">
                <span className="flex items-center gap-[7px] text-[13px] text-fg-tertiary">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  {creditsRemaining} credits · uses 1
                </span>
                <button
                  type="button"
                  onClick={handlePrimary}
                  disabled={primaryDisabled}
                  className="inline-flex cursor-pointer items-center gap-2.5 rounded-[10px] border-none bg-gold px-[22px] py-3 font-display text-[15px] font-semibold text-gold-contrast shadow-[0_1px_0_rgba(255,255,255,0.15)_inset] transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isSubmitting
                    ? "Generating…"
                    : step < LAST_STEP
                      ? "Continue"
                      : generated
                        ? "Regenerate"
                        : "Generate SOW"}
                  {!isSubmitting && (
                    <span className="translate-y-[0.5px] text-[1.05em] leading-none">
                      {step < LAST_STEP ? "→" : "✦"}
                    </span>
                  )}
                </button>
              </div>
            </div>
            {generated && generatedDocumentId && (
              <div className="mt-3 text-right">
                <Link href={`/documents/${generatedDocumentId}`} className="text-[13px] font-medium">
                  View document →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
