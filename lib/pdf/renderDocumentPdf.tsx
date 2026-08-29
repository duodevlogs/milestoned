import "server-only";

import { renderToBuffer } from "@react-pdf/renderer";
import { DocumentPdf } from "@/lib/pdf/DocumentPdf";
import { InvoicePdf } from "@/lib/pdf/InvoicePdf";
import { ProposalPdf } from "@/lib/pdf/ProposalPdf";
import { SowPdf } from "@/lib/pdf/SowPdf";
import type { GeneratedDocumentContent } from "@/lib/document-generation";
import type { InvoiceContent } from "@/lib/invoice-generation";
import type { ProposalContent } from "@/lib/proposal-generation";
import type { SowContent } from "@/lib/sow-generation";
import type { Document } from "@/server/db/schema";

/**
 * Shared by the authenticated provider-side PDF route and the Client
 * Portal's own PDF route — same docType→renderer branch, used from two
 * different trust boundaries (a Milestoned user session vs. an OTP-verified
 * portal session), so it's factored out rather than duplicated.
 */
export async function renderDocumentPdf(
  document: Document,
  profile: { businessName?: string | null; logoUrl?: string | null } | null
): Promise<Buffer> {
  return renderToBuffer(
    document.docType === "invoice" ? (
      <InvoicePdf
        content={document.content as InvoiceContent}
        businessName={profile?.businessName}
        logoUrl={profile?.logoUrl}
      />
    ) : document.docType === "proposal" ? (
      <ProposalPdf
        content={document.content as ProposalContent}
        businessName={profile?.businessName}
        logoUrl={profile?.logoUrl}
      />
    ) : document.docType === "sow" ? (
      <SowPdf
        content={document.content as SowContent}
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
}

/** Filesystem-safe download filename from a document's project name. */
export function safePdfFilename(projectName: string): string {
  return projectName.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "document";
}
