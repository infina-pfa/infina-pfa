"use client";

import { MobileMenu } from "@/components/ui/mobile-menu";
import { LandingNavbar } from "@/components/ui/landing-navbar";

export function Header() {
  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu - Show on mobile for all users */}
          <div className="md:hidden">
            <MobileMenu />
          </div>

          <div className="hidden md:flex w-full">
            <LandingNavbar />
          </div>
        </div>
      </div>
    </header>
  );
}
