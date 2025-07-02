import {
  Wallet,
  Car,
  ShoppingCart,
  Utensils,
  Zap,
  Home,
  Gamepad2,
  Heart,
  Plane,
  GraduationCap,
  MoreHorizontal,
} from "lucide-react";

// Available icons for budget categories
export const BUDGET_ICONS = [
  { name: "wallet", icon: Wallet, color: "#0055FF" },
  { name: "car", icon: Car, color: "#2ECC71" },
  { name: "shopping", icon: ShoppingCart, color: "#FF9800" },
  { name: "food", icon: Utensils, color: "#FFC107" },
  { name: "electricity", icon: Zap, color: "#FFC107" },
  { name: "home", icon: Home, color: "#0055FF" },
  { name: "entertainment", icon: Gamepad2, color: "#F44336" },
  { name: "health", icon: Heart, color: "#2ECC71" },
  { name: "travel", icon: Plane, color: "#FF9800" },
  { name: "education", icon: GraduationCap, color: "#0055FF" },
  { name: "other", icon: MoreHorizontal, color: "#6B7280" },
];

// Available color options
export const BUDGET_COLORS = [
  "#0055FF", // Primary Blue
  "#2ECC71", // Success Green
  "#FFC107", // Warning Yellow
  "#FF9800", // Highlight Orange
  "#F44336", // Error Red
  "#6B7280", // Muted Gray
];

// Helper function to get icon by name
export const getBudgetIconByName = (name: string) => {
  return BUDGET_ICONS.find(icon => icon.name === name) || BUDGET_ICONS[0];
};

// Helper function to get color by name
export const getBudgetColorByName = (name: string) => {
  const icon = BUDGET_ICONS.find(icon => icon.name === name);
  return icon ? icon.color : BUDGET_COLORS[0];
}; 