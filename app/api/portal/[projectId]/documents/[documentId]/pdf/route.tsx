/*
 * Client Portal's own PDF route — authorized by the OTP-verified portal
 * session cookie, NOT Supabase auth. Only ever serves a document that is
 * both in this exact project AND explicitly shared (enforced in
 * documentRepository.getSharedByIdAndProjectId) — a draft or a document
 * belonging to a different project can never be reached through this route,
 * regardless of what documentId is guessed.
 */
import { portalSessionService } from "@/server/services/portal-session.service";
import { portalViewService } from "@/server/services/portal-view.service";
import { userService } from "@/server/services/user.service";
import { renderDocumentPdf, safePdfFilename } from "@/lib/pdf/renderDocumentPdf";
import { jsonError } from "@/server/errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; documentId: string }> }
) {
  try {
    const { projectId, documentId } = await params;
    const session = await portalSessionService.requireSession(projectId);

    const document = await portalViewService.getSharedDocument(projectId, session.email, documentId);
    // Branding belongs to the document's owner (the provider), not the
    // client viewing it — same profile the authenticated PDF route reads.
    const profile = await userService.getProfile(document.userId);

    const buffer = await renderDocumentPdf(document, profile);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safePdfFilename(document.projectName)}.pdf"`,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
