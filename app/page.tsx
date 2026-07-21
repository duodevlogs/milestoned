import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";

// Placeholder — the full Landing design is built in Phase 2.
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-10">
      <div className="flex items-center gap-[11px]">
        <LogoMark />
        <span className="font-display text-lg font-semibold tracking-[-0.01em] text-fg-bright">
          Milestoned
        </span>
      </div>
      <p className="text-sm text-fg-tertiary">Landing page lands in Phase 2.</p>
      <Link href="/login" className="text-[14.5px]">
        Sign in →
      </Link>
    </div>
  );
}
