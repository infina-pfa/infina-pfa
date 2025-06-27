"use client";

import { MobileMenu } from "@/components/ui/mobile-menu";
import { Navbar } from "@/components/ui/navbar";
import { useAuthContext } from "@/components/providers/auth-provider";

export function Header() {
  const { user } = useAuthContext();

  return (
    <header className="bg-white relative border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu - Show on mobile for all users */}
          <div className="md:hidden">
            <MobileMenu />
          </div>

          {/* Desktop Navigation - Only show when user is not authenticated (landing page) */}
          {!user && (
            <div className="hidden md:flex items-center justify-between w-full">
              {/* Logo for landing page only */}
              <div className="flex items-center space-x-2">
                <img
                  src="/infina-logo.png"
                  alt="Infina"
                  className="h-8 w-auto"
                />
              </div>

              {/* Navigation */}
              <Navbar />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
