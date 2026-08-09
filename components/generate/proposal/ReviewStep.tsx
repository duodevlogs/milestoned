export function ReviewStep({
  scopeOverview,
  timelineOverview,
  assumptionsExclusions,
  nextSteps,
  includeAcceptanceSignature,
  onScopeOverview,
  onTimelineOverview,
  onAssumptionsExclusions,
  onNextSteps,
  onToggleAcceptanceSignature,
}: {
  scopeOverview: string;
  timelineOverview: string;
  assumptionsExclusions: string;
  nextSteps: string;
  includeAcceptanceSignature: boolean;
  onScopeOverview: (value: string) => void;
  onTimelineOverview: (value: string) => void;
  onAssumptionsExclusions: (value: string) => void;
  onNextSteps: (value: string) => void;
  onToggleAcceptanceSignature: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-fg-label">Scope overview</span>
        <textarea
          className="ms-field"
          rows={3}
          placeholder="High-level, not itemized — the SOW covers the detail once this is accepted."
          value={scopeOverview}
          onChange={(e) => onScopeOverview(e.target.value)}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-fg-label">Timeline overview</span>
        <textarea
          className="ms-field"
          rows={3}
          placeholder="e.g. Phase 1: Discovery (Week 1-2), Phase 2: Design (Week 3-5)..."
          value={timelineOverview}
          onChange={(e) => onTimelineOverview(e.target.value)}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-fg-label">
          Assumptions &amp; exclusions (optional)
        </span>
        <textarea
          className="ms-field"
          rows={3}
          placeholder="What's expected from the client, what's not included."
          value={assumptionsExclusions}
          onChange={(e) => onAssumptionsExclusions(e.target.value)}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-fg-label">
          Next steps (optional)
        </span>
        <textarea
          className="ms-field"
          rows={2}
          placeholder="What happens if they say yes. Leave blank for a sensible default."
          value={nextSteps}
          onChange={(e) => onNextSteps(e.target.value)}
        />
      </label>
      <label className="flex cursor-pointer items-center gap-2.5 border-t border-line-faint pt-5">
        <input
          type="checkbox"
          className="h-4 w-4 cursor-pointer accent-gold"
          checked={includeAcceptanceSignature}
          onChange={onToggleAcceptanceSignature}
        />
        <span className="text-[13px] text-fg-soft">
          Include an informal acceptance signature block
        </span>
      </label>
    </div>
  );
}
