"use client";

import { FooterBrand } from "./footer/footer-brand";
import { FooterLinks } from "./footer/footer-links";
import { FooterNewsletter } from "./footer/footer-newsletter";
import { FooterBottom } from "./footer/footer-bottom";

export function Footer() {
  return (
    <footer className="bg-white py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <FooterBrand />
          <FooterLinks />
        </div>

        <FooterNewsletter />
        <FooterBottom />
      </div>
    </footer>
  );
}
