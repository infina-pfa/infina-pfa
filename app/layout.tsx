import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { DevLanguageSwitcher } from "@/components/ui/language-switcher";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Infina PFA",
  description: "Trợ lý tài chính cá nhân thông minh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${nunito.variable} antialiased font-nunito`}>
        <AuthProvider>
          <I18nProvider>
            {children}
            <DevLanguageSwitcher />
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
