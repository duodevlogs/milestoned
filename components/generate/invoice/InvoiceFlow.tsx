"use client";

import { useState } from "react";
import Link from "next/link";
import { useInvoiceFormStore } from "@/lib/stores/invoice-form.store";
import { InvoiceStepIndicator } from "./InvoiceStepIndicator";
import { ClientProjectStep } from "./ClientProjectStep";
import { BillingDetailsStep } from "./BillingDetailsStep";
import { LineItemsStep } from "./LineItemsStep";
import type { InvoiceContent } from "@/lib/invoice-generation";
import type { ClientWithDocumentCount } from "@/server/services/client.service";
import type { LinkableDocumentSummary } from "@/server/services/document.service";

const LAST_STEP = 2;

const STEP_META = [
  {
    title: "Who's this invoice for?",
    hint: "Pick or type the client, and optionally tie this invoice back to an existing SOW or Contract.",
  },
  {
    title: "Billing terms",
    hint: "Invoice date, due date, currency, and tax — the mechanics of the charge.",
  },
  {
    title: "Line items & review",
    hint: "What's being billed, and how it adds up. Interest-free, always.",
  },
];

interface GenerateApiError {
  error?: { code?: string; message?: string };
}

interface GenerateApiSuccess {
  document: { id: string; content: InvoiceContent };
  creditsRemaining: number;
}

export function InvoiceFlow({
  initialCredits,
  clients,
  linkableDocuments,
}: {
  initialCredits: number;
  clients: ClientWithDocumentCount[];
  linkableDocuments: LinkableDocumentSummary[];
}) {
  const {
    step,
    clientName,
    clientId,
    clientCompany,
    clientBillingAddress,
    projectName,
    relatedDocumentId,
    invoiceDate,
    dueDate,
    paymentTermsLabel,
    poNumber,
    currency,
    taxRatePct,
    lineItems,
    milestoneCurrent,
    milestoneTotal,
    thankYouNote,
    generated,
    generatedDocumentId,
    setClientName,
    selectClient,
    setField,
    setCurrency,
    selectRelatedDocument,
    addMilestoneAsLineItem,
    setLineItemDescription,
    setLineItemAmount,
    addLineItem,
    removeLineItem,
    next,
    back,
    setGenerated,
  } = useInvoiceFormStore();

  const [creditsRemaining, setCreditsRemaining] = useState(initialCredits);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const requiredFieldsMissing =
    !clientName.trim() ||
    !projectName.trim() ||
    !invoiceDate.trim() ||
    !paymentTermsLabel.trim() ||
    lineItems.length === 0 ||
    lineItems.some((item) => !item.description.trim() || !(Number(item.amount) > 0));

  async function handleGenerate() {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const milestoneProgress =
        milestoneCurrent.trim() && milestoneTotal.trim()
          ? { current: Number(milestoneCurrent), total: Number(milestoneTotal) }
          : undefined;

      const res = await fetch("/api/generate-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          clientId,
          clientCompany: clientCompany || undefined,
          clientBillingAddress: clientBillingAddress || undefined,
          projectName,
          relatedDocumentId,
          invoiceDate,
          dueDate: dueDate || undefined,
          paymentTermsLabel,
          poNumber: poNumber || undefined,
          currency,
          taxRatePct: Number(taxRatePct) || 0,
          lineItems: lineItems.map((item) => ({
            description: item.description,
            milestoneLabel: item.milestoneLabel || undefined,
            amount: Number(item.amount) || 0,
          })),
          milestoneProgress,
          thankYouNote: thankYouNote || undefined,
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
            New invoice
          </span>
        </div>
        <InvoiceStepIndicator step={step} />
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
              clientBillingAddress={clientBillingAddress}
              projectName={projectName}
              relatedDocumentId={relatedDocumentId}
              linkableDocuments={linkableDocuments}
              onClientName={setClientName}
              onSelectClient={selectClient}
              onClientCompany={(v) => setField("clientCompany", v)}
              onClientBillingAddress={(v) => setField("clientBillingAddress", v)}
              onProjectName={(v) => setField("projectName", v)}
              onSelectRelatedDocument={selectRelatedDocument}
              onAddMilestoneAsLineItem={addMilestoneAsLineItem}
            />
          )}
          {step === 1 && (
            <BillingDetailsStep
              invoiceDate={invoiceDate}
              dueDate={dueDate}
              paymentTermsLabel={paymentTermsLabel}
              poNumber={poNumber}
              currency={currency}
              taxRatePct={taxRatePct}
              onInvoiceDate={(v) => setField("invoiceDate", v)}
              onDueDate={(v) => setField("dueDate", v)}
              onPaymentTermsLabel={(v) => setField("paymentTermsLabel", v)}
              onPoNumber={(v) => setField("poNumber", v)}
              onCurrency={setCurrency}
              onTaxRatePct={(v) => setField("taxRatePct", v)}
            />
          )}
          {step === 2 && (
            <LineItemsStep
              lineItems={lineItems}
              currency={currency}
              taxRatePct={taxRatePct}
              milestoneCurrent={milestoneCurrent}
              milestoneTotal={milestoneTotal}
              thankYouNote={thankYouNote}
              onDescription={setLineItemDescription}
              onAmount={setLineItemAmount}
              onAdd={addLineItem}
              onRemove={removeLineItem}
              onMilestoneCurrent={(v) => setField("milestoneCurrent", v)}
              onMilestoneTotal={(v) => setField("milestoneTotal", v)}
              onThankYouNote={(v) => setField("thankYouNote", v)}
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
                        : "Generate invoice"}
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
