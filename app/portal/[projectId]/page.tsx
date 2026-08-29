/*
 * Public route — no Supabase auth, no proxy.ts protection. Authorization is
 * entirely the OTP-verified portal session cookie, checked fresh on every
 * load (including that the invite hasn't since been revoked), not just a
 * one-time check at login.
 */
import { portalSessionService } from "@/server/services/portal-session.service";
import { portalViewService } from "@/server/services/portal-view.service";
import { PortalLogin } from "@/components/portal/PortalLogin";
import { PortalView } from "@/components/portal/PortalView";

export default async function PortalPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const session = await portalSessionService.getSession();
  if (!session || session.projectId !== projectId) {
    return <PortalLogin projectId={projectId} />;
  }

  const result = await portalViewService.getProjectView(projectId, session.email).catch(() => null);
  if (!result) {
    // Revoked since the session was issued, or the project no longer
    // exists — same treatment either way: back to the login screen.
    return <PortalLogin projectId={projectId} />;
  }

  return <PortalView projectId={projectId} project={result.project} documents={result.documents} />;
}
