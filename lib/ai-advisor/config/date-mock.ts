// Simple date mock config for testing
// Set MOCK_DATE_SCENARIO to test different scenarios
// Leave as null for normal behavior

export type DateScenario = 'start_of_month' | 'end_of_month' | 'normal_day' | null;

// CHANGE THIS TO TEST DIFFERENT SCENARIOS
//export const MOCK_DATE_SCENARIO: DateScenario = null;
export const MOCK_DATE_SCENARIO: DateScenario = 'start_of_month';
//export const MOCK_DATE_SCENARIO: DateScenario = 'end_of_month'; 
//export const MOCK_DATE_SCENARIO: DateScenario = 'normal_day';

// Mock date functions
export const getMockDateStage = (): string => {
  if (MOCK_DATE_SCENARIO) {
    return MOCK_DATE_SCENARIO;
  }
  
  // Use real date logic
  const now = new Date();
  const isFirstDayOfMonth = now.getDate() === 1;
  const isLastDayOfMonth = now.getDate() === new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  
  if (isFirstDayOfMonth) {
    return "start_of_month";
  } else if (isLastDayOfMonth) {
    return "end_of_month";
  } else {
    return "normal_day";
  }
};

export const getMockIsFirstOfMonth = (): boolean => {
  if (MOCK_DATE_SCENARIO === 'start_of_month') return true;
  if (MOCK_DATE_SCENARIO === 'end_of_month' || MOCK_DATE_SCENARIO === 'normal_day') return false;
  
  // Use real date
  return new Date().getDate() === 1;
};

export const getMockIsLastOfMonth = (): boolean => {
  if (MOCK_DATE_SCENARIO === 'end_of_month') return true;
  if (MOCK_DATE_SCENARIO === 'start_of_month' || MOCK_DATE_SCENARIO === 'normal_day') return false;
  
  // Use real date
  const now = new Date();
  return now.getDate() === new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}; 