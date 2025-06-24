import { Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function Footer() {
  return (
    <footer className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Infina PFA
            </h3>
            <p className="text-muted-foreground mb-6">
              Your AI-powered personal financial advisor, helping you build
              wealth one step at a time.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon">
                <Users className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Mail className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  How it works
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  Security
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  Terms
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  Cookies
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  Licenses
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <Card className="mb-8 bg-section-bg border-0 shadow-none">
          <CardContent className="p-8">
            <div className="max-w-2xl mx-auto text-center">
              <CardTitle className="text-xl mb-2">Stay updated</CardTitle>
              <CardDescription className="mb-6">
                Get financial tips, product updates, and exclusive insights
                delivered to your inbox
              </CardDescription>
              <div className="flex gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-white"
                />
                <Button>Subscribe</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="border-t border-divider pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2025 Infina PFA. All rights reserved.
            </p>
            <p className="text-muted-foreground text-sm mt-4 md:mt-0">
              Made with <span className="text-infina-red">♥</span> for your
              financial freedom
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
