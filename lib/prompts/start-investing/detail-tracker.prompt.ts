import { DateScenario } from "@/lib/ai-advisor/config/date-mock";
import { coreSavingPrompt } from "./core.prompt";

export function getDetailTrackerInvestingPrompt(
  context?: string,
  toolInfo?: string,
  dateStage?: DateScenario
) {
  // For normal days
  let prompt = `
    ${coreSavingPrompt}
    `;

  if (dateStage === DateScenario.START_OF_MONTH) {
    prompt = `
    ${coreSavingPrompt}
    `;
  }

  if (dateStage === DateScenario.END_OF_MONTH) {
    prompt = `
    ${coreSavingPrompt}
    `;
  }

  return `
    <investing_detail_tracker_prompt>
      ${prompt}
      ${context ? `<user_context>${context}</user_context>` : ""}
      ${toolInfo ? `<available_tools>${toolInfo}</available_tools>` : ""}
    </investing_detail_tracker_prompt>
  `;
}
