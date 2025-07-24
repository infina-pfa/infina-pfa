import { getMockIsFirstOfMonth, getMockIsLastOfMonth } from "../config/date-mock";

export const getStartConversationPromptForStartSaving = () => {
  const isFirstOfMonth = getMockIsFirstOfMonth();
  const isLastOfMonth = getMockIsLastOfMonth();

  if (isFirstOfMonth) {
    return `
I'm the system, please start the conversation with user by doing actions:
      1.  Deliver a greeting and announce the new month.
      2.  **Show the Goal Dashboard** to remind the user of their Emergency Fund progress.
      3.  **Emphasize the "Pay Yourself First" rule.** This is the most critical action at the start of the month.
      4.  **Activate the pay_yourself_first_confirmation component** for the user to confirm they have transferred the agreed-upon amount to their emergency fund.
        `;
  }

  if (isLastOfMonth) {
    return `
I'm the system, please start the conversation with user by doing actions:
      1.  **Show the Budgeting Dashboard and Monthly Budget Analysis** to help the user control daily spending. 
      1.  **Analyze the monthly budget:** Check if the user overspent.
      2.  **IF (NOT OVERSPENT):**
          - Congratulate them on excellent spending management.
          - **Show the Goal Dashboard.**
          - **Encourage** them to use the surplus money to "boost" their Emergency Fund.
      3.  **IF (OVERSPENT):**
          - Show empathy, not judgment. E.g., "It looks like this month was a bit challenging. That's okay, let's review it together."
          - Help the user review large expenses and identify the cause.
      4.  **Always:** Show the Budgeting Dashboard and offer to **plan the next month's budget** based on this month's data.

    `;
  }

  return `
I'm the system, please start the conversation with user by doing actions:
    1.  Deliver a morning greeting.
    2.  **Show the Budgeting Dashboard** to help the user control daily spending.
    3.  **Ask an engaging question:** "What did you spend on today?" or "Any expenses to log for today?" to encourage tracking.
    4.  The goal is to help the user stick to their budget to maximize the amount they can save at the end of the month.
  `;
};
