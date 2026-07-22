export function ScopeStep({
  scope,
  deliverables,
  onScope,
  onDeliverables,
}: {
  scope: string;
  deliverables: string;
  onScope: (value: string) => void;
  onDeliverables: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-fg-label">Project scope</span>
        <textarea
          className="ms-field resize-y leading-[1.55]"
          rows={7}
          placeholder="Describe the work: pages, features, integrations, what's in and out of scope..."
          value={scope}
          onChange={(e) => onScope(e.target.value)}
        />
        <span className="mt-[7px] block text-xs text-fg-muted">
          Plain notes are fine — Milestoned turns them into clause-ready language.
        </span>
      </label>
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-fg-label">
          Key deliverables <span className="font-normal text-fg-muted">(optional)</span>
        </span>
        <input
          className="ms-field"
          type="text"
          placeholder="Design system, 6 templates, CMS, deploy"
          value={deliverables}
          onChange={(e) => onDeliverables(e.target.value)}
        />
      </label>
    </div>
  );
}
