# Product Requirements Document: AI-Powered Personal Finance Agent

**Version:** 1.0 **Date:** July 19, 2025 **Status:** Draft **Author:** Manus An India

## 1\. Overview

### 1.1. Product Vision

To create an AI-native financial agent that serves as a life-long, personalized partner for users on their journey to financial well-being. Unlike a simple chatbot that only gives advice, this agent will understand the user's complete financial context, retain memory of all interactions, and take proactive steps to help the user achieve their goals. The product is built around the AI as the core, not as an add-on.

### 1.2. Problem Statement

Young professionals in urban environments often struggle with financial discipline and planning. They may lack the knowledge to manage debt, the motivation to build savings, or the confidence to start investing. Existing tools are often passive, requiring significant manual input and failing to provide personalized, actionable guidance that adapts to a user's changing life circumstances.

### 1.3. Target Audience

* **Age:** 25-35  
* **Demographic:** Metropolitan and urban residents (e.g., in major Vietnamese cities).  
* **Profession:** White-collar professionals.  
* **Tech Savviness:** AI-Native; comfortable interacting with and trusting AI-driven platforms.

### 1.4. Goals & Success Metrics

* **User Goal:** To gain control over their finances, eliminate high-interest debt, build a stable emergency fund, and eventually grow their wealth.  
* **Product Goal:** To successfully guide users through three key financial stages: In Debt \-\> No Savings \-\> Investing.  
* **Success Metrics (MVP):**  
  * **Onboarding Completion Rate:** \>80% of new users complete the onboarding and set their first primary goal.  
  * **Goal Adherence:** \>60% of users in the "No Savings" stage successfully "Pay Themselves First" (PYF) in the first 5 days of the month.  
  * **Engagement:** \>40% Daily Active Users (DAU) interacting with the AI for guidance or to log information.  
  * **Retention:** \>50% of users remain active after 30 days.

## 2\. Functional Requirements & User Stories

### EPIC 1: User Onboarding & Initial Goal Setting

This epic covers the initial interaction a new user has with the platform, where the system identifies their financial stage and sets them on the correct path.

#### US 1.1: As a new user with no savings, I want to describe my financial situation and create my first goal of building an emergency fund.

* **Narrative:** A user signs up and is identified as being in the "No Savings" stage. The AI's primary objective is to guide them to establish a 3-month emergency fund.  
* **Dependencies:** User Authentication (Sign Up/Sign In).

**Workflow & Acceptance Criteria (AC):**

1. **Stage Identification:**  
     
   * **AC 1.1.1:** During onboarding, the system asks questions to determine the user's financial stage. If the user has no significant debt but less than one month of expenses saved, they are classified as "No Savings".

   

2. **Goal Recommendation & Education:**  
     
   * **AC 1.1.2:** The AI explains the importance of an emergency fund and convinces the user that this should be their primary goal.  
   * **AC 1.1.3:** The AI introduces the "Pay Yourself First" (PYF) concept, potentially via a short, engaging video (approx. 30s).

   

3. **Income & Goal Calculation:**  
     
   * **AC 1.1.4:** The AI asks for the user's monthly income to calculate a realistic emergency fund target (3x monthly income).  
   * **AC 1.1.5 (Edge Case):** If the user enters an income of 0, the AI asks for confirmation. If confirmed, it politely states it cannot help until the user has an income and ends the flow.  
   * **AC 1.1.6:** The AI asks the user for a target timeline to achieve the goal.  
     * If the user doesn't know, the AI suggests a default of 12 months, which requires saving \~25% of their income.  
     * If the user enters a timeline, the AI calculates the required monthly savings percentage. If this percentage is \>30% (especially for low-income users, e.g., \< 7 million VND), the AI warns them that this is very aggressive and asks for confirmation.

   

4. **Expense Data Collection (Budgeting Setup):**  
     
   * **AC 1.1.7:** The AI asks if the user wants to actively reduce expenses or just focus on saving. The subsequent flow is the same, but the AI's tone will differ.  
   * **AC 1.1.8:** The AI prompts the user to input their major monthly expenses via chat, suggesting default categories: 1\. Rent/Housing, 2\. Food, 3\. Transportation, 4\. Other. The system should allow users to input these values through natural language chat, which the AI will parse and categorize.  
   * **AC 1.1.9:** The system validates if the user's (Income \- Expenses) is greater than the required monthly savings.  
     * If not, the AI guides the user to reduce specific expense categories rather than lowering the savings goal.  
     * **(Edge Case):** If income is very low (\< 5 million VND), the AI suggests starting with a smaller savings goal (e.g., 10% of income) and focusing heavily on expense reduction.  
     * **(Edge Case):** If after adjustments, saving is still not feasible, the AI advises that its primary help will be expense control to prevent debt, and suggests radical solutions like moving to a lower-cost area.

   

5. **Fund Storage Recommendation:**  
     
   * **AC 1.1.10:** The AI asks where the user plans to keep their emergency fund.  
   * **AC 1.1.11:** Based on the user's answer (e.g., Bank CD, checking account), the AI explains the pros and cons, highlighting the need for liquidity and better returns.  
   * **AC 1.1.12:** The AI recommends a High-Yield Savings Account (HYSA) as the ideal place and suggests a specific partner product (e.g., Infina TKSL).

   

6. **Goal Confirmation:**  
     
   * **AC 1.1.13:** The system displays a "Single Goal" UI component summarizing the emergency fund goal (Total Amount, Timeline, Monthly Contribution) and asks for final confirmation.

#### US 1.2: As a user focused on building an emergency fund, I want to receive daily advice and actionable steps upon entering the application.

* **Narrative:** For users primarily focused on building their emergency fund, the AI acts as a daily financial coach, providing tailored guidance based on their progress and the time of the month.  
* **Dependencies:** User Authentication, Fund Tracking, Budgeting Tool Integration.

**Workflow & Acceptance Criteria (AC):**

