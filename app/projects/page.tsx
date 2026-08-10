import { redirect } from "next/navigation";
import Link from "next/link";
import { authService } from "@/server/services/auth.service";
import { projectController } from "@/server/controllers/project.controller";
import { appSettingsService } from "@/server/services/app-settings.service";
import { formatDocDate } from "@/lib/document-display";

export default async function ProjectsPage() {
  const user = await authService.getUser();
  if (!user) {
    redirect("/login");
  }
  if (await appSettingsService.isPrelaunch()) {
    redirect("/welcome");
  }

  const projects = await projectController.listForUser(user.id);

  return (
    <div className="min-h-screen bg-navy text-fg">
      <header className="flex items-center gap-4 border-b border-line-faint px-8 py-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-[13.5px] text-fg-tertiary">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M9.5 3L5 7.5L9.5 12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Documents
        </Link>
        <span className="h-[18px] w-px bg-line-input" />
        <span className="font-display text-[15px] font-semibold tracking-[-0.01em] text-fg-bright">
          Projects
        </span>
      </header>

      <main className="mx-auto max-w-[820px] px-6 py-14">
        <p className="mb-8 text-[13.5px] leading-[1.5] text-fg-tertiary">
          Every Proposal, Contract, SOW, and Invoice you generate for the same client and project
          name is grouped here automatically — nothing to set up.
        </p>

        <div className="mb-3.5 flex items-center justify-between">
          <span className="font-display text-[15px] font-semibold text-fg">All projects</span>
          <span className="text-[13px] text-fg-muted">{projects.length} total</span>
        </div>

        <div className="overflow-hidden rounded-[14px] border border-line-soft bg-white/[0.008]">
          {projects.length === 0 ? (
            <div className="px-[22px] py-12 text-center text-sm text-fg-muted">
              No projects yet — generate your first document and one will appear here.
            </div>
          ) : (
            projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center justify-between gap-4 border-b border-line-faint px-[22px] py-4 transition-colors last:border-b-0 hover:bg-white/[0.025]"
              >
                <div className="min-w-0">
                  <div className="truncate text-[14.5px] font-medium text-fg">{project.name}</div>
                  <div className="truncate text-[12.5px] text-fg-muted">
                    {project.clientName} · {formatDocDate(project.createdAt)}
                  </div>
                </div>
                <span className="shrink-0 text-[13px] text-fg-tertiary">
                  {project.documentCount} document{project.documentCount === 1 ? "" : "s"}
                </span>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
