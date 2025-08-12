"use client";

interface FinancialOverviewCardProps {
  month?: number;
  year?: number;
}

export const FinancialOverviewCard = ({
  month,
  year,
}: FinancialOverviewCardProps) => {
  // TODO: Implement financial overview functionality
  // For now, return null as the feature is not yet implemented
  // Will use month and year props when implemented
  console.log({ month, year }); // Temporary to avoid unused variable warnings
  return null;
}