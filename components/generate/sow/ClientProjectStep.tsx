import type { ClientWithDocumentCount } from "@/server/services/client.service";
import type { LinkableRefSummary } from "@/server/services/document.service";

export function ClientProjectStep({
  clientName,
  clientId,
  clients,
  clientCompany,
  projectName,
  version,
  relatedProposalId,
  relatedContractId,
  linkableDocuments,
  onClientName,
  onSelectClient,
  onClientCompany,
  onProjectName,
  onVersion,
  onSelectRelatedProposal,
  onSelectRelatedContract,
}: {
  clientName: string;
  clientId: string | null;
  clients: ClientWithDocumentCount[];
  clientCompany: string;
  projectName: string;
  version: string;
  relatedProposalId: string | null;
  relatedContractId: string | null;
  linkableDocuments: LinkableRefSummary[];
  onClientName: (value: string) => void;
  onSelectClient: (client: { id: string; name: string } | null) => void;
  onClientCompany: (value: string) => void;
  onProjectName: (value: string) => void;
  onVersion: (value: string) => void;
  onSelectRelatedProposal: (documentId: string | null) => void;
  onSelectRelatedContract: (documentId: string | null) => void;
}) {
  const proposals = linkableDocuments.filter((d) => d.docType === "proposal");
  const contracts = linkableDocuments.filter((d) => d.docType === "contract");

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
      <div className="grid grid-cols-2 gap-3.5">
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
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-fg-label">Version</span>
          <input
            className="ms-field"
            type="text"
            placeholder="1.0"
            value={version}
            onChange={(e) => onVersion(e.target.value)}
          />
        </label>
      </div>

      <div className="border-t border-line-faint pt-4">
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-fg-label">
            Linked proposal (optional)
          </span>
          <select
            className="ms-field cursor-pointer"
            value={relatedProposalId ?? ""}
            onChange={(e) => onSelectRelatedProposal(e.target.value || null)}
          >
            <option value="">— Not tied to one —</option>
            {proposals.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.docNumber ? `${doc.docNumber} — ` : ""}
                {doc.projectName}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-3.5 block">
          <span className="mb-2 block text-[13px] font-medium text-fg-label">
            Linked contract (optional)
          </span>
          <select
            className="ms-field cursor-pointer"
            value={relatedContractId ?? ""}
            onChange={(e) => onSelectRelatedContract(e.target.value || null)}
          >
            <option value="">— Not tied to one —</option>
            {contracts.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.docNumber ? `${doc.docNumber} — ` : ""}
                {doc.projectName}
              </option>
            ))}
          </select>
          <span className="mt-1.5 block text-[12px] text-fg-muted">
            Referenced in this SOW&apos;s header and used to point the Governing Terms section back
            to the right contract.
          </span>
        </label>
      </div>
    </div>
  );
}
