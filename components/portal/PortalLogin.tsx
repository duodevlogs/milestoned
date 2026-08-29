"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";

interface ApiError {
  error?: { code?: string; message?: string };
}

export function PortalLogin({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleRequestCode(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/portal/${projectId}/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json: ApiError = await res.json();
      if (!res.ok) {
        setError(json.error?.message ?? "Something went wrong. Please try again.");
        return;
      }
      // Deliberately the same message whether or not this email is actually
      // invited — the portal never reveals invite status.
      setInfo("If that email has access to this project, a code was just sent to it.");
      setStep("code");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyCode(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/portal/${projectId}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const json: ApiError = await res.json();
      if (!res.ok) {
        setError(json.error?.message ?? "Something went wrong. Please try again.");
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-6 text-fg">
      <div className="w-full max-w-[380px] rounded-[14px] border border-line-soft bg-white/[0.015] p-7">
        <h1 className="mb-1.5 font-display text-lg font-semibold tracking-[-0.01em] text-fg-heading">
          Project access
        </h1>
        <p className="mb-6 text-[13.5px] leading-[1.5] text-fg-tertiary">
          {step === "email"
            ? "Enter the email your provider invited to view this project."
            : `Enter the 6-digit code sent to ${email}.`}
        </p>

        {error && <div className="mb-4 text-[13px] leading-normal text-danger">{error}</div>}
        {info && step === "code" && (
          <div className="mb-4 text-[13px] leading-normal text-fg-tertiary">{info}</div>
        )}

        {step === "email" ? (
          <form onSubmit={handleRequestCode} className="flex flex-col gap-4">
            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-fg-label">Email</span>
              <input
                className="ms-field"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border-none bg-gold px-[18px] py-[11px] font-display text-sm font-semibold text-gold-contrast shadow-[0_1px_0_rgba(255,255,255,0.15)_inset] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Sending…" : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-fg-label">Code</span>
              <input
                className="ms-field ms-num text-center tracking-[0.3em]"
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting || code.length !== 6}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border-none bg-gold px-[18px] py-[11px] font-display text-sm font-semibold text-gold-contrast shadow-[0_1px_0_rgba(255,255,255,0.15)_inset] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Verifying…" : "Verify"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
                setInfo(null);
              }}
              className="cursor-pointer text-center text-[13px] font-medium text-fg-muted"
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
