import { DOC_TYPE_META } from "@/lib/document-display";
import {
  computeMilestoneAmounts,
  formatTimelineLabel,
  type DocType,
  type GeneratedDocumentContent,
} from "@/lib/document-generation";
import { ACCEPTANCE_CLAUSE, buildClauseSections, type ClauseSelection } from "@/lib/contract-clauses";
import { useA4Pagination } from "@/lib/hooks/use-a4-pagination";
import { PageBreakLines } from "@/components/document/PageBreakLines";
import { PaperHeader } from "@/components/document/PaperHeader";
import { PaymentScheduleBlock } from "@/components/document/PaymentScheduleBlock";
import { PaperFooter } from "@/components/document/PaperFooter";
import type { MilestoneInput } from "@/lib/stores/generate-form.store";

export function LivePreview({
  docType,
  clientName,
  projectName,
  budget,
  scope,
  deliverables,
  milestones,
  startDate,
  deliveryDate,
  clauses,
  generated,
}: {
  docType: DocType;
  clientName: string;
  projectName: string;
  budget: string;
  scope: string;
  deliverables: string;
  milestones: MilestoneInput[];
  startDate: string;
  deliveryDate: string;
  clauses: ClauseSelection;
  generated: GeneratedDocumentContent | null;
}) {
  const { ref: paperRef, pagination } = useA4Pagination<HTMLDivElement>();

  const budgetNum = Number(budget) || 0;
  const previewMilestones = computeMilestoneAmounts(
    milestones.map((m) => ({ label: m.label, pct: Number(m.pct) || 0 })),
    budgetNum
  );
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Clauses are fixed templates — fully accurate live, no AI round-trip needed.
  const clauseSections = buildClauseSections(clauses);
  const scopeBody = generated
    ? (generated.sections.find((s) => s.title === "Scope of Work")?.body ?? scope)
    : scope;

  // Local numbering for this abbreviated preview only — the full numbered
  // document (with Parties & Purpose as its own section) renders on the
  // Document view page.
  let n = 1;
  const scopeNumber = n++;
  const clauseNumbers = clauseSections.map(() => n++);
  const paymentNumber = n++;
  const acceptanceNumber = n++;

  return (
    <aside className="flex min-w-0 flex-[1_1_54%] flex-col items-center overflow-y-auto border-l border-line-faint bg-well p-10">
      <div className="w-full max-w-[520px]">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.08em] text-fg-muted">
            Live preview · ~{pagination.pageCount} page{pagination.pageCount === 1 ? "" : "s"} (A4)
          </span>
          <span
            className={`inline-flex items-center gap-[7px] rounded-full px-[11px] py-1 text-xs font-medium ${
              generated ? "bg-status-signed-bg text-status-signed" : "bg-status-draft-bg text-status-draft"
            }`}
          >
            <span
              className={`h-[5px] w-[5px] rounded-full ${generated ? "bg-status-signed" : "bg-status-draft"}`}
            />
            {generated ? "Generated" : "Draft"}
          </span>
        </div>

        <div
          ref={paperRef}
          className="relative min-h-[600px] rounded-xl bg-paper px-[46px] py-11 text-[13px] leading-[1.6] text-paper-ink shadow-[0_30px_70px_rgba(0,0,0,0.55)]"
        >
          <PageBreakLines pageHeight={pagination.pageHeight} pageCount={pagination.pageCount} />

          <PaperHeader
            docTypeLabel={DOC_TYPE_META[docType].label}
            projectName={projectName}
            clientName={clientName}
            timelineLabel={formatTimelineLabel(startDate, deliveryDate)}
            dateLabel={today}
          />

          <div className="mb-[26px]">
            <div className="mb-2.5 font-display text-xs font-semibold uppercase tracking-[0.04em] text-[#14151a]">
              {scopeNumber} · Scope of work
            </div>
            {scopeBody.trim() ? (
              <p className="whitespace-pre-wrap leading-[1.65] text-paper-body">{scopeBody}</p>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="h-[9px] w-full rounded-[3px] bg-[#ece9e1]" />
                <div className="h-[9px] w-[94%] rounded-[3px] bg-[#ece9e1]" />
                <div className="h-[9px] w-[78%] rounded-[3px] bg-[#ece9e1]" />
              </div>
            )}
            {deliverables.trim() && (
              <div className="mt-3 text-[12.5px] text-paper-body">
                <span className="text-paper-muted">Key deliverables — </span>
                {deliverables}
              </div>
            )}
          </div>

          {clauseSections.map((section, i) => (
            <div key={section.title} className="mb-[26px]">
              <div className="mb-2.5 font-display text-xs font-semibold uppercase tracking-[0.04em] text-[#14151a]">
                {clauseNumbers[i]} · {section.title}
              </div>
              <p className="whitespace-pre-wrap leading-[1.65] text-paper-body">{section.body}</p>
            </div>
          ))}

          <PaymentScheduleBlock
            number={paymentNumber}
            milestones={previewMilestones}
            budget={budgetNum}
          />

          <div className="mt-[26px]">
            <div className="mb-2.5 font-display text-xs font-semibold uppercase tracking-[0.04em] text-[#14151a]">
              {acceptanceNumber} · {ACCEPTANCE_CLAUSE.title}
            </div>
            <p className="leading-[1.65] text-paper-body">{ACCEPTANCE_CLAUSE.body}</p>
          </div>

          <PaperFooter />
        </div>
      </div>
    </aside>
  );
}
