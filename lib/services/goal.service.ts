import { apiClient } from "@/lib/api-client";
import {
  GoalResponseDto,
  CreateGoalRequest,
  UpdateGoalRequest,
  ContributeGoalRequest,
  WithdrawGoalRequest,
} from "@/lib/types/goal.types";

/**
 * Goal Service Layer
 * Handles all goal-related API operations
 */
export const goalService = {
  /**
   * Creates a new financial goal
   */
  async createGoal(data: CreateGoalRequest): Promise<GoalResponseDto> {
    const response = await apiClient.post<GoalResponseDto>("/goals", data);
    if (!response.data) {
      throw new Error("Failed to create goal");
    }
    return response.data;
  },

  /**
   * Fetches all goals for the current user
   */
  async getGoals(): Promise<GoalResponseDto[]> {
    const response = await apiClient.get<GoalResponseDto[]>("/goals");
    return response.data || [];
  },

  /**
   * Updates an existing goal
   */
  async updateGoal(
    goalId: string,
    data: UpdateGoalRequest
  ): Promise<GoalResponseDto> {
    const response = await apiClient.patch<GoalResponseDto>(
      `/goals/${goalId}`,
      data
    );
    if (!response.data) {
      throw new Error("Failed to update goal");
    }
    return response.data;
  },

  /**
   * Contributes money to a goal
   */
  async contributeToGoal(
    goalId: string,
    data: ContributeGoalRequest
  ): Promise<GoalResponseDto> {
    const response = await apiClient.post<GoalResponseDto>(
      `/goals/${goalId}/contribute`,
      data
    );
    if (!response.data) {
      throw new Error("Failed to contribute to goal");
    }
    return response.data;
  },

  /**
   * Withdraws money from a goal
   */
  async withdrawFromGoal(
    goalId: string,
    data: WithdrawGoalRequest
  ): Promise<GoalResponseDto> {
    const response = await apiClient.post<GoalResponseDto>(
      `/goals/${goalId}/withdraw`,
      data
    );
    if (!response.data) {
      throw new Error("Failed to withdraw from goal");
    }
    return response.data;
  },

  /**
   * Deletes a goal (if needed in future)
   */
  async deleteGoal(goalId: string): Promise<void> {
    await apiClient.delete(`/goals/${goalId}`);
  },
};