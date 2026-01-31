// src/components/DesktopSidebar.tsx
import { SidebarContent } from './SidebarContent';

export function DesktopSidebar() {
  return (
    <aside className="hidden md:flex w-72 flex-col bg-slate-900 shadow-2xl shadow-black/30 border-r border-slate-800 h-screen sticky top-0 z-20">
      <div className="p-6 overflow-y-auto">
        <SidebarContent />
      </div>
    </aside>
  );
}