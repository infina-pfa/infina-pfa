import { isFirstDayOfMonth, isLastDayOfMonth } from "date-fns";

export const getStartConversationPromptForStartSaving = () => {
  const isFirstOfMonth = isFirstDayOfMonth(new Date());
  const isLastOfMonth = isLastDayOfMonth(new Date());

  if (isFirstOfMonth) {
    return `
I'm the system, please start the conversation with user by doing 2 actions:
    1. Give them saving goals overview by show the component saving goal
    2. Remind user to do the "Pay yourself first" action
        `;
  }

  if (isLastOfMonth) {
    return `
I'm the system, please start the conversation with user by doing 2 actions:
    1. Give them budgeting overview by show the component budgeting overview
    2. Show 2 suggestion options by function show_component:
    - Review the monthly spending
    - Plan for the next month
    `;
  }

  return `
I'm the system, please start the conversation with user by doing 2 actions:
    1. Give them budgeting overview by show the component budgeting overview
    2. Show 2 suggestion options by function show_component:
    - Note spending
    - Review monthly spending  
  `;
};
