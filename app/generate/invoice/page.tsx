import { redirect } from "next/navigation";
import { authService } from "@/server/services/auth.service";
import { clientController } from "@/server/controllers/client.controller";
import { documentService } from "@/server/services/document.service";
import { appSettingsService } from "@/server/services/app-settings.service";
import { InvoiceFlow } from "@/components/generate/invoice/InvoiceFlow";
import { userService } from "@/server/services/user.service";
import { getSuggestedTaxRate } from "@/lib/tax-rates";
import { invoiceToFormValues } from "@/lib/invoice-edit";
import { formatPaymentMethod } from "@/lib/payment-methods";
import type { InvoiceContent } from "@/lib/invoice-generation";

export default async function GenerateInvoicePage({
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
  const editId = typeof params.edit === "string" ? params.edit : null;

  const [profile, clients, linkableDocuments, editDoc] = await Promise.all([
    userService.getProfile(user.id),
    clientController.listForUser(user.id),
    documentService.listLinkableForInvoice(user.id),
    editId ? documentService.getForUser(user.id, editId).catch(() => null) : null,
  ]);

  // Only the caller's own invoice can be edited; anything else (stale link,
  // wrong type, someone else's id) just opens a blank new invoice.
  const initialEdit =
    editDoc && editDoc.docType === "invoice"
      ? {
          documentId: editDoc.id,
          docNumber: editDoc.docNumber,
          values: invoiceToFormValues(
            editDoc.content as InvoiceContent,
            editDoc,
            (profile?.paymentMethods ?? []).map((m) => m.id)
          ),
        }
      : null;

  return (
    <InvoiceFlow
      initialCredits={profile?.creditsRemaining ?? 0}
      clients={clients}
      linkableDocuments={linkableDocuments}
      defaultTaxRatePct={getSuggestedTaxRate(profile?.country)}
      initialEdit={initialEdit}
      paymentMethods={(profile?.paymentMethods ?? []).map((m) => ({
        id: m.id,
        isDefault: m.isDefault,
        ...formatPaymentMethod(m),
      }))}
    />
  );
}
