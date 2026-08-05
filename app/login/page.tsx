import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";
import { SubmitButton } from "@/components/SubmitButton";
import { signIn, signUp } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const mode = params.mode === "signup" ? "signup" : "signin";
  const error = typeof params.error === "string" ? params.error : null;
  const sent = params.sent === "1";
  const next = typeof params.next === "string" ? params.next : "/dashboard";

  const action = mode === "signup" ? signUp : signIn;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy px-5 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.022)_1px,transparent_1px)] bg-[size:26px_26px]" />

      <div className="relative w-full max-w-[400px]">
        <Link href="/" className="mb-8 flex items-center justify-center gap-[11px]">
          <LogoMark />
          <span className="font-display text-lg font-semibold tracking-[-0.01em] text-fg-bright">
            Milestoned
          </span>
        </Link>

        <div className="rounded-2xl border border-line-soft bg-panel p-[30px] pt-8 shadow-[0_30px_70px_rgba(0,0,0,0.5)]">
          <h1 className="mb-1.5 font-display text-[21px] font-semibold tracking-[-0.015em] text-fg-heading">
            {mode === "signup" ? "Create your account" : "Sign in"}
          </h1>
          <p className="mb-6 text-sm leading-normal text-fg-tertiary">
            {mode === "signup"
              ? "Your documents and credits live here."
              : "Welcome back."}
          </p>

          {sent ? (
            <div className="rounded-[10px] border border-gold-border bg-gold-soft px-4 py-3.5 text-sm leading-[1.55] text-fg-label">
              Check your inbox. We sent a confirmation link — open it to finish
              creating your account.
            </div>
          ) : (
            <form action={action} className="flex flex-col gap-4">
              <input type="hidden" name="next" value={next} />
              <label className="block">
                <span className="mb-2 block text-[13px] font-medium text-fg-label">
                  Email
                </span>
                <input
                  className="ms-field"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="you@studio.dev"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[13px] font-medium text-fg-label">
                  Password
                </span>
                <input
                  className="ms-field"
                  type="password"
                  name="password"
                  required
                  minLength={mode === "signup" ? 8 : undefined}
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  placeholder={
                    mode === "signup" ? "At least 8 characters" : "Your password"
                  }
                />
              </label>

              {error && (
                <div className="text-[13.5px] leading-normal text-danger">
                  {error}
                </div>
              )}

              <SubmitButton
                pendingText={mode === "signup" ? "Creating account…" : "Signing in…"}
                className="mt-1 inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-[10px] border-none bg-gold px-[22px] py-3 font-display text-[15px] font-semibold text-gold-contrast shadow-[0_1px_0_rgba(255,255,255,0.15)_inset] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {mode === "signup" ? "Create account" : "Sign in"}
              </SubmitButton>
            </form>
          )}
        </div>

        <p className="mt-5 text-center text-[13.5px] text-fg-muted">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <Link href={`/login?next=${encodeURIComponent(next)}`}>
                Sign in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link href={`/login?mode=signup&next=${encodeURIComponent(next)}`}>
                Create an account
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
