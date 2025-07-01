import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chi tiêu - Infina PFA",
  description: "Quản lý ngân sách và theo dõi chi tiêu cá nhân",
};

export default function BudgetingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
