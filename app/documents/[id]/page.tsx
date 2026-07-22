import { redirect } from "next/navigation";
import { authService } from "@/server/services/auth.service";
import { documentService } from "@/server/services/document.service";
import { DocumentView } from "@/components/document/DocumentView";
import type { GeneratedDocumentContent } from "@/lib/document-generation";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await authService.getUser();
  if (!user) {
    redirect("/login");
  }

  // Ownership + existence are both enforced inside getForUser; any failure
  // here (not found, not owned, malformed id) lands the user back on their
  // own document list rather than leaking which case it was.
  const document = await documentService.getForUser(user.id, id).catch(() => null);
  if (!document) {
    redirect("/dashboard");
  }

  return (
    <DocumentView
      documentId={document.id}
      status={document.status}
      content={document.content as GeneratedDocumentContent}
    />
  );
}
