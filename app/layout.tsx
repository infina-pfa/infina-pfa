import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { SWRProvider } from "@/lib/swr-config";
import { Toaster } from "sonner";
import { ElevenLabsWidget } from "@/components/elevenlabs/elevenlabs-widget";

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
        <SWRProvider>
          <AuthProvider>
            <I18nProvider>{children}</I18nProvider>
          </AuthProvider>
        </SWRProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              border: "1px solid #E0E0E0",
              borderRadius: "8px",
              fontFamily: "var(--font-nunito)",
            },
          }}
        />
        <ElevenLabsWidget />
        {/* <StagewiseToolbar
          config={{
            plugins: [ReactPlugin],
          }}
        /> */}
      </body>
    </html>
  );
}
