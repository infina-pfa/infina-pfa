I want to create an onboarding flow to identify the user stage in of these stage (debt, no saving or start investing).

There are two questions the AI advisor must as to define the stage:
Q1. Bạn có bất kỳ khoản nợ nào, chẳng hạn như dư nợ thẻ tín dụng hoặc các khoản vay cá nhân, với lãi suất cao hơn 8% không (yes/no)
Q2. Nếu bạn mất nguồn thu nhập chính ngày hôm nay, bạn có đủ tiền mặt trong tài khoản tiết kiệm dễ tiếp cận để trang trải tất cả các chi phí sinh hoạt thiết yếu trong ít nhất ba tháng không?" (yes/no)

if the Q1 is yes -> user in debt, no matter what other response is
if the Q1 and Q2 no -> user has no saving
if Q1 no and Q2 yes -> user start investing

I want to show the onboarding in chat page (/chat). The flow will like this:

- After user login, check the database, table users, if user exist and onboarding_completed_at is not null -> user completed the onboarding
- Else user hasn't complete the onboarding
- Show a welcome message: "Xin chào! Tôi là Fina, cố vấn tài chính AI của bạn 🤝\n\nTôi ở đây để giúp bạn kiểm soát tương lai tài chính của mình và cung cấp hướng dẫn cụ thể phù hợp với tình hình tài chính hiện tại của bạn.\n\n✨ Để tôi có thể hỗ trợ bạn tốt nhất, hãy cho tôi biết bạn đang ở giai đoạn nào trong hành trình tài chính:"
- Show a another welcome message: "Tôi sẽ hỏi bạn 2 câu hỏi ngắn để xác định chính xác ưu tiên tài chính của bạn:"
- Show a component as a survey shows questions and options
- After user's done the last question, identify the user stage and store it into database, update table users or create new user in the table with field onboarding_completed_at and financial_stage
- Show the comfirmation about the financial stage and end the onboarding.
