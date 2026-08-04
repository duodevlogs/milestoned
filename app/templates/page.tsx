import { redirect } from "next/navigation";
import Link from "next/link";
import { authService } from "@/server/services/auth.service";
import { templateController } from "@/server/controllers/template.controller";
import { clauseBundleController } from "@/server/controllers/clause-bundle.controller";
import { appSettingsService } from "@/server/services/app-settings.service";
import { DOC_TYPE_META } from "@/lib/document-display";
import { summarizeClauseSelection, type ClauseSelection } from "@/lib/contract-clauses";
import { DeleteButton } from "@/components/templates/DeleteButton";
import type { Template, ClauseBundle } from "@/server/db/schema";

const PREVIEW_COUNT = 4;

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await authService.getUser();
  if (!user) {
    redirect("/login");
  }
  if (await appSettingsService.isPrelaunch()) {
    redirect("/welcome");
  }

  const params = await searchParams;
  const view = typeof params.view === "string" ? params.view : null;

  const [allTemplates, allBundles] = await Promise.all([
    templateController.listForUser(user.id),
    clauseBundleController.listForUser(user.id),
  ]);

  const presets = allTemplates.filter((t) => !t.sourceDocumentId);
  const cloned = allTemplates.filter((t) => t.sourceDocumentId);

  return (
    <div className="min-h-screen bg-navy text-fg">
      <header className="flex items-center gap-4 border-b border-line-faint px-8 py-4">
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
          Templates
        </span>
      </header>

      <main className="mx-auto max-w-[820px] px-6 py-14">
        {view ? (
          <FullList view={view} presets={presets} cloned={cloned} bundles={allBundles} />
        ) : (
          <>
            <TemplateSection
              title="Project Presets"
              description="Scope, deliverables, and clauses saved from the generate wizard."
              items={presets}
              viewParam="presets"
              emptyText='No presets yet. Save one from the "Clauses" step when generating a document.'
            />
            <TemplateSection
              title="Cloned Documents"
              description="Presets created by saving an existing document as a template."
              items={cloned}
              viewParam="cloned"
              emptyText='No cloned templates yet. Use "Save as template" on any document.'
            />
            <BundleSection bundles={allBundles} viewParam="bundles" capped />
          </>
        )}
      </main>
    </div>
  );
}

function FullList({
  view,
  presets,
  cloned,
  bundles,
}: {
  view: string;
  presets: Template[];
  cloned: Template[];
  bundles: ClauseBundle[];
}) {
  if (view === "presets") {
    return (
      <TemplateSection
        title="Project Presets"
        description="Scope, deliverables, and clauses saved from the generate wizard."
        items={presets}
        viewParam="presets"
        emptyText='No presets yet. Save one from the "Clauses" step when generating a document.'
      />
    );
  }
  if (view === "cloned") {
    return (
      <TemplateSection
        title="Cloned Documents"
        description="Presets created by saving an existing document as a template."
        items={cloned}
        viewParam="cloned"
        emptyText='No cloned templates yet. Use "Save as template" on any document.'
      />
    );
  }
  return <BundleSection bundles={bundles} viewParam="bundles" capped={false} />;
}

function SectionHeader({
  title,
  description,
  seeAllHref,
}: {
  title: string;
  description: string;
  seeAllHref?: string;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="font-display text-lg font-semibold tracking-[-0.01em] text-fg-heading">
          {title}
        </h2>
        <p className="text-[13.5px] text-fg-tertiary">{description}</p>
      </div>
      {seeAllHref && (
        <Link
          href={seeAllHref}
          className="shrink-0 whitespace-nowrap text-[13px] font-medium text-gold"
        >
          See all →
        </Link>
      )}
    </div>
  );
}

function TemplateSection({
  title,
  description,
  items,
  viewParam,
  emptyText,
}: {
  title: string;
  description: string;
  items: Template[];
  viewParam: string;
  emptyText: string;
}) {
  const shown = items.slice(0, PREVIEW_COUNT);
  const hasMore = items.length > PREVIEW_COUNT;

  return (
    <section className="mb-12">
      <SectionHeader
        title={title}
        description={description}
        seeAllHref={hasMore ? `/templates?view=${viewParam}` : undefined}
      />
      <div className="overflow-hidden rounded-[14px] border border-line-soft bg-white/[0.008]">
        {shown.length === 0 ? (
          <div className="px-[22px] py-10 text-center text-sm text-fg-muted">{emptyText}</div>
        ) : (
          shown.map((template) => {
            const meta = DOC_TYPE_META[template.docType];
            return (
              <div
                key={template.id}
                className="flex items-center justify-between gap-4 border-b border-line-faint px-[22px] py-4 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-[13px]">
                  <span
                    className={`flex h-[38px] w-8 shrink-0 items-center justify-center rounded-[5px] border font-display text-[9.5px] font-semibold tracking-[0.02em] ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}
                  >
                    {meta.abbr}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[14.5px] font-medium text-fg">{template.name}</div>
                    <div className="truncate text-[12.5px] text-fg-muted">{meta.label}</div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/generate?template=${template.id}`}
                    className="rounded-[8px] border border-line-strong px-3 py-1.5 text-[13px] font-medium text-fg-bright"
                  >
                    Use
                  </Link>
                  <DeleteButton href={`/api/templates/${template.id}`} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function BundleSection({
  bundles,
  viewParam,
  capped,
}: {
  bundles: ClauseBundle[];
  viewParam: string;
  capped: boolean;
}) {
  const shown = capped ? bundles.slice(0, PREVIEW_COUNT) : bundles;
  const hasMore = capped && bundles.length > PREVIEW_COUNT;

  return (
    <section className="mb-12">
      <SectionHeader
        title="Clause Bundles"
        description="Just a set of clauses, applied from the Clauses step — no scope or deliverables."
        seeAllHref={hasMore ? `/templates?view=${viewParam}` : undefined}
      />
      <div className="overflow-hidden rounded-[14px] border border-line-soft bg-white/[0.008]">
        {shown.length === 0 ? (
          <div className="px-[22px] py-10 text-center text-sm text-fg-muted">
            No clause bundles yet. Save one from the &quot;Clauses&quot; step when generating a document.
          </div>
        ) : (
          shown.map((bundle) => {
            const labels = summarizeClauseSelection(bundle.clauseSelection as ClauseSelection);
            return (
              <div
                key={bundle.id}
                className="flex items-center justify-between gap-4 border-b border-line-faint px-[22px] py-4 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="mb-1.5 truncate text-[14.5px] font-medium text-fg">{bundle.name}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {labels.length === 0 ? (
                      <span className="text-[12.5px] text-fg-muted">No clauses selected</span>
                    ) : (
                      labels.map((label) => (
                        <span
                          key={label}
                          className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[11px] text-fg-soft"
                        >
                          {label}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <DeleteButton href={`/api/clause-bundles/${bundle.id}`} />
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
