import type { ClientWithDocumentCount } from "@/server/services/client.service";

export function ProjectDetailsStep({
  clientName,
  clientId,
  clients,
  projectName,
  budget,
  onClientName,
  onSelectClient,
  onProjectName,
  onBudget,
}: {
  clientName: string;
  clientId: string | null;
  clients: ClientWithDocumentCount[];
  projectName: string;
  budget: string;
  onClientName: (value: string) => void;
  onSelectClient: (client: { id: string; name: string } | null) => void;
  onProjectName: (value: string) => void;
  onBudget: (value: string) => void;
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
        <span className="mb-2 block text-[13px] font-medium text-fg-label">
          Total project value (USD)
        </span>
        <div className="relative">
          <span className="pointer-events-none absolute left-[13px] top-1/2 -translate-y-1/2 text-[14.5px] text-fg-tertiary">
            $
          </span>
          <input
            className="ms-field ms-num pl-[26px]"
            type="number"
            min="0"
            step="100"
            placeholder="9,000"
            value={budget}
            onChange={(e) => onBudget(e.target.value)}
          />
        </div>
      </label>
    </div>
  );
}
