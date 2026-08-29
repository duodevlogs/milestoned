/*
 * Thin HTTP layer: verify the session, fetch the document (ownership
 * enforced in the controller/service/repository chain), render it to a PDF
 * buffer with @react-pdf/renderer, and return it as a download. Rendering
 * happens fresh on every request — no stored/cached PDF (documents.pdf_url
 * stays unused) since generation is fast and this keeps the PDF always in
 * sync with the document's current content and status.
 */
import { authService } from "@/server/services/auth.service";
import { userService } from "@/server/services/user.service";
import { documentController } from "@/server/controllers/document.controller";
import { renderDocumentPdf, safePdfFilename } from "@/lib/pdf/renderDocumentPdf";
import { AppError, jsonError } from "@/server/errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authService.getUser();
    if (!user) {
      throw AppError.unauthorized();
    }

    const { id } = await params;
    const [document, profile] = await Promise.all([
      documentController.getForUser(user.id, id),
      userService.getProfile(user.id),
    ]);

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
