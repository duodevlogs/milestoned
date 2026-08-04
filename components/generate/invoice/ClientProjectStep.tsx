import type { ClientWithDocumentCount } from "@/server/services/client.service";
import type { LinkableDocumentSummary } from "@/server/services/document.service";
import { DOC_TYPE_META } from "@/lib/document-display";

export function ClientProjectStep({
  clientName,
  clientId,
  clients,
  clientCompany,
  clientBillingAddress,
  projectName,
  relatedDocumentId,
  linkableDocuments,
  onClientName,
  onSelectClient,
  onClientCompany,
  onClientBillingAddress,
  onProjectName,
  onSelectRelatedDocument,
  onAddMilestoneAsLineItem,
}: {
  clientName: string;
  clientId: string | null;
  clients: ClientWithDocumentCount[];
  clientCompany: string;
  clientBillingAddress: string;
  projectName: string;
  relatedDocumentId: string | null;
  linkableDocuments: LinkableDocumentSummary[];
  onClientName: (value: string) => void;
  onSelectClient: (client: { id: string; name: string } | null) => void;
  onClientCompany: (value: string) => void;
  onClientBillingAddress: (value: string) => void;
  onProjectName: (value: string) => void;
  onSelectRelatedDocument: (documentId: string | null) => void;
  onAddMilestoneAsLineItem: (milestone: {
    label: string;
    amount: number;
    index: number;
    total: number;
  }) => void;
}) {
  const relatedDocument = linkableDocuments.find((d) => d.id === relatedDocumentId) ?? null;

  return (
    <div className="flex flex-col gap-5">
      {clients.length > 0 && (
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-fg-label">
            Saved client (optional)
          </span>
          <select
            className="ms-field cursor-pointer"
            value={clientId ?? ""}
            onChange={(e) => {
              const picked = clients.find((c) => c.id === e.target.value);
              onSelectClient(picked ? { id: picked.id, name: picked.name } : null);
            }}
          >
            <option value="">— Type a new client below —</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-fg-label">Client name</span>
        <input
          className="ms-field"
          type="text"
          placeholder="e.g. Northwind Studio"
          value={clientName}
          onChange={(e) => onClientName(e.target.value)}
        />
      </label>
      <div className="grid grid-cols-2 gap-3.5">
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-fg-label">
            Client company (optional)
          </span>
          <input
            className="ms-field"
            type="text"
            placeholder="e.g. Northwind Studio GmbH"
            value={clientCompany}
            onChange={(e) => onClientCompany(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-fg-label">
            Client billing address
          </span>
          <input
            className="ms-field"
            type="text"
            placeholder="e.g. 12 High St, London"
            value={clientBillingAddress}
            onChange={(e) => onClientBillingAddress(e.target.value)}
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-fg-label">Project name</span>
        <input
          className="ms-field"
          type="text"
          placeholder="e.g. Marketing site redesign"
          value={projectName}
          onChange={(e) => onProjectName(e.target.value)}
        />
      </label>

      <div className="border-t border-line-faint pt-4">
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-fg-label">
            Bill against an existing SOW or Contract (optional)
          </span>
          <select
            className="ms-field cursor-pointer"
            value={relatedDocumentId ?? ""}
            onChange={(e) => onSelectRelatedDocument(e.target.value || null)}
          >
            <option value="">— Not tied to one —</option>
            {linkableDocuments.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.docNumber ? `${doc.docNumber} — ` : ""}
                {doc.projectName} ({DOC_TYPE_META[doc.docType].label})
              </option>
            ))}
          </select>
          <span className="mt-1.5 block text-[12px] text-fg-muted">
            Traces this invoice back to the agreement, and lets you bill a milestone directly from
            its payment schedule.
          </span>
        </label>

        {relatedDocument && relatedDocument.milestones.length > 0 && (
          <div className="mt-3 flex flex-col gap-[7px]">
            {relatedDocument.milestones.map((m, i) => (
              <button
                key={i}
                type="button"
                onClick={() =>
                  onAddMilestoneAsLineItem({
                    label: m.label,
                    amount: m.amount,
                    index: i + 1,
                    total: relatedDocument.milestones.length,
                  })
                }
                className="flex cursor-pointer items-center justify-between rounded-[10px] border border-line-input bg-white/[0.01] px-3.5 py-2.5 text-left transition-colors hover:border-gold/40"
              >
                <span className="text-[13px] text-fg-soft">
                  Milestone {i + 1} of {relatedDocument.milestones.length} — {m.label}
                </span>
                <span className="text-[13px] font-medium text-fg-bright">
                  ${m.amount.toLocaleString("en-US")}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
