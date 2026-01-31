// src/routes/__root.tsx
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { Header } from '@/components/Header';
import { MobileSidebar } from '@/components/MobileSidebar';
import { useEffect } from 'react';
import { createRootRoute, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { Toaster } from 'react-hot-toast';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If we're not at the root path on mount (reload), redirect to root
    if (location.pathname !== '/') {
      navigate({ to: '/' });
    }
    // We only want this to run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 text-gray-800">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Mobile Drawer Sidebar */}
      <MobileSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-white/60 backdrop-blur-xl p-4 md:p-8">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}