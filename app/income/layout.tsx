import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Income Management - Infina",
  description:
    "Track and manage your income sources with detailed analytics and insights.",
};

export default function IncomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
