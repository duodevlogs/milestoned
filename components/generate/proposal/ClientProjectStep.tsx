import type { ClientWithDocumentCount } from "@/server/services/client.service";

export function ClientProjectStep({
  clientName,
  clientId,
  clients,
  clientCompany,
  projectName,
  onClientName,
  onSelectClient,
  onClientCompany,
  onProjectName,
}: {
  clientName: string;
  clientId: string | null;
  clients: ClientWithDocumentCount[];
  clientCompany: string;
  projectName: string;
  onClientName: (value: string) => void;
  onSelectClient: (client: { id: string; name: string } | null) => void;
  onClientCompany: (value: string) => void;
  onProjectName: (value: string) => void;
}) {
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
    </div>
  );
}
