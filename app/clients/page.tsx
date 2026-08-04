import { redirect } from "next/navigation";
import Link from "next/link";
import { authService } from "@/server/services/auth.service";
import { clientController } from "@/server/controllers/client.controller";
import { appSettingsService } from "@/server/services/app-settings.service";
import { createClient } from "./actions";

export default async function ClientsPage({
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
  const error = typeof params.error === "string" ? params.error : null;

  const clients = await clientController.listForUser(user.id);

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
          Clients
        </span>
      </header>

      <main className="mx-auto max-w-[820px] px-6 py-14">
        {error && (
          <div className="mb-8 rounded-[11px] border border-line-strong bg-white/[0.02] px-4 py-3.5 text-sm leading-[1.5] text-fg-soft">
            {error}
          </div>
        )}

        <div className="mb-10 rounded-[14px] border border-line-soft bg-white/[0.015] p-6">
          <h2 className="mb-4 font-display text-lg font-semibold tracking-[-0.01em] text-fg-heading">
            New client
          </h2>
          <form action={createClient} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-[13px] font-medium text-fg-label">Name</span>
              <input className="ms-field" type="text" name="name" required placeholder="Northwind Studio" />
            </label>
            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-fg-label">Email</span>
              <input className="ms-field" type="email" name="email" placeholder="contact@northwind.dev" />
            </label>
            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-fg-label">Company</span>
              <input className="ms-field" type="text" name="company" placeholder="Northwind Studio Inc." />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-[13px] font-medium text-fg-label">Notes</span>
              <textarea className="ms-field min-h-[70px] resize-y" name="notes" placeholder="Optional" />
            </label>
            <button
              type="submit"
              className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-[10px] border-none bg-gold px-[18px] py-[11px] font-display text-sm font-semibold text-gold-contrast shadow-[0_1px_0_rgba(255,255,255,0.15)_inset] sm:col-span-2"
            >
              Add client
            </button>
          </form>
        </div>

        <div className="mb-3.5 flex items-center justify-between">
          <span className="font-display text-[15px] font-semibold text-fg">All clients</span>
          <span className="text-[13px] text-fg-muted">{clients.length} total</span>
        </div>

        <div className="overflow-hidden rounded-[14px] border border-line-soft bg-white/[0.008]">
          {clients.length === 0 ? (
            <div className="px-[22px] py-12 text-center text-sm text-fg-muted">
              No clients yet. Add your first one above.
            </div>
          ) : (
            clients.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="flex items-center justify-between gap-4 border-b border-line-faint px-[22px] py-4 transition-colors last:border-b-0 hover:bg-white/[0.025]"
              >
                <div className="min-w-0">
                  <div className="truncate text-[14.5px] font-medium text-fg">{client.name}</div>
                  <div className="truncate text-[12.5px] text-fg-muted">
                    {[client.company, client.email].filter(Boolean).join(" · ") || "No details yet"}
                  </div>
                </div>
                <span className="shrink-0 text-[13px] text-fg-tertiary">
                  {client.documentCount} document{client.documentCount === 1 ? "" : "s"}
                </span>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
