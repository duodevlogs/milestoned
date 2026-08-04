/*
 * Thin HTTP layer: verify the session, fetch the document (ownership
 * enforced in the controller/service/repository chain), render it to a PDF
 * buffer with @react-pdf/renderer, and return it as a download. Rendering
 * happens fresh on every request — no stored/cached PDF (documents.pdf_url
 * stays unused) since generation is fast and this keeps the PDF always in
 * sync with the document's current content and status.
 */
import { renderToBuffer } from "@react-pdf/renderer";
import { authService } from "@/server/services/auth.service";
import { userService } from "@/server/services/user.service";
import { documentController } from "@/server/controllers/document.controller";
import { DocumentPdf } from "@/lib/pdf/DocumentPdf";
import { InvoicePdf } from "@/lib/pdf/InvoicePdf";
import { AppError, jsonError } from "@/server/errors";
import type { GeneratedDocumentContent } from "@/lib/document-generation";
import type { InvoiceContent } from "@/lib/invoice-generation";

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

    const buffer = await renderToBuffer(
      document.docType === "invoice" ? (
        <InvoicePdf
          content={document.content as InvoiceContent}
          businessName={profile?.businessName}
          logoUrl={profile?.logoUrl}
        />
      ) : (
        <DocumentPdf
          content={document.content as GeneratedDocumentContent}
          generatedAt={document.createdAt.toISOString()}
          businessName={profile?.businessName}
          logoUrl={profile?.logoUrl}
        />
      )
    );

    const safeName = document.projectName.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "document";

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
