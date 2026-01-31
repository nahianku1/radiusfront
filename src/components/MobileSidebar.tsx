// src/components/MobileSidebar.tsx
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { SidebarContent } from './SidebarContent';

export function MobileSidebar() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-lg rounded-full hover:bg-gray-100"
        >
          <Menu className="h-6 w-6 text-gray-800" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[92vh] rounded-t-3xl bg-slate-900 border-t border-slate-800 shadow-2xl shadow-black/30">
        {/* Drag handle */}
        <div className="mx-auto w-16 h-1.5 mt-3 rounded-full bg-slate-700" />
        
        {/* Content with proper top padding */}
        <div className="p-6 pt-8 overflow-y-auto">
          <SidebarContent />
        </div>
      </DrawerContent>
    </Drawer>
  );
}