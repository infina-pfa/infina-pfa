export function getGoalFocusedPrompt(context?: string, toolInfo?: string) {
  return `
    <goal_focused_prompt>
    ${context}
    ${toolInfo}
    </goal_focused_prompt>
    `;
}
