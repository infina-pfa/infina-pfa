import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giao dịch - Infina PFA",
  description: "Quản lý giao dịch cá nhân",
};

export default function TransactionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
