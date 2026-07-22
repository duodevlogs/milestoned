export function ProjectDetailsStep({
  clientName,
  projectName,
  budget,
  onClientName,
  onProjectName,
  onBudget,
}: {
  clientName: string;
  projectName: string;
  budget: string;
  onClientName: (value: string) => void;
  onProjectName: (value: string) => void;
  onBudget: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
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
