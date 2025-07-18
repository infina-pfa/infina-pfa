// Simple date mock config for testing
// Set MOCK_DATE_SCENARIO to test different scenarios
// Leave as null for normal behavior

export enum DateScenario {
  START_OF_MONTH = "start_of_month",
  END_OF_MONTH = "end_of_month",
  NORMAL_DAY = "normal_day",
  END_OF_WEEK = "end_of_week",
}

// Return only is end of week, start of month, end of month
export function getDateStage(): DateScenario {
  const now = new Date();
  const isEndOfWeek = now.getDay() === 0;
  const isStartOfMonth = now.getDate() === 1;
  const isEndOfMonth =
    now.getDate() ===
    new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  if (isEndOfWeek) {
    return DateScenario.END_OF_WEEK;
  }

  if (isStartOfMonth) {
    return DateScenario.START_OF_MONTH;
  }

  if (isEndOfMonth) {
    return DateScenario.END_OF_MONTH;
  }

  return DateScenario.NORMAL_DAY;
}

// CHANGE THIS TO TEST DIFFERENT SCENARIOS
//export const MOCK_DATE_SCENARIO: DateScenario = null;
export const MOCK_DATE_SCENARIO: DateScenario = DateScenario.START_OF_MONTH;
//export const MOCK_DATE_SCENARIO: DateScenario = 'end_of_month';
//export const MOCK_DATE_SCENARIO: DateScenario = 'normal_day';

// Mock date functions
export const getMockDateStage = (): DateScenario => {
  if (MOCK_DATE_SCENARIO) {
    return MOCK_DATE_SCENARIO;
  }

  // Use real date logic
  const now = new Date();
  const isFirstDayOfMonth = now.getDate() === 1;
  const isLastDayOfMonth =
    now.getDate() ===
    new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  if (isFirstDayOfMonth) {
    return DateScenario.START_OF_MONTH;
  } else if (isLastDayOfMonth) {
    return DateScenario.END_OF_MONTH;
  } else {
    return DateScenario.NORMAL_DAY;
  }
};

export const getMockIsFirstOfMonth = (): boolean => {
  if (MOCK_DATE_SCENARIO === DateScenario.START_OF_MONTH) return true;
  if (
    MOCK_DATE_SCENARIO === DateScenario.END_OF_MONTH ||
    MOCK_DATE_SCENARIO === DateScenario.NORMAL_DAY
  )
    return false;

  // Use real date
  return new Date().getDate() === 1;
};

export const getMockIsLastOfMonth = (): boolean => {
  if (MOCK_DATE_SCENARIO === DateScenario.END_OF_MONTH) return true;
  if (
    MOCK_DATE_SCENARIO === DateScenario.START_OF_MONTH ||
    MOCK_DATE_SCENARIO === DateScenario.NORMAL_DAY
  )
    return false;

  // Use real date
  const now = new Date();
  return (
    now.getDate() ===
    new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  );
};
