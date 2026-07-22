import { SidebarContent } from "./SidebarContent";

/*
 * Desktop only — hidden below lg, where MobileNav's drawer takes over.
 * The switch is lg (1024px) rather than md: at narrower widths this fixed
 * 236px column doesn't leave enough room for the document table's fixed-
 * width columns (see DocumentRow's comment).
 */
export function Sidebar({
  creditsLeft,
  creditsTotal,
}: {
  creditsLeft: number;
  creditsTotal: number;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[236px] shrink-0 flex-col border-r border-line-faint p-4 lg:flex">
      <SidebarContent creditsLeft={creditsLeft} creditsTotal={creditsTotal} />
    </aside>
  );
}
