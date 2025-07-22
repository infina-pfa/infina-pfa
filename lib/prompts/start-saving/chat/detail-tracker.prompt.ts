import { DateScenario } from "@/lib/ai-advisor/config/date-mock";
import { coreSavingPrompt } from "./core.prompt";

export function getDetailTrackerPrompt(
  context?: string,
  toolInfo?: string,
  dateStage?: DateScenario
) {

  //log the context and toolInfo
  console.log("context:", context);
  console.log("toolInfo:", toolInfo);
  console.log("dateStage:", dateStage);

  const prompt = `
    <core_prompt_for_detail_tracker>
    ${coreSavingPrompt}
    </core_prompt_for_detail_tracker>
  `;
  return prompt;
}
