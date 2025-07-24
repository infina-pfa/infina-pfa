export const chatEn = {
  // Loading States
  loading: "Loading chat...",

  // Error Messages
  dismissError: "Dismiss",
  connectionError: "Connection error. Please try again.",
  messageEmpty: "Message content cannot be empty",
  messageTooLong: "Message content cannot exceed 10,000 characters",
  conversationCreateFailed: "Failed to create conversation",
  messageSendFailed: "Failed to send message",
  aiStreamFailed: "Failed to process AI stream",

  // Welcome Screen
  "chat.welcomeTitle": "Welcome to your AI Financial Advisor",
  "chat.welcomeDescription":
    "I'm here to help you with budgeting, financial planning, investment advice, and achieving your financial goals. Ask me anything!",

  // Chat Interface
  chatWithAI: "Chat with AI",
  askMeAnything: "Ask me anything about your finances",
  typeYourMessage: "Type your message...",
  sendMessage: "Send message",

  // Input Component
  inputPlaceholder: "Ask about budgets, investments, savings goals...",
  inputHint: "Press Enter to send, Shift+Enter for new line",
  aiTyping: "AI is thinking...",
  attachFile: "Attach file",
  voiceInput: "Voice input",

  // Suggestions
  suggestionsTitle: "Try asking about:",

  // Message States
  noMessagesYet: "No messages yet",
  startConversation: "Start the conversation by sending a message",
  thinking: "Thinking...",
  componentSuggestion: "Suggested Tool",
  openTool: "Open Tool",

  // AI Notification Card
  aiAdvisor: "AI Advisor",
  waitingForResponse: "Waiting for response...",
  openFullChat: "Open Full Chat",

  // Message Count
  messageCount_one: "{{count}} message",
  messageCount_other: "{{count}} messages",

  // Component Panel
  componentPanelTitle: "Financial Tool",
  closePanel: "Close panel",
  close: "Close",
  useThisTool: "Use This Tool",
  componentPlaceholder: "This tool will be implemented soon...",

  // Component Types
  budgetFormTitle: "Monthly Budget Planner",
  budgetFormDescription: "Create and manage your monthly budget with ease",

  expenseTrackerTitle: "Expense Tracker",
  expenseTrackerDescription: "Track your daily expenses and spending patterns",

  goalPlannerTitle: "Financial Goal Planner",
  goalPlannerDescription: "Set and track your financial goals step by step",

  investmentCalculatorTitle: "Investment Calculator",
  investmentCalculatorDescription:
    "Calculate potential returns on your investments",

  spendingChartTitle: "Spending Analysis",
  spendingChartDescription: "Visualize your spending patterns and trends",

  unknownComponentTitle: "Financial Tool",
  unknownComponentDescription: "A helpful tool for managing your finances",

  // Chat Suggestions (default ones)
  suggestionOptions: {
    budgetHelp: "Help me create a monthly budget",
    savingsGoal: "How can I save more money?",
    investmentAdvice: "What should I invest in?",
    debtManagement: "How to pay off my debt faster?",
    emergencyFund: "How much should I save for emergencies?",
    retirementPlanning: "Help me plan for retirement",
  },

  // Chat UI (additional)
  loadingMessages: "Loading messages...",
  noMessages: "No messages yet",
  typingIndicator: "Finny is typing...",

  // Onboarding Stage Identification
  onboarding: {
    welcomeMessage:
      "Hello! I'm Fina, your AI financial advisor 🤝\n\nI'm here to help you take control of your financial future and provide specific guidance that fits your current financial situation.\n\n✨ To help you best, let me know what stage you're at in your financial journey:",
    questionsIntro:
      "I'll ask you 2 quick questions to accurately determine your financial priority:",

    // Questions
    debtQuestion:
      "Do you have any debt, such as credit card balances or personal loans, with interest rates higher than 8%?",
    emergencyFundQuestion:
      "If you lost your main source of income today, do you have enough cash in easily accessible savings accounts to cover all essential living expenses for at least three months?",

    // Answer options
    yes: "Yes",
    no: "No",

    // Stage confirmations
    debtStageConfirmation:
      "Based on your answers, you're in the **Debt Management** stage. Your priority should be paying off high-interest debt first.",
    noSavingStageConfirmation:
      "Based on your answers, you're in the **Emergency Fund Building** stage. Your priority should be building a 3-6 month emergency fund.",
    investingStageConfirmation:
      "Based on your answers, you're in the **Investment Ready** stage. You can start focusing on long-term wealth building through investing.",

    // Actions
    getStarted: "Let's get started!",
    continue: "Continue",
    analysisComplete: "Analysis complete! Let's start your financial journey.",
  },

  // AI Advisor Context
  aiAdvisorContext: {
    title: "Finny - Your Financial Advisor",
    description: "Ask me anything about your finances",
    placeholder: "Ask Finny a question...",
    loadingResponse: "Thinking...",
    errorMessage: "Sorry, I couldn't process your request",

    // Context information translations
    userInfo: "User Information",
    userId: "User ID",
    noContextData: "No context data available",

    financialInfo: "Financial Information",
    totalIncome: "Total Income",
    totalExpenses: "Total Expenses",
    budgetCount: "Budget Count",
    completedOnboarding: "Completed Onboarding",
    noData: "No data available",
    yes: "Yes",
    no: "No",

    learningInfo: "Learning Information",
    currentLevel: "Current Level",
    experiencePoints: "Experience Points",
    currentGoal: "Current Goal",
    noGoal: "No goal set",

    conversationHistory: "Conversation History",
    firstConversation: "This is the first conversation.",
    user: "User",
    ai: "AI",
  },

  // Video components
  videoLoadError: "Unable to load video. Please try again later.",
  videoPlayError: "Unable to play video. Please try again.",
  videoNotSupported: "Your browser does not support the video tag.",
  clickToPlay: "Click to play video",
};
