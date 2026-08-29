import { inviteClient, revokeClient } from "@/app/projects/[id]/actions";
import type { PortalAccess } from "@/server/db/schema";

export function ClientPortalSection({
  projectId,
  portalUrl,
  invited,
}: {
  projectId: string;
  portalUrl: string;
  invited: PortalAccess[];
}) {
  const active = invited.filter((i) => !i.revokedAt);

  return (
    <div className="mb-10 rounded-[14px] border border-line-soft bg-white/[0.015] p-6">
      <h2 className="mb-1 font-display text-lg font-semibold tracking-[-0.01em] text-fg-heading">
        Client Portal
      </h2>
      <p className="mb-4 text-[13px] leading-[1.5] text-fg-tertiary">
        Send your client this link, then invite their email below — they verify with a one-time
        code sent to that address, and see only the documents you&apos;ve marked
        &ldquo;Shared&rdquo;.
      </p>

      <label className="mb-5 block">
        <span className="mb-2 block text-[13px] font-medium text-fg-label">Portal link</span>
        <input
          className="ms-field font-mono text-[12.5px]"
          type="text"
          readOnly
          value={portalUrl}
          onFocus={(e) => e.target.select()}
        />
      </label>

      <form action={inviteClient} className="mb-5 flex flex-wrap items-end gap-3">
        <input type="hidden" name="projectId" value={projectId} />
        <label className="block flex-1" style={{ minWidth: 220 }}>
          <span className="mb-2 block text-[13px] font-medium text-fg-label">Client email</span>
          <input
            className="ms-field"
            type="email"
            name="email"
            required
            placeholder="client@example.com"
          />
        </label>
        <button
          type="submit"
          className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] border-none bg-gold px-[18px] py-[11px] font-display text-sm font-semibold text-gold-contrast shadow-[0_1px_0_rgba(255,255,255,0.15)_inset]"
        >
          Invite
        </button>
      </form>

      {active.length === 0 ? (
        <div className="rounded-[10px] border border-line-soft bg-white/[0.008] px-4 py-6 text-center text-[13px] text-fg-muted">
          No one invited yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-[10px] border border-line-soft">
          {active.map((access) => (
            <div
              key={access.id}
              className="flex items-center justify-between gap-3 border-b border-line-faint bg-white/[0.008] px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <div className="truncate text-[13.5px] font-medium text-fg">{access.email}</div>
                <div className="text-[12px] text-fg-muted">
                  {access.lastVerifiedAt ? "Verified — has viewed the portal" : "Invited, not yet viewed"}
                </div>
              </div>
              <form action={revokeClient}>
                <input type="hidden" name="projectId" value={projectId} />
                <input type="hidden" name="email" value={access.email} />
                <button
                  type="submit"
                  className="shrink-0 cursor-pointer rounded-[8px] border border-line-strong px-3 py-1.5 text-[12.5px] font-medium text-fg-soft transition-colors hover:border-danger/40 hover:text-danger"
                >
                  Revoke
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