1. **Start of the Month (Days 1):**  
     
   * **AC 1.2.1:** Upon login, the AI displays the user's emergency fund goal dashboard.  
   * **AC 1.2.2:** The AI reminds the user to "Pay Yourself First" (PYF) to their emergency fund and to allocate funds for essential monthly expenses (e.g., rent, electricity, recurring debt payments).  
   * **AC 1.2.3:** The system tracks whether the user has confirmed their PYF contribution. If not confirmed, the AI continues to prompt daily until confirmation is received.  
   * **AC 1.2.4 (Edge Case):** If the user has not confirmed PYF by the 5th day of the month, the AI asks for the reason to provide appropriate actionable suggestions:  
     * If the user states they haven't received their salary yet, the AI asks for their expected salary date and sets a reminder to prompt them again on that date.  
     * If the user states they had an unexpected expense (e.g., paying off last month's debt) and therefore cannot PYF the agreed amount, the AI advises them to cut down on other budget categories instead of reducing their PYF contribution.  
   * **AC 1.2.5 (Edge Case):** If the user confirms PYF but the amount is less than the agreed-upon contribution, the AI asks for the reason.  
     * If the user states they had an unexpected expense, the AI advises them to cut down on other budget categories to compensate for the reduced PYF amount.

   

2. **End of the Week (Saturday and Sunday):**  
     
   * **AC 1.2.6:** The AI asks the user for their total spending for the past week and prompts them to plan their spendable amount for the upcoming week.  
   * **AC 1.2.7 (Budget Adjustment \- Under-spending):** If the user has underspent their weekly budget, the remaining amount is added to the next week's budget. For example, if the weekly budget was 1,100,000 VND and spending was 1,000,000 VND, the next week's budget becomes 1,200,000 VND.  
   * **AC 1.2.8 (Budget Adjustment \- Over-spending):** If the user has overspent their weekly budget, the excess amount is deducted from the next week's budget. For example, if the weekly budget was 1,100,000 VND and spending was 1,500,000 VND, the next week's budget becomes 800,000 VND. The AI advises the user to cook at home for savings and reduce unnecessary spending for that week.  
   * **AC 1.2.9 (Significant Over-spending):** If the overspent amount is significantly large, the AI negotiates a revised plan with the user, which may involve deducting from each weekly budget for a set period. The AI emphasizes not dipping into the emergency fund (PYF amount).  
   * **AC 1.2.10:** This weekly review process continues until completed. If the user does not engage on Saturday or Sunday, the AI will prompt them at their next login.

   

3. **Normal Days in the Week (Monday-Friday):**  
     
   * **AC 1.2.11:** The AI reminds the user of their remaining budget for the current week.  
   * **AC 1.2.12 (Proactive Guidance \- Low Budget):** If the current week's budget is lower than the default amount (due to previous overspending), the AI advises: "You should ask me before spending something to make sure you won't go over the budget this week."  
   * **AC 1.2.13 (Proactive Guidance \- Healthy Budget):** If the weekly budget amount is greater than or equal to the default, the AI asks: "How can I help you today?"

   

4. **Last Day of the Month (Weekend of the last week):**  
     
   * **AC 1.2.14:** The AI asks the user for their total spending for the last week of the month.  
   * **AC 1.2.15 (Monthly Review \- Under-spending):** If the user underspent their budget for the last week, the AI advises them to save the surplus amount to their emergency fund to achieve their goal faster.  
   * **AC 1.2.16 (Monthly Review \- Over-spending):** If the user overspent their overall monthly budget, the AI deep dives into which budget categories were overspent and provides appropriate solutions based on the root cause. The AI also helps the user plan their budget for the next month based on the current month's data.

#### US 1.4: As a user also wanting to reduce monthly expenses, I want to receive daily advice and actionable steps upon entering the application.

* **Narrative:** For users actively working to reduce their monthly expenses in addition to building an emergency fund, the AI provides tailored daily guidance, focusing on both saving and expense management.  
* **Dependencies:** User Authentication, Emergency Fund Goal Tracking, Detailed Budgeting Tool Integration.

**Workflow & Acceptance Criteria (AC):**

1. **Start of the Month (Days 1):**  
     
   * **AC 1.4.1:** Upon login, the AI displays the user's emergency fund goal dashboard.  
   * **AC 1.4.2:** The AI reminds the user to "Pay Yourself First" (PYF) to their emergency fund.  
   * **AC 1.4.3:** The system tracks whether the user has confirmed their PYF contribution. If not confirmed, the AI continues to prompt daily until confirmation is received.  
   * **AC 1.4.4 (Edge Case):** If the user has not confirmed PYF by the 5th day of the month, the AI asks for the reason to provide appropriate actionable suggestions:  
     * If the user states they haven't received their salary yet, the AI asks for their expected salary date and sets a reminder to prompt them again on that date.  
     * If the user states they had an unexpected expense (e.g., paying off last month's debt) and therefore cannot PYF the agreed amount, the AI advises them to cut down on other budget categories instead of reducing their PYF contribution.  
   * **AC 1.4.5 (Edge Case):** If the user confirms PYF but the amount is less than the agreed-upon contribution, the AI asks for the reason.  
     * If the user states they had an unexpected expense, the AI advises them to cut down on other budget categories to compensate for the reduced PYF amount.

   

2. **Normal Days in the Month (Daily Interaction):**  
     
   * **AC 1.4.6:** The AI displays the budgeting dashboard to help the user control their spending after saving.  
   * **AC 1.4.7:** The AI asks the user to log their spending for the day: "What did you spend today?"

   

3. **Last Day of the Month (Weekend of the last week):**  
     
   * **AC 1.4.8:** The AI displays the budgeting dashboard.  
   * **AC 1.4.9 (Monthly Review \- Under-spending):** If the user has not overspent their overall monthly budget, the AI shows the Goal Dashboard and encourages the user to transfer any surplus amount to their emergency fund to accelerate goal achievement.  
   * **AC 1.4.10 (Monthly Review \- Over-spending):** If the user has overspent their overall monthly budget, the AI performs a deep dive to identify which budget categories were overspent. It then provides appropriate solutions based on the root cause of the overspending.  
   * **AC 1.4.11:** The AI helps the user plan their budget for the next month based on the current month's spending data and performance.

#### US 1.5: As a user, I want to receive feedback and solutions if I fail to meet my financial goals at the end of the month.

* **Narrative:** The AI provides constructive feedback and actionable solutions to users who have overspent or failed to meet their financial targets, categorizing the reasons for failure and offering tailored advice.  
* **Dependencies:** Monthly Spending Data, Budgeting Tool Integration, Goal Tracking.

**Workflow & Acceptance Criteria (AC):**

1. **Case 1: Overspending due to Lack of Discipline**  
     
   * **AC 1.5.1 (Definition):** This case is defined when the user consistently overspends multiple times (e.g., two months in a row, or two weeks in a row).  
   * **AC 1.5.2 (Solution):** The AI suggests more extreme methods to regain control:  
     * **Option A:** Advise the user to meticulously record every single expense daily.  
     * **Option B:** Recommend sending weekly budget allocations to a tiered savings account within the Infina app (or similar financial product) to restrict immediate access:  
       * **Tier 1 (FS or Casa):** Funds for immediate daily spending.  
       * **Tier 2 (TS 1 week):** Funds accessible after one week.  
       * **Tier 3 (TS 2 weeks):** Funds accessible after two weeks.  
       * **Tier 4 (TS 3 weeks):** Funds accessible after three weeks.

   

2. **Case 2: Overspending due to Unreasonable Budget**  
     
   * **AC 1.5.3 (Definition):** This case is defined when the user overspends multiple times (e.g., four weeks in a row) on the same budget category, but the amount of overspending is consistently within a small margin (e.g., ±10%) of an ideal spending number.  
   * **AC 1.5.4 (Solution):** The AI advises the user to rebalance their budget. If rebalancing is not sufficient, the AI suggests considering a change to the emergency fund (PYF) amount and/or extending the goal completion timeline.

   

3. **Case 3: Overspending due to Unexpected Events**  
     
   * **AC 1.5.5 (Definition):** This case is defined when the user attributes their overspending to an unexpected event (e.g., medical emergency, car repair).  
   * **AC 1.5.6 (Solution):** The AI provides solutions to help the user stay on track with their goal:  
     * Suggest raising the PYF contribution by a certain amount for the remainder of the month.  
     * Suggest extending the overall goal due date.  
     * Provide advice on how to prepare for future unexpected events (e.g., building a separate contingency fund).

#### US 1.6: As a financial advisor, I want to ensure the user remains focused on their financial goals.

* **Narrative:** The AI is designed to be a focused financial advisor. This user story outlines how the AI should handle user interactions that are off-topic, involve personal information, or touch upon advanced financial topics, ensuring the conversation remains productive and secure.  
* **Dependencies:** Natural Language Understanding (NLU) for intent classification, Security protocols.

**Workflow & Acceptance Criteria (AC):**

1. **Case 1: User Asks Unrelated Questions (MVP)**  
     
   * **AC 1.6.1 (Definition):** The user asks questions or makes requests that are unrelated to personal finance (e.g., "Describe a cow," "Help me write a function in Python").  
   * **AC 1.6.2 (Solution):** The AI immediately and politely rejects the request, stating that its purpose is to assist with personal finance matters.

   

2. **Case 2: User Provides Personal Information (Including Frustration) (MVP)**  
     
   * **AC 1.6.3 (Definition):** The user shares personal information, which may include expressions of frustration or distress.  
   * **AC 1.6.4 (Solution):**  
     * The AI empathizes with the user's situation.  
     * The AI assesses if the shared information has a direct impact on the user's financial goals.  
     * If there is no direct impact, the AI stops at the empathetic message.  
     * If there is a direct impact, the AI explains the financial implications and provides an actionable suggestion. For example, if the user says, "I broke my arm in a motorcycle accident," the AI would respond with empathy, advise focusing on health and recovery, and suggest using a portion of the emergency fund for medical expenses.

   

3. **Case 3: User Asks About Investing Topics (MVP)**  
     
   * **AC 1.6.5 (Definition):** The user asks about investment-related topics.  
   * **AC 1.6.6 (Solution):** The AI provides general knowledge and educational content about the investment topic. It does not provide specific investment advice until the user has progressed to the "Investing" stage.

   

4. **Case 4: User Request Violates Security Rules (e.g., Injection) (MVP)**  
     
   * **AC 1.6.7 (Definition):** The user's request attempts to manipulate the AI's behavior or access its internal thought processes.  
   * **AC 1.6.8 (Solution):** The AI must conceal its internal thought process. If a user asks why a particular action was performed, the AI should summarize the reason concisely using simple, non-sensitive language, without exposing its internal monologue.

