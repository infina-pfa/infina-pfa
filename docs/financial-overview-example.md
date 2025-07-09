# Financial Overview Component Usage Guide

This guide demonstrates how to use the `FinancialOverviewCard` and `FinancialOverviewMessage` components to display a user's financial overview in the chat interface.

## Basic Usage

The `FinancialOverviewMessage` component is designed to be used in a chat interface to display financial overview information. It automatically formats the data as a chat message with proper styling.

```tsx
import { FinancialOverviewMessage } from "@/components/chat";

// In your chat component
const ChatExample = () => {
  return (
    <div className="chat-container">
      {/* Other chat messages */}

      {/* Financial overview message for current month/year */}
      <FinancialOverviewMessage />

      {/* Or for a specific month/year */}
      <FinancialOverviewMessage month={5} year={2025} />
    </div>
  );
};
```

## Using the Card Component Directly

If you need more control over the presentation, you can use the `FinancialOverviewCard` component directly:

```tsx
import { FinancialOverviewCard } from "@/components/chat";

const FinancialDashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="w-full max-w-md">
        <FinancialOverviewCard />
      </div>

      {/* Other dashboard components */}
    </div>
  );
};
```

## Integration with AI Chat Flow

To integrate the financial overview into the AI advisor chat flow:

```tsx
import { useEffect } from "react";
import { useChatFlow } from "@/hooks/use-chat-flow";
import { FinancialOverviewMessage } from "@/components/chat";

const AIChatInterface = () => {
  const { messages, sendMessage } = useChatFlow();

  const handleFinancialOverviewRequest = () => {
    // When user asks for financial overview
    return <FinancialOverviewMessage />;
  };

  return (
    <div className="chat-interface">
      {messages.map((message) => {
        if (message.type === "financial-overview") {
          return <FinancialOverviewMessage key={message.id} />;
        }

        // Handle other message types
        return <RegularMessage key={message.id} message={message} />;
      })}
    </div>
  );
};
```

## Component Features

The `FinancialOverviewCard` component:

1. Shows overall budget summary with progress bar
2. Displays income, expenses, and balance
3. Shows top 3 expense budgets with individual progress bars
4. Handles loading states and error messages
5. Supports internationalization through the translation system
6. Follows the Infina UI guidelines with flat, borderless design

## Customization

You can customize the appearance by modifying the component props:

```tsx
<FinancialOverviewCard
  month={3} // March
  year={2025}
/>
```

The component will automatically fetch the financial data for the specified month and year using the `useFinancialOverviewSWR` hook.
