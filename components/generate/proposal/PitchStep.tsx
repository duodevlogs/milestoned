export function PitchStep({
  problemNotes,
  approachNotes,
  whyUsNotes,
  onProblemNotes,
  onApproachNotes,
  onWhyUsNotes,
}: {
  problemNotes: string;
  approachNotes: string;
  whyUsNotes: string;
  onProblemNotes: (value: string) => void;
  onApproachNotes: (value: string) => void;
  onWhyUsNotes: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-fg-label">
          Client&apos;s problem, in your own words
        </span>
        <textarea
          className="ms-field"
          rows={4}
          placeholder="What you heard on the discovery call — their situation, pain points, what they're trying to achieve."
          value={problemNotes}
          onChange={(e) => onProblemNotes(e.target.value)}
        />
        <span className="mt-1.5 block text-[12px] text-fg-muted">
          Polished into the Executive Summary and Understanding Your Needs sections.
        </span>
      </label>
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-fg-label">Your approach</span>
        <textarea
          className="ms-field"
          rows={4}
          placeholder="How you'll solve it — rough notes are fine, e.g. phases, key decisions, what happens first."
          value={approachNotes}
          onChange={(e) => onApproachNotes(e.target.value)}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-fg-label">Why you</span>
        <textarea
          className="ms-field"
          rows={3}
          placeholder="Credibility, relevant experience, what makes you the right fit for this specifically."
          value={whyUsNotes}
          onChange={(e) => onWhyUsNotes(e.target.value)}
        />
      </label>
    </div>
  );
}
