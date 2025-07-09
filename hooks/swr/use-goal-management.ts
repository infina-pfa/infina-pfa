"use client";

import { Goal } from "@/lib/types/goal.types";
import { useState } from "react";

// Mock data for goals
const mockGoals: Goal[] = [
  {
    id: "1",
    user_id: "user1",
    title: "Buy a new car",
    description: "Save for a new car",
    current_amount: 15000000,
    target_amount: 30000000,
    due_date: "2025-12-31",
    created_at: "2023-01-01",
    updated_at: "2023-01-01",
    transactions: [
      {
        id: "t1",
        name: "Salary deposit",
        amount: 5000000,
        type: "income",
        description: "Monthly savings for car",
        created_at: "2023-02-15",
        updated_at: "2023-02-15",
        user_id: "user1",
        recurring: 0,
      },
      {
        id: "t2",
        name: "Bonus deposit",
        amount: 10000000,
        type: "income",
        description: "Year-end bonus for car fund",
        created_at: "2023-12-20",
        updated_at: "2023-12-20",
        user_id: "user1",
        recurring: 0,
      },
    ],
  },
  {
    id: "2",
    user_id: "user1",
    title: "Emergency fund",
    description: "3 months of expenses",
    current_amount: 20000000,
    target_amount: 20000000,
    due_date: "2023-06-30",
    created_at: "2023-01-01",
    updated_at: "2023-06-30",
    transactions: [
      {
        id: "t3",
        name: "Salary deposit",
        amount: 5000000,
        type: "income",
        description: "Monthly savings for emergency",
        created_at: "2023-02-15",
        updated_at: "2023-02-15",
        user_id: "user1",
        recurring: 0,
      },
    ],
  },
  {
    id: "3",
    user_id: "user1",
    title: "Wedding fund",
    description: "Save for wedding expenses",
    current_amount: 50000000,
    target_amount: 100000000,
    due_date: "2026-01-01",
    created_at: "2023-01-01",
    updated_at: "2023-01-01",
    transactions: [],
  },
];

export function useGoalManagementSWR() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [loading, setLoading] = useState(false);

  // In a real implementation, this would use SWR to fetch goals from the API
  // For now, we'll just return the mock data

  return {
    goals,
    loading,
    // These functions would be implemented in a real application
    createGoal: () => console.log("Create goal"),
    updateGoal: () => console.log("Update goal"),
    deleteGoal: () => console.log("Delete goal"),
  };
}
