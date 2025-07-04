"use client";

import { MobileMenu } from "@/components/ui/mobile-menu";
import { LandingNavbar } from "@/components/ui/landing-navbar";

export function Header() {
  return (
    <header className="bg-white sticky top-0 z-50 border-b border-divider h-16">
      <div className="max-w-6xl mx-auto px-6 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Mobile Menu - Show on mobile for all users */}
          <div className="md:hidden w-full">
            <MobileMenu />
          </div>

          <div className="hidden md:flex w-full h-full">
            <LandingNavbar />
          </div>
        </div>
      </div>
    </header>
  );
}
