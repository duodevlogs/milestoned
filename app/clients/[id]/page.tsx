import { redirect } from "next/navigation";
import Link from "next/link";
import { authService } from "@/server/services/auth.service";
import { clientController } from "@/server/controllers/client.controller";
import { appSettingsService } from "@/server/services/app-settings.service";
import { DocumentRow } from "@/components/dashboard/DocumentRow";

export default async function ClientDetailPage({
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

  const result = await clientController.getWithDocuments(user.id, id).catch(() => null);
  if (!result) {
    redirect("/clients");
  }
  const { client, documents } = result;

  return (
    <div className="min-h-screen bg-navy text-fg">
      <header className="flex items-center gap-4 border-b border-line-faint px-8 py-4">
        <Link href="/clients" className="flex items-center gap-2 text-[13.5px] text-fg-tertiary">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M9.5 3L5 7.5L9.5 12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Clients
        </Link>
        <span className="h-[18px] w-px bg-line-input" />
        <span className="font-display text-[15px] font-semibold tracking-[-0.01em] text-fg-bright">
          {client.name}
        </span>
      </header>

      <main className="mx-auto max-w-[820px] px-6 py-14">
        <div className="mb-10 rounded-[14px] border border-line-soft bg-white/[0.015] p-6">
          <h1 className="mb-4 font-display text-xl font-semibold tracking-[-0.01em] text-fg-heading">
            {client.name}
          </h1>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-[11px] uppercase tracking-[0.06em] text-fg-muted">Email</div>
              <div className="text-sm text-fg-soft">{client.email || "—"}</div>
            </div>
            <div>
              <div className="mb-1 text-[11px] uppercase tracking-[0.06em] text-fg-muted">Company</div>
              <div className="text-sm text-fg-soft">{client.company || "—"}</div>
            </div>
            {client.notes && (
              <div className="sm:col-span-2">
                <div className="mb-1 text-[11px] uppercase tracking-[0.06em] text-fg-muted">Notes</div>
                <div className="text-sm text-fg-soft">{client.notes}</div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-3.5 flex items-center justify-between">
          <span className="font-display text-[15px] font-semibold text-fg">Documents</span>
          <span className="text-[13px] text-fg-muted">{documents.length} total</span>
        </div>

        <div className="overflow-hidden rounded-[14px] border border-line-soft bg-white/[0.008]">
          {documents.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-fg-muted sm:px-[22px]">
              No documents generated for this client yet.
            </div>
          ) : (
            documents.map((doc) => <DocumentRow key={doc.id} doc={doc} />)
          )}
        </div>
      </main>
    </div>
  );
}
