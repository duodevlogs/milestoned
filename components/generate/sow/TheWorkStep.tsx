export function TheWorkStep({
  overviewNotes,
  scopeNotes,
  outOfScope,
  onOverviewNotes,
  onScopeNotes,
  onOutOfScope,
}: {
  overviewNotes: string;
  scopeNotes: string;
  outOfScope: string;
  onOverviewNotes: (value: string) => void;
  onScopeNotes: (value: string) => void;
  onOutOfScope: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-fg-label">
          What&apos;s being built, and why
        </span>
        <textarea
          className="ms-field"
          rows={4}
          placeholder="Rough notes are fine — how this ties to the proposal/contract, what the project is for."
          value={overviewNotes}
          onChange={(e) => onOverviewNotes(e.target.value)}
        />
        <span className="mt-1.5 block text-[12px] text-fg-muted">
          Polished into the Purpose and Project Overview sections.
        </span>
      </label>
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-fg-label">Scope notes</span>
        <textarea
          className="ms-field"
          rows={5}
          placeholder="What's included, itemized — design/dev/features broken out."
          value={scopeNotes}
          onChange={(e) => onScopeNotes(e.target.value)}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-fg-label">
          Out of scope (optional)
        </span>
        <textarea
          className="ms-field"
          rows={3}
          placeholder="Explicit exclusions, so nothing is assumed. Written exactly as you type it — not rewritten by AI."
          value={outOfScope}
          onChange={(e) => onOutOfScope(e.target.value)}
        />
      </label>
    </div>
  );
}
