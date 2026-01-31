// src/components/SidebarContent.tsx
import { Link } from '@tanstack/react-router';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Users, Shield, Server, PlusCircle, List, Globe } from 'lucide-react';
import { useLocation } from '@tanstack/react-router';

interface SidebarContentProps {
  onLinkClick?: () => void;
}

export function SidebarContent({ onLinkClick }: SidebarContentProps = {}) {
  const { pathname } = useLocation();

  // Auto-open the accordion section that matches current path
  const getDefaultValue = () => {
    if (pathname.startsWith('/managers')) return 'managers';
    if (pathname.startsWith('/users')) return 'users';
    if (pathname.startsWith('/packages')) return 'packages';
    if (pathname.startsWith('/nas')) return 'nas';
    return undefined;
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="relative py-4">
         <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-linear-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl rounded-full opacity-50" />
         <div className="relative text-4xl font-extrabold text-center text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 font-['Dancing_Script'] drop-shadow-sm">
          Radius Manager
        </div>
      </div>

      <Accordion type="single" collapsible defaultValue={getDefaultValue()} className="space-y-4 px-2">
        {/* Managers - Blue Shade (Dark Mode) */}
        <AccordionItem value="managers" className="group borderless mb-4 overflow-hidden rounded-2xl bg-white/5 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white/10 border border-white/5">
          <AccordionTrigger className="px-4 py-3 hover:no-underline data-[state=open]:bg-blue-500/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 group-data-[state=open]:bg-blue-600 group-data-[state=open]:text-white transition-colors duration-300">
                <Shield className="h-5 w-5" />
              </div>
              <span className="font-bold text-slate-300 group-data-[state=open]:text-blue-400">Managers</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-3 px-3 space-y-1 bg-white/5">
            {[
              { to: '/managers/list', label: 'List Managers', icon: List },
              { to: '/managers/new', label: 'New Manager', icon: PlusCircle },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={onLinkClick}
                activeProps={{ className: 'bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 border-blue-500/50' }}
                inactiveProps={{ className: 'text-slate-400 hover:bg-slate-800 hover:text-blue-400' }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 border border-transparent"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Users - Emerald Shade (Dark Mode) */}
        <AccordionItem value="users" className="group borderless mb-4 overflow-hidden rounded-2xl bg-white/5 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white/10 border border-white/5">
           <AccordionTrigger className="px-4 py-3 hover:no-underline data-[state=open]:bg-emerald-500/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-data-[state=open]:bg-emerald-600 group-data-[state=open]:text-white transition-colors duration-300">
                <Users className="h-5 w-5" />
              </div>
              <span className="font-bold text-slate-300 group-data-[state=open]:text-emerald-400">Users</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-3 px-3 space-y-1 bg-white/5">
             {[
              { to: '/users/list', label: 'List Users', icon: List },
              { to: '/users/new', label: 'New User', icon: PlusCircle },
              { to: '/users/online', label: 'Online Users', icon: Globe },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={onLinkClick}
                activeProps={{ className: 'bg-linear-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/30 border-emerald-500/50' }}
                inactiveProps={{ className: 'text-slate-400 hover:bg-slate-800 hover:text-emerald-400' }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 border border-transparent"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Packages - Violet Shade (Dark Mode) */}
        <AccordionItem value="packages" className="group borderless mb-4 overflow-hidden rounded-2xl bg-white/5 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white/10 border border-white/5">
           <AccordionTrigger className="px-4 py-3 hover:no-underline data-[state=open]:bg-violet-500/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400 group-data-[state=open]:bg-violet-600 group-data-[state=open]:text-white transition-colors duration-300">
                <Server className="h-5 w-5" />
              </div>
              <span className="font-bold text-slate-300 group-data-[state=open]:text-violet-400">Packages</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-3 px-3 space-y-1 bg-white/5">
            {[
              { to: '/packages/list', label: 'List Packages', icon: List },
              { to: '/packages/new', label: 'New Package', icon: PlusCircle },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={onLinkClick}
                activeProps={{ className: 'bg-linear-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 border-violet-500/50' }}
                inactiveProps={{ className: 'text-slate-400 hover:bg-slate-800 hover:text-violet-400' }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 border border-transparent"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* NAS - Amber Shade (Dark Mode) */}
        <AccordionItem value="nas" className="group borderless mb-4 overflow-hidden rounded-2xl bg-white/5 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white/10 border border-white/5">
           <AccordionTrigger className="px-4 py-3 hover:no-underline data-[state=open]:bg-amber-500/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 group-data-[state=open]:bg-amber-600 group-data-[state=open]:text-white transition-colors duration-300">
                 <Server className="h-5 w-5" />
              </div>
              <span className="font-bold text-slate-300 group-data-[state=open]:text-amber-400">NAS</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-3 px-3 space-y-1 bg-white/5">
             {[
              { to: '/nas/list', label: 'List NAS Devices', icon: List },
              { to: '/nas/new', label: 'New NAS Device', icon: PlusCircle },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={onLinkClick}
                activeProps={{ className: 'bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 border-amber-500/50' }}
                inactiveProps={{ className: 'text-slate-400 hover:bg-slate-800 hover:text-amber-400' }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 border border-transparent"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}