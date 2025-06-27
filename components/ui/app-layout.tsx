"use client";

import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { useAuthContext } from "@/components/providers/auth-provider";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuthContext();

  return (
    <div className="min-h-screen bg-app-bg font-nunito">
      {/* Mobile Header - Only visible on mobile for authenticated users */}
      {user && (
        <div className="md:hidden">
          <Header />
        </div>
      )}

      {/* Desktop Layout with Sidebar */}
      <div className="flex h-screen">
        {/* Vertical Sidebar - Only visible on desktop */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
