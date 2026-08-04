"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGenerateFormStore } from "@/lib/stores/generate-form.store";
import { StepIndicator } from "./StepIndicator";
import { DocTypeStep } from "./steps/DocTypeStep";
import { ProjectDetailsStep } from "./steps/ProjectDetailsStep";
import { ScopeStep } from "./steps/ScopeStep";
import { ClausesStep } from "./steps/ClausesStep";
import { MilestonesStep } from "./steps/MilestonesStep";
import { LivePreview } from "./LivePreview";
import type { GeneratedDocumentContent } from "@/lib/document-generation";
import type { ClauseSelection } from "@/lib/contract-clauses";
import type { ClauseBundle, Template } from "@/server/db/schema";
import type { ClientWithDocumentCount } from "@/server/services/client.service";

const LAST_STEP = 4;

const STEP_META = [
  {
    title: "What are you creating?",
    hint: "Pick the document Milestoned should generate. You can create the others from the same project later.",
  },
  {
    title: "Project details",
    hint: "Who's it for and what's the total value? This anchors the payment schedule.",
  },
  {
    title: "Scope of work",
    hint: "Outline the work in plain language — Milestoned drafts the formal clauses.",
  },
  {
    title: "Contract clauses",
    hint: "Pick the protective terms to include. Fixed, standard wording — nothing is added without your say-so.",
  },
  {
    title: "Milestones & timeline",
    hint: "Split the fee into interest-free milestones. They must add up to 100%.",
  },
];

interface GenerateApiError {
  error?: { code?: string; message?: string };
}

interface GenerateApiSuccess {
  document: { id: string; content: GeneratedDocumentContent };
  creditsRemaining: number;
}

export function GenerateFlow({
  initialCredits,
  clients,
  bundles,
  initialTemplate,
  businessName,
  logoUrl,
}: {
  initialCredits: number;
  clients: ClientWithDocumentCount[];
  bundles: ClauseBundle[];
  initialTemplate: Template | null;
  businessName?: string | null;
  logoUrl?: string | null;
}) {
  const {
    step,
    docType,
    clientName,
    clientId,
    projectName,
    budget,
    scope,
    deliverables,
    milestones,
    startDate,
    deliveryDate,
    clauses,
    generated,
    generatedDocumentId,
    setDocType,
    setField,
    selectClient,
    setMilestoneLabel,
    setMilestonePct,
    addMilestone,
    removeMilestone,
    toggleClause,
    setClauseField,
    applyBundle,
    applyTemplate,
    next,
    back,
    setGenerated,
  } = useGenerateFormStore();

  const router = useRouter();
  const [creditsRemaining, setCreditsRemaining] = useState(initialCredits);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Hydrate the wizard from a saved template exactly once on mount, when
  // opened as /generate?template=<id> (e.g. from the Templates page's "Use"
  // link) — deliberately not re-applying on every render/re-fetch.
  useEffect(() => {
    if (!initialTemplate) return;
    applyTemplate({
      docType: initialTemplate.docType,
      scope: initialTemplate.scope,
      deliverables: initialTemplate.deliverables,
      clauses: initialTemplate.clauseSelection as ClauseSelection,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPct = milestones.reduce((sum, m) => sum + (Number(m.pct) || 0), 0);
  const requiredFieldsMissing =
    !clientName.trim() || !projectName.trim() || !(Number(budget) > 0) || !scope.trim();
  const clausesInvalid =
    (clauses.governingLaw && !clauses.governingLawJurisdiction.trim()) ||
    (clauses.customClause && !clauses.customClauseText.trim());

  async function handleGenerate() {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType,
          clientName,
          clientId,
          projectName,
          budget: Number(budget) || 0,
          scope,
          deliverables,
          milestones: milestones.map((m) => ({ label: m.label, pct: Number(m.pct) || 0 })),
          startDate: startDate || undefined,
          deliveryDate: deliveryDate || undefined,
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

  async function handleSaveBundle(name: string) {
    const res = await fetch("/api/clause-bundles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, clauses }),
    });
    if (!res.ok) throw new Error("Failed to save bundle");
  }

  async function handleSavePreset(name: string) {
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, docType, scope, deliverables, clauses }),
    });
    if (!res.ok) throw new Error("Failed to save preset");
  }

  function handlePrimary() {
    if (step < LAST_STEP) {
      next();
      return;
    }
    handleGenerate();
  }

  const primaryDisabled =
    isSubmitting ||
    (step === LAST_STEP && (totalPct !== 100 || requiredFieldsMissing || clausesInvalid));

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
            New document
          </span>
        </div>
        <StepIndicator step={step} />
      </header>

      <div className="flex min-h-0 flex-1">
        <section className="flex min-w-0 flex-[1_1_46%] flex-col overflow-y-auto px-10 pb-5 pt-9">
          <div className="mx-auto w-full max-w-[520px] flex-1">
            <div className="mb-[26px]">
              <div className="mb-1.5 font-display text-xl font-semibold tracking-[-0.015em] text-fg-heading">
                {STEP_META[step].title}
              </div>
              <div className="text-sm leading-[1.5] text-fg-tertiary">{STEP_META[step].hint}</div>
            </div>

            {step === 0 && (
              <DocTypeStep
                docType={docType}
                onSelect={(dt) => {
                  // Invoices have their own dedicated flow (separate content
                  // shape from Contract/SOW/Proposal) — divert immediately
                  // rather than continuing this contract-shaped wizard.
                  if (dt === "invoice") {
                    router.push("/generate/invoice");
                    return;
                  }
                  setDocType(dt);
                }}
              />
            )}
            {step === 1 && (
              <ProjectDetailsStep
                clientName={clientName}
                clientId={clientId}
                clients={clients}
                projectName={projectName}
                budget={budget}
                onClientName={(v) => setField("clientName", v)}
                onSelectClient={selectClient}
                onProjectName={(v) => setField("projectName", v)}
                onBudget={(v) => setField("budget", v)}
              />
            )}
            {step === 2 && (
              <ScopeStep
                scope={scope}
                deliverables={deliverables}
                onScope={(v) => setField("scope", v)}
                onDeliverables={(v) => setField("deliverables", v)}
              />
            )}
            {step === 3 && (
              <ClausesStep
                clauses={clauses}
                bundles={bundles}
                onToggle={toggleClause}
                onFieldChange={setClauseField}
                onApplyBundle={applyBundle}
                onSaveBundle={handleSaveBundle}
                onSavePreset={handleSavePreset}
              />
            )}
            {step === 4 && (
              <MilestonesStep
                milestones={milestones}
                startDate={startDate}
                deliveryDate={deliveryDate}
                onLabel={setMilestoneLabel}
                onPct={setMilestonePct}
                onAdd={addMilestone}
                onRemove={removeMilestone}
                onStartDate={(v) => setField("startDate", v)}
                onDeliveryDate={(v) => setField("deliveryDate", v)}
              />
            )}
          </div>

          <div className="sticky bottom-0 mx-auto mt-6 w-full max-w-[520px] border-t border-line-faint bg-navy py-4">
            {submitError && (
              <div className="mb-3 text-[13px] leading-normal text-danger">{submitError}</div>
            )}
            {step === LAST_STEP && clausesInvalid && (
              <div className="mb-3 text-[13px] leading-normal text-[#d0a24a]">
                {clauses.governingLaw && !clauses.governingLawJurisdiction.trim()
                  ? "Enter a jurisdiction for the governing law clause, or uncheck it."
                  : "Enter your custom clause text, or uncheck it."}
              </div>
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
                        : "Generate document"}
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
        </section>

        <LivePreview
          docType={docType}
          clientName={clientName}
          projectName={projectName}
          budget={budget}
          scope={scope}
          deliverables={deliverables}
          milestones={milestones}
          startDate={startDate}
          deliveryDate={deliveryDate}
          clauses={clauses}
          generated={generated}
          businessName={businessName}
          logoUrl={logoUrl}
        />
      </div>
    </div>
  );
}
