import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Translation resources
const resources = {
  vi: {
    translation: {
      // Navigation
      home: "Trang chủ",
      features: "Tính năng",
      about: "Giới thiệu",
      contact: "Liên hệ",

      // Hero Section
      heroTitle: "Quản lý tài chính thông minh với AI",
      heroSubtitle:
        "Infina PFA giúp bạn lập kế hoạch tài chính cá nhân một cách dễ dàng và hiệu quả với sức mạnh của trí tuệ nhân tạo",
      getStarted: "Bắt đầu ngay",
      learnMore: "Tìm hiểu thêm",

      // How It Works
      howItWorksTitle: "Cách thức hoạt động",
      howItWorksSubtitle:
        "Ba bước đơn giản để bắt đầu hành trình quản lý tài chính thông minh",

      // Financial Stages
      financialStagesTitle: "Các giai đoạn tài chính",
      financialStagesSubtitle:
        "Hỗ trợ bạn từ những bước đầu tiên cho đến các mục tiêu dài hạn",

      // Key Features
      keyFeaturesTitle: "Tính năng chính",
      keyFeaturesSubtitle:
        "Những công cụ mạnh mẽ giúp bạn quản lý tài chính hiệu quả",

      // Testimonials
      testimonialsTitle: "Khách hàng nói gì về chúng tôi",
      testimonialsSubtitle:
        "Hàng nghìn người dùng đã tin tưởng và thành công với Infina PFA",

      // CTA Section
      ctaTitle: "Sẵn sàng bắt đầu hành trình tài chính của bạn?",
      ctaSubtitle:
        "Tham gia cùng hàng nghìn người dùng đã thay đổi cách quản lý tài chính",
      ctaButton: "Bắt đầu miễn phí",

      // Footer
      footerDescription:
        "Infina PFA - Trợ lý tài chính cá nhân thông minh giúp bạn đạt được các mục tiêu tài chính một cách dễ dàng và hiệu quả.",
      quickLinks: "Liên kết nhanh",
      followUs: "Theo dõi chúng tôi",
      privacy: "Chính sách bảo mật",
      terms: "Điều khoản sử dụng",
      allRightsReserved: "Bảo lưu mọi quyền.",

      // Language
      language: "Ngôn ngữ",
      vietnamese: "Tiếng Việt",
      english: "English",

      // Hero Section - Detailed
      heroMainTitle: "Huấn luyện viên tài chính AI của bạn —",
      heroSubTitle: "Một bước gần hơn tới tự do",
      heroDescription:
        "Theo dõi tiền của bạn. Nhận lời khuyên thông minh. Tăng trưởng tài sản — mà không có sự choáng ngợp.",
      startFreeJourney: "Bắt đầu hành trình miễn phí",

      // AI Chat Content
      aiCoach: "Huấn luyện viên AI của bạn",
      onlineNow: "Đang trực tuyến",
      aiMessage1:
        "Tôi nhận thấy bạn đã chi $247 cho việc ăn uống tuần này. Đó là nhiều hơn 23% so với ngân sách thường lệ của bạn. Bạn có muốn tôi đề xuất một số chiến lược để giúp bạn theo dõi không?",
      userResponse: "Có, xin hãy giúp tôi với điều đó",
      aiMessage2:
        "Tuyệt vời! Đây là 3 bước đơn giản: 1) Thử chuẩn bị bữa ăn vào Chủ nhật, 2) Đặt giới hạn ăn uống hàng ngày là $25, 3) Tôi sẽ gửi cho bạn lời nhắc nhở nhẹ nhàng khi bạn gần đến giới hạn. Nghe có vẻ tốt chứ?",

      // How It Works Section
      howItWorksStep1Title: "Trả lời một vài câu hỏi",
      howItWorksStep1Description:
        "Hãy cho chúng tôi biết về mục tiêu, thu nhập và tình hình tài chính hiện tại của bạn thông qua quy trình giới thiệu đơn giản",
      howItWorksStep2Title: "Gặp gỡ huấn luyện viên AI của bạn",
      howItWorksStep2Description:
        "Nhận những hiểu biết và lời khuyên cá nhân hóa phù hợp với giai đoạn tài chính và mục tiêu độc đáo của bạn",
      howItWorksStep3Title: "Thực hiện những bước nhỏ hàng ngày",
      howItWorksStep3Description:
        "Xây dựng thói quen tài chính lâu dài thông qua các hành động hàng ngày có hướng dẫn và theo dõi tiến độ nhất quán",

      // Financial Stages Section
      financialStagesMainTitle: "Lời khuyên phát triển cùng bạn",
      financialStagesMainDescription:
        "Dù bạn đang ở đâu trong hành trình tài chính, chúng tôi sẽ gặp bạn tại đó và hướng dẫn bạn tiến lên",
      stageDebtTitle: "Nợ",
      stageDebtDescription:
        "Kế hoạch chiến lược để loại bỏ nợ và thoát khỏi căng thẳng tài chính",
      stageBuildingTitle: "Xây dựng nền tảng",
      stageBuildingDescription:
        "Thiết lập quỹ khẩn cấp và tạo nền tảng tài chính vững chắc",
      stageInvestingTitle: "Bắt đầu đầu tư",
      stageInvestingDescription:
        "Học những kiến thức cơ bản về đầu tư và bắt đầu xây dựng tài sản dài hạn",
      stageOptimizeTitle: "Tối ưu hóa tài sản",
      stageOptimizeDescription:
        "Tinh chỉnh danh mục đầu tư và tối đa hóa lợi nhuận trên các khoản đầu tư của bạn",
      stageProtectTitle: "Bảo vệ tài sản",
      stageProtectDescription:
        "Bảo vệ tài sản của bạn bằng bảo hiểm và chiến lược lập kế hoạch di sản",

      // Key Features Section
      keyFeaturesMainTitle: "Mọi thứ bạn cần trong một nơi",
      featureBudgetTitle: "Theo dõi ngân sách",
      featureBudgetDescription:
        "Tự động phân loại chi phí và theo dõi mô hình chi tiêu với những hiểu biết thông minh",
      featureDebtTitle: "Hướng dẫn nợ",
      featureDebtDescription:
        "Nhận chiến lược cá nhân hóa để trả nợ nhanh hơn và tiết kiệm hàng nghìn đô la tiền lãi",
      featureInvestmentTitle: "Lập kế hoạch đầu tư",
      featureInvestmentDescription:
        "Xây dựng tài sản với những khuyến nghị đầu tư phù hợp dựa trên mức độ rủi ro của bạn",
      featureAITitle: "Tương tác nhỏ AI",
      featureAIDescription:
        "Kiểm tra hàng ngày và thông báo thông minh để giữ bạn có động lực và đi đúng hướng",
      featureProgressTitle: "Theo dõi tiến độ",
      featureProgressDescription:
        "Hình dung sự phát triển tài chính của bạn với các mốc quan trọng rõ ràng và kỷ niệm thành tích",
      emergencyFund: "QUỸ KHẨN CẤP",
      investments: "ĐẦU TƯ",
      debtPayoff: "TRẢ NỢ",
      thisMonth: "tháng này",

      // Testimonial Section
      testimonialQuote:
        "Bạn không cần phải là chuyên gia tài chính. Bạn chỉ cần một huấn luyện viên gặp bạn ở nơi bạn đang ở — và tiếp tục xuất hiện.",
      testimonialName: "Sarah M.",
      testimonialRole: "Quản lý Marketing, 29 tuổi",
      testimonialText:
        "Tôi đã chuyển từ việc tránh né tài chính sang thực sự mong chờ các buổi kiểm tra hàng tuần. Huấn luyện viên AI của tôi không phán xét — nó chỉ giúp tôi đưa ra quyết định tốt hơn, từng bước nhỏ một. Tôi đã tiết kiệm được $3,000 chỉ trong 4 tháng!",

      // CTA Section
      ctaMainTitle: "Bắt đầu xây dựng tương lai của bạn —",
      ctaMainSubtitle: "từng bước nhỏ một",
      ctaMainDescription:
        "Tham gia cùng hàng nghìn chuyên gia đã thay đổi cuộc sống tài chính của họ với hướng dẫn AI cá nhân hóa",
      ctaMainButton: "Tạo kế hoạch của bạn — miễn phí",
      ctaDisclaimer:
        "Không cần thẻ tín dụng • Bắt đầu trong vòng chưa đầy 2 phút",

      // Footer
      footerCompanyName: "Infina PFA",
      footerCompanyDescription:
        "Cố vấn tài chính cá nhân được hỗ trợ bởi AI của bạn, giúp bạn xây dựng tài sản từng bước một.",

      // Footer Navigation
      productSection: "Sản phẩm",
      companySection: "Công ty",
      legalSection: "Pháp lý",

      // Product Links
      featuresLink: "Tính năng",
      howItWorksLink: "Cách thức hoạt động",
      pricingLink: "Giá cả",
      securityLink: "Bảo mật",

      // Company Links
      aboutLink: "Giới thiệu",
      faqLink: "Câu hỏi thường gặp",
      blogLink: "Blog",
      contactLink: "Liên hệ",

      // Legal Links
      privacyLink: "Quyền riêng tư",
      termsLink: "Điều khoản",
      cookiesLink: "Cookie",
      licensesLink: "Giấy phép",

      // Newsletter
      newsletterTitle: "Cập nhật thông tin",
      newsletterDescription:
        "Nhận mẹo tài chính, cập nhật sản phẩm và những hiểu biết độc quyền được gửi đến hộp thư của bạn",
      emailPlaceholder: "Nhập email của bạn",
      subscribeButton: "Đăng ký",

      // Footer Bottom
      allRightsReservedFull: "© 2025 Infina PFA. Bảo lưu mọi quyền.",
      madeWithLove: "Được tạo ra với",
      forFinancialFreedom: "cho tự do tài chính của bạn",
    },
  },
  en: {
    translation: {
      // Navigation
      home: "Home",
      features: "Features",
      about: "About",
      contact: "Contact",

      // Hero Section
      heroTitle: "Smart Financial Management with AI",
      heroSubtitle:
        "Infina PFA helps you plan your personal finances easily and effectively with the power of artificial intelligence",
      getStarted: "Get Started",
      learnMore: "Learn More",

      // How It Works
      howItWorksTitle: "How It Works",
      howItWorksSubtitle:
        "Three simple steps to start your smart financial management journey",

      // Financial Stages
      financialStagesTitle: "Financial Stages",
      financialStagesSubtitle:
        "Supporting you from the first steps to long-term goals",

      // Key Features
      keyFeaturesTitle: "Key Features",
      keyFeaturesSubtitle:
        "Powerful tools to help you manage your finances effectively",

      // Testimonials
      testimonialsTitle: "What Our Customers Say",
      testimonialsSubtitle:
        "Thousands of users have trusted and succeeded with Infina PFA",

      // CTA Section
      ctaTitle: "Ready to start your financial journey?",
      ctaSubtitle:
        "Join thousands of users who have changed the way they manage their finances",
      ctaButton: "Start Free",

      // Footer
      footerDescription:
        "Infina PFA - Smart personal financial assistant that helps you achieve your financial goals easily and effectively.",
      quickLinks: "Quick Links",
      followUs: "Follow Us",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      allRightsReserved: "All rights reserved.",

      // Language
      language: "Language",
      vietnamese: "Tiếng Việt",
      english: "English",

      // Hero Section - Detailed
      heroMainTitle: "Your AI Financial Coach —",
      heroSubTitle: "One Step Closer to Freedom",
      heroDescription:
        "Track your money. Get smart advice. Grow your wealth — without overwhelm.",
      startFreeJourney: "Start your free journey",

      // AI Chat Content
      aiCoach: "Your AI coach",
      onlineNow: "Online now",
      aiMessage1:
        "I noticed you spent $247 on dining out this week. That's 23% more than your usual budget. Would you like me to suggest some strategies to help you stay on track?",
      userResponse: "Yes, please help me with that",
      aiMessage2:
        "Great! Here are 3 simple steps: 1) Try meal prepping on Sundays, 2) Set a daily dining limit of $25, 3) I'll send you a gentle reminder when you're close to your limit. Sound good?",

      // How It Works Section
      howItWorksStep1Title: "Answer a few questions",
      howItWorksStep1Description:
        "Tell us about your goals, income, and current financial situation through a simple onboarding process",
      howItWorksStep2Title: "Meet your AI coach",
      howItWorksStep2Description:
        "Get personalized insights and advice tailored to your unique financial stage and goals",
      howItWorksStep3Title: "Take small daily steps",
      howItWorksStep3Description:
        "Build lasting financial habits through guided daily actions and consistent progress tracking",

      // Financial Stages Section
      financialStagesMainTitle: "Advice that grows with you",
      financialStagesMainDescription:
        "No matter where you are in your financial journey, we meet you there and guide you forward",
      stageDebtTitle: "Debt",
      stageDebtDescription:
        "Strategic plans to eliminate debt and break free from financial stress",
      stageBuildingTitle: "Building foundation",
      stageBuildingDescription:
        "Establish emergency funds and create strong financial fundamentals",
      stageInvestingTitle: "Start investing",
      stageInvestingDescription:
        "Learn investment basics and begin building long-term wealth",
      stageOptimizeTitle: "Optimize assets",
      stageOptimizeDescription:
        "Fine-tune your portfolio and maximize returns on your investments",
      stageProtectTitle: "Protect assets",
      stageProtectDescription:
        "Safeguard your wealth with insurance and estate planning strategies",

      // Key Features Section
      keyFeaturesMainTitle: "Everything you need in one place",
      featureBudgetTitle: "Budget tracking",
      featureBudgetDescription:
        "Automatically categorize expenses and track spending patterns with intelligent insights",
      featureDebtTitle: "Debt guidance",
      featureDebtDescription:
        "Get personalized strategies to pay off debt faster and save thousands in interest",
      featureInvestmentTitle: "Investment planning",
      featureInvestmentDescription:
        "Build wealth with tailored investment recommendations based on your risk tolerance",
      featureAITitle: "AI micro-interactions",
      featureAIDescription:
        "Daily check-ins and smart notifications to keep you motivated and on track",
      featureProgressTitle: "Progress tracking",
      featureProgressDescription:
        "Visualize your financial growth with clear milestones and achievement celebrations",
      emergencyFund: "EMERGENCY FUND",
      investments: "INVESTMENTS",
      debtPayoff: "DEBT PAYOFF",
      thisMonth: "this month",

      // Testimonial Section
      testimonialQuote:
        "You don't need to be a finance expert. You just need a coach who meets you where you are — and keeps showing up.",
      testimonialName: "Sarah M.",
      testimonialRole: "Marketing Manager, 29",
      testimonialText:
        "I went from avoiding my finances to actually looking forward to my weekly check-ins. My AI coach doesn't judge — it just helps me make better decisions, one small step at a time. I've saved $3,000 in just 4 months!",

      // CTA Section
      ctaMainTitle: "Start building your future —",
      ctaMainSubtitle: "one small step at a time",
      ctaMainDescription:
        "Join thousands of professionals who've transformed their financial lives with personalized AI guidance",
      ctaMainButton: "Create your plan — free",
      ctaDisclaimer: "No credit card required • Get started in under 2 minutes",

      // Footer
      footerCompanyName: "Infina PFA",
      footerCompanyDescription:
        "Your AI-powered personal financial advisor, helping you build wealth one step at a time.",

      // Footer Navigation
      productSection: "Product",
      companySection: "Company",
      legalSection: "Legal",

      // Product Links
      featuresLink: "Features",
      howItWorksLink: "How it works",
      pricingLink: "Pricing",
      securityLink: "Security",

      // Company Links
      aboutLink: "About",
      faqLink: "FAQ",
      blogLink: "Blog",
      contactLink: "Contact",

      // Legal Links
      privacyLink: "Privacy",
      termsLink: "Terms",
      cookiesLink: "Cookies",
      licensesLink: "Licenses",

      // Newsletter
      newsletterTitle: "Stay updated",
      newsletterDescription:
        "Get financial tips, product updates, and exclusive insights delivered to your inbox",
      emailPlaceholder: "Enter your email",
      subscribeButton: "Subscribe",

      // Footer Bottom
      allRightsReservedFull: "© 2025 Infina PFA. All rights reserved.",
      madeWithLove: "Made with",
      forFinancialFreedom: "for your financial freedom",
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: "vi", // Default language is Vietnamese
    fallbackLng: "vi", // Fallback to Vietnamese

    detection: {
      // Language detection settings
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
    },

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    react: {
      useSuspense: false, // Set to false to avoid suspense issues in SSR
    },
  });

export default i18n;
