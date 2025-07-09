import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mục tiêu tài chính - Infina PFA",
  description: "Quản lý mục tiêu tài chính cá nhân",
};

export default function GoalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
