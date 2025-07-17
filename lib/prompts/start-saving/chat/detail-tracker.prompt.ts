export function getDetailTrackerPrompt(context?: string, toolInfo?: string) {
  return `
    <detail_tracker_prompt>
    ${context}
    ${toolInfo}
    </detail_tracker_prompt>
    `;
}
