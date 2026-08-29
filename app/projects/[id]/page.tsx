import { redirect } from "next/navigation";
import Link from "next/link";
import { authService } from "@/server/services/auth.service";
import { projectController } from "@/server/controllers/project.controller";
import { portalManagementController } from "@/server/controllers/portal-management.controller";
import { appSettingsService } from "@/server/services/app-settings.service";
import { ProjectDocumentRow } from "@/components/projects/ProjectDocumentRow";
import { ClientPortalSection } from "@/components/projects/ClientPortalSection";
import { DOC_TYPE_META } from "@/lib/document-display";

// Proposal → Contract → SOW → Invoice — the natural order an engagement
// actually happens in, not creation-time order (which is already covered
// by DocumentRow's own within-type recency).
const DOC_TYPE_ORDER: Record<string, number> = { proposal: 0, contract: 1, sow: 2, invoice: 3 };

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await authService.getUser();
  if (!user) {
    redirect("/login");
  }
  if (await appSettingsService.isPrelaunch()) {
    redirect("/welcome");
  }

  const result = await projectController.getWithDocuments(user.id, id).catch(() => null);
  if (!result) {
    redirect("/projects");
  }
  const { project, documents } = result;
  const sortedDocuments = [...documents].sort(
    (a, b) => DOC_TYPE_ORDER[a.docType] - DOC_TYPE_ORDER[b.docType]
  );

  const invitedClients = await portalManagementController.listInvitedClients(user.id, id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const portalUrl = `${siteUrl}/portal/${id}`;

  return (
    <div className="min-h-screen bg-navy text-fg">
      <header className="flex items-center gap-4 border-b border-line-faint px-8 py-4">
        <Link href="/projects" className="flex items-center gap-2 text-[13.5px] text-fg-tertiary">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M9.5 3L5 7.5L9.5 12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Projects
        </Link>
        <span className="h-[18px] w-px bg-line-input" />
        <span className="font-display text-[15px] font-semibold tracking-[-0.01em] text-fg-bright">
          {project.name}
        </span>
      </header>

      <main className="mx-auto max-w-[820px] px-6 py-14">
        <div className="mb-10 rounded-[14px] border border-line-soft bg-white/[0.015] p-6">
          <h1 className="mb-4 font-display text-xl font-semibold tracking-[-0.01em] text-fg-heading">
            {project.name}
          </h1>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-[11px] uppercase tracking-[0.06em] text-fg-muted">Client</div>
              <div className="text-sm text-fg-soft">{project.clientName}</div>
            </div>
            <div>
              <div className="mb-1 text-[11px] uppercase tracking-[0.06em] text-fg-muted">
                Document types
              </div>
              <div className="text-sm text-fg-soft">
                {sortedDocuments.length === 0
                  ? "—"
                  : [...new Set(sortedDocuments.map((d) => DOC_TYPE_META[d.docType].label))].join(
                      " → "
                    )}
              </div>
            </div>
          </div>
        </div>

        <ClientPortalSection projectId={id} portalUrl={portalUrl} invited={invitedClients} />

        <div className="mb-3.5 flex items-center justify-between">
          <span className="font-display text-[15px] font-semibold text-fg">Documents</span>
          <span className="text-[13px] text-fg-muted">{sortedDocuments.length} total</span>
        </div>

        <div className="overflow-hidden rounded-[14px] border border-line-soft bg-white/[0.008]">
          {sortedDocuments.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-fg-muted sm:px-[22px]">
              No documents in this project yet.
            </div>
          ) : (
            sortedDocuments.map((doc) => (
              <ProjectDocumentRow key={doc.id} doc={doc} projectId={id} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
