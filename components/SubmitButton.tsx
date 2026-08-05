"use client";

import { useFormStatus } from "react-dom";

function Spinner() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="animate-spin">
      <circle
        cx="7.5"
        cy="7.5"
        r="6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeOpacity="0.25"
      />
      <path
        d="M13.5 7.5a6 6 0 0 0-6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Must be a Client Component rendered inside the <form> it reports on —
 * useFormStatus only sees the nearest ancestor <form>'s pending state, so
 * this can't live in the same file/component as the form itself.
 */
export function SubmitButton({
  children,
  pendingText,
  className,
}: {
  children: React.ReactNode;
  pendingText: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? (
        <>
          <Spinner />
          {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
