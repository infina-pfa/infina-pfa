export const chatVi = {
  // Loading States
  loading: "Đang tải trò chuyện...",

  // Error Messages
  dismissError: "Bỏ qua",
  connectionError: "Lỗi kết nối. Vui lòng thử lại.",
  messageEmpty: "Nội dung tin nhắn không thể trống",
  messageTooLong: "Nội dung tin nhắn không thể vượt quá 10.000 ký tự",
  conversationCreateFailed: "Không thể tạo cuộc trò chuyện",
  messageSendFailed: "Không thể gửi tin nhắn",
  aiStreamFailed: "Không thể xử lý luồng AI",

  // Welcome Screen
  "chat.welcomeTitle": "Chào mừng đến với Cố vấn Tài chính AI",
  "chat.welcomeDescription":
    "Tôi ở đây để giúp bạn lập ngân sách, lập kế hoạch tài chính, tư vấn đầu tư và đạt được mục tiêu tài chính của bạn. Hãy hỏi tôi bất cứ điều gì!",

  // Chat Interface
  chatWithAI: "Trò chuyện với AI",
  askMeAnything: "Hỏi tôi bất cứ điều gì về tài chính của bạn",
  typeYourMessage: "Nhập tin nhắn của bạn...",
  sendMessage: "Gửi tin nhắn",

  // Input Component
  inputPlaceholder: "Hỏi về ngân sách, đầu tư, mục tiêu tiết kiệm...",
  inputHint: "Nhấn Enter để gửi, Shift+Enter để xuống dòng",
  aiTyping: "AI đang suy nghĩ...",
  attachFile: "Đính kèm tệp",
  voiceInput: "Nhập giọng nói",

  // Suggestions
  suggestionsTitle: "Thử hỏi về:",

  // Message States
  noMessagesYet: "Chưa có tin nhắn",
  startConversation: "Bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn",
  thinking: "Đang suy nghĩ...",
  componentSuggestion: "Công cụ được đề xuất",
  openTool: "Mở công cụ",

  // AI Notification Card
  aiAdvisor: "Cố vấn AI",
  waitingForResponse: "Đang chờ phản hồi...",
  openFullChat: "Mở trò chuyện đầy đủ",

  // Message Count
  messageCount_one: "{{count}} tin nhắn",
  messageCount_other: "{{count}} tin nhắn",

  // Component Panel
  componentPanelTitle: "Công cụ tài chính",
  closePanel: "Đóng bảng",
  close: "Đóng",
  useThisTool: "Sử dụng công cụ này",
  componentPlaceholder: "Công cụ này sẽ được triển khai sớm...",

  // Component Types
  budgetFormTitle: "Lập kế hoạch ngân sách hàng tháng",
  budgetFormDescription:
    "Tạo và quản lý ngân sách hàng tháng của bạn một cách dễ dàng",

  expenseTrackerTitle: "Theo dõi chi tiêu",
  expenseTrackerDescription:
    "Theo dõi chi tiêu hàng ngày và mẫu chi tiêu của bạn",

  goalPlannerTitle: "Lập kế hoạch mục tiêu tài chính",
  goalPlannerDescription:
    "Thiết lập và theo dõi các mục tiêu tài chính của bạn từng bước",

  investmentCalculatorTitle: "Máy tính đầu tư",
  investmentCalculatorDescription:
    "Tính toán lợi nhuận tiềm năng từ các khoản đầu tư của bạn",

  spendingChartTitle: "Phân tích chi tiêu",
  spendingChartDescription:
    "Trực quan hóa các mẫu và xu hướng chi tiêu của bạn",

  unknownComponentTitle: "Công cụ tài chính",
  unknownComponentDescription:
    "Một công cụ hữu ích để quản lý tài chính của bạn",

  // Chat Suggestions (default ones)
  suggestionOptions: {
    budgetHelp: "Giúp tôi tạo ngân sách hàng tháng",
    savingsGoal: "Làm thế nào để tiết kiệm nhiều tiền hơn?",
    investmentAdvice: "Tôi nên đầu tư vào cái gì?",
    debtManagement: "Làm thế nào để trả nợ nhanh hơn?",
    emergencyFund: "Tôi nên tiết kiệm bao nhiêu cho trường hợp khẩn cấp?",
    retirementPlanning: "Giúp tôi lập kế hoạch hưu trí",
  },

  // Chat UI (additional)
  loadingMessages: "Đang tải tin nhắn...",
  noMessages: "Chưa có tin nhắn",
  typingIndicator: "Finny đang nhập...",

  // Onboarding Stage Identification
  onboarding: {
    welcomeMessage:
      "Xin chào! Tôi là Fina, cố vấn tài chính AI của bạn 🤝\n\nTôi ở đây để giúp bạn kiểm soát tương lai tài chính của mình và cung cấp hướng dẫn cụ thể phù hợp với tình hình tài chính hiện tại của bạn.\n\n✨ Để tôi có thể hỗ trợ bạn tốt nhất, hãy cho tôi biết bạn đang ở giai đoạn nào trong hành trình tài chính:",
    questionsIntro:
      "Tôi sẽ hỏi bạn 2 câu hỏi ngắn để xác định chính xác ưu tiên tài chính của bạn:",

    // Questions (from PRD)
    debtQuestion:
      "Bạn có bất kỳ khoản nợ nào, chẳng hạn như dư nợ thẻ tín dụng hoặc các khoản vay cá nhân, với lãi suất cao hơn 8% không?",
    emergencyFundQuestion:
      "Nếu bạn mất nguồn thu nhập chính ngày hôm nay, bạn có đủ tiền mặt trong tài khoản tiết kiệm dễ tiếp cận để trang trải tất cả các chi phí sinh hoạt thiết yếu trong ít nhất ba tháng không?",

    // Answer options
    yes: "Có",
    no: "Không",

    // Stage confirmations
    debtStageConfirmation:
      "Dựa trên câu trả lời của bạn, bạn đang ở giai đoạn **Quản lý nợ**. Ưu tiên của bạn nên là trả hết nợ lãi suất cao trước.",
    noSavingStageConfirmation:
      "Dựa trên câu trả lời của bạn, bạn đang ở giai đoạn **Xây dựng quỹ khẩn cấp**. Ưu tiên của bạn nên là xây dựng quỹ khẩn cấp 3-6 tháng.",
    investingStageConfirmation:
      "Dựa trên câu trả lời của bạn, bạn đang ở giai đoạn **Sẵn sàng đầu tư**. Bạn có thể bắt đầu tập trung vào xây dựng tài sản dài hạn thông qua đầu tư.",

    // Actions
    getStarted: "Bắt đầu thôi!",
    continue: "Tiếp tục",
    analysisComplete:
      "Phân tích hoàn tất! Hãy bắt đầu hành trình tài chính của bạn.",
  },

  // AI Advisor Context
  aiAdvisorContext: {
    title: "Finny - Cố vấn tài chính của bạn",
    description: "Hỏi tôi bất cứ điều gì về tài chính của bạn",
    placeholder: "Hỏi Finny một câu hỏi...",
    loadingResponse: "Đang suy nghĩ...",
    errorMessage: "Xin lỗi, tôi không thể xử lý yêu cầu của bạn",

    // Context information translations
    userInfo: "Thông tin người dùng",
    userId: "ID người dùng",
    noContextData: "Chưa có thông tin context người dùng",

    financialInfo: "Thông tin tài chính",
    totalIncome: "Tổng thu nhập",
    totalExpenses: "Tổng chi tiêu",
    budgetCount: "Số lượng ngân sách",
    completedOnboarding: "Đã hoàn thành onboarding",
    noData: "Chưa có dữ liệu",
    yes: "Có",
    no: "Không",

    learningInfo: "Thông tin học tập",
    currentLevel: "Level hiện tại",
    experiencePoints: "Điểm kinh nghiệm",
    currentGoal: "Mục tiêu hiện tại",
    noGoal: "Chưa có mục tiêu",

    conversationHistory: "Lịch sử cuộc trò chuyện",
    firstConversation: "Đây là cuộc trò chuyện đầu tiên.",
    user: "Người dùng",
    ai: "AI",
  },
};
