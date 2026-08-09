"use client";

import { useState } from "react";
import Link from "next/link";
import { useProposalFormStore } from "@/lib/stores/proposal-form.store";
import { ProposalStepIndicator } from "./ProposalStepIndicator";
import { ClientProjectStep } from "./ClientProjectStep";
import { PitchStep } from "./PitchStep";
import { InvestmentStep } from "./InvestmentStep";
import { ReviewStep } from "./ReviewStep";
import type { ProposalContent } from "@/lib/proposal-generation";
import type { ClientWithDocumentCount } from "@/server/services/client.service";

const LAST_STEP = 3;

const STEP_META = [
  {
    title: "Who's this for?",
    hint: "The client and project this proposal is pitching.",
  },
  {
    title: "The pitch",
    hint: "Rough notes are fine — the AI turns these into persuasive, formal prose.",
  },
  {
    title: "Investment",
    hint: "Total price, how it's split into milestones, and how long the pricing holds.",
  },
  {
    title: "Scope, timeline & review",
    hint: "High-level scope and timeline, plus what's assumed or excluded.",
  },
];

interface GenerateApiError {
  error?: { code?: string; message?: string };
}

interface GenerateApiSuccess {
  document: { id: string; content: ProposalContent };
  creditsRemaining: number;
}

export function ProposalFlow({
  initialCredits,
  clients,
}: {
  initialCredits: number;
  clients: ClientWithDocumentCount[];
}) {
  const {
    step,
    clientName,
    clientId,
    clientCompany,
    projectName,
    problemNotes,
    approachNotes,
    whyUsNotes,
    scopeOverview,
    timelineOverview,
    budget,
    milestones,
    addOns,
    assumptionsExclusions,
    nextSteps,
    validityDays,
    includeAcceptanceSignature,
    generated,
    generatedDocumentId,
    setClientName,
    selectClient,
    setField,
    setMilestoneLabel,
    setMilestonePct,
    addMilestone,
    removeMilestone,
    setAddOnLabel,
    setAddOnAmount,
    addAddOn,
    removeAddOn,
    toggleAcceptanceSignature,
    next,
    back,
    setGenerated,
  } = useProposalFormStore();

  const [creditsRemaining, setCreditsRemaining] = useState(initialCredits);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totalPct = milestones.reduce((sum, m) => sum + (Number(m.pct) || 0), 0);

  const requiredFieldsMissing =
    !clientName.trim() ||
    !projectName.trim() ||
    !problemNotes.trim() ||
    !approachNotes.trim() ||
    !whyUsNotes.trim() ||
    !scopeOverview.trim() ||
    !timelineOverview.trim() ||
    !(Number(budget) > 0) ||
    milestones.length === 0 ||
    milestones.some((m) => !m.label.trim()) ||
    totalPct !== 100 ||
    !(Number(validityDays) > 0);

  async function handleGenerate() {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          clientId,
          clientCompany: clientCompany || undefined,
          projectName,
          problemNotes,
          approachNotes,
          whyUsNotes,
          scopeOverview,
          timelineOverview,
          budget: Number(budget) || 0,
          milestones: milestones.map((m) => ({ label: m.label, pct: Number(m.pct) || 0 })),
          addOns: addOns
            .filter((a) => a.label.trim() && Number(a.amount) > 0)
            .map((a) => ({ label: a.label, amount: Number(a.amount) })),
          assumptionsExclusions: assumptionsExclusions || undefined,
          nextSteps: nextSteps || undefined,
          validityDays: Number(validityDays) || 30,
          includeAcceptanceSignature,
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

  const primaryDisabled = isSubmitting || (step === LAST_STEP && requiredFieldsMissing);

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
            New proposal
          </span>
        </div>
        <ProposalStepIndicator step={step} />
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
              onClientName={setClientName}
              onSelectClient={selectClient}
              onClientCompany={(v) => setField("clientCompany", v)}
              onProjectName={(v) => setField("projectName", v)}
            />
          )}
          {step === 1 && (
            <PitchStep
              problemNotes={problemNotes}
              approachNotes={approachNotes}
              whyUsNotes={whyUsNotes}
              onProblemNotes={(v) => setField("problemNotes", v)}
              onApproachNotes={(v) => setField("approachNotes", v)}
              onWhyUsNotes={(v) => setField("whyUsNotes", v)}
            />
          )}
          {step === 2 && (
            <InvestmentStep
              budget={budget}
              milestones={milestones}
              addOns={addOns}
              validityDays={validityDays}
              onBudget={(v) => setField("budget", v)}
              onMilestoneLabel={setMilestoneLabel}
              onMilestonePct={setMilestonePct}
              onAddMilestone={addMilestone}
              onRemoveMilestone={removeMilestone}
              onAddOnLabel={setAddOnLabel}
              onAddOnAmount={setAddOnAmount}
              onAddAddOn={addAddOn}
              onRemoveAddOn={removeAddOn}
              onValidityDays={(v) => setField("validityDays", v)}
            />
          )}
          {step === 3 && (
            <ReviewStep
              scopeOverview={scopeOverview}
              timelineOverview={timelineOverview}
              assumptionsExclusions={assumptionsExclusions}
              nextSteps={nextSteps}
              includeAcceptanceSignature={includeAcceptanceSignature}
              onScopeOverview={(v) => setField("scopeOverview", v)}
              onTimelineOverview={(v) => setField("timelineOverview", v)}
              onAssumptionsExclusions={(v) => setField("assumptionsExclusions", v)}
              onNextSteps={(v) => setField("nextSteps", v)}
              onToggleAcceptanceSignature={toggleAcceptanceSignature}
            />
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
                        : "Generate proposal"}
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
