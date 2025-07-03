# Input Validation Rules Guide

This document provides examples of how to use the input validation rules in the Infina PFA application.

## Validation Rules

The following validation rules have been implemented:

- **Name/Title Input**: Min 3 characters, max 40 characters
- **Description Input**: Max 100 characters
- **Chat Message Input**: Max 500 characters
- **Money Input**: Max value 999,999,999,999,999 VND with proper formatting
- **Number Input**: Max value 999,999,999,999 with proper formatting

## Usage Examples

### 1. Using Validation Rules with Form Components

```tsx
import { useFormValidation } from "@/hooks/use-form-validation";
import { inputValidationRules } from "@/lib/validation/input-validation";
import { FormInput } from "@/components/ui/form-input";
import { MoneyInput, NumberInput } from "@/components/ui";

const MyForm = () => {
  const {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    validateAllFields,
  } = useFormValidation(
    {
      title: "",
      description: "",
      amount: "",
      quantity: "",
    },
    {
      title: inputValidationRules.name,
      description: inputValidationRules.description,
      amount: inputValidationRules.money,
      quantity: inputValidationRules.number,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAllFields()) {
      // Form is valid, proceed with submission
      console.log("Form submitted:", values);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormInput
        label="Title"
        value={values.title}
        onChange={(value) => setFieldValue("title", value)}
        onBlur={() => setFieldTouched("title")}
        error={errors.title}
        touched={touched.title}
        required
      />

      <FormInput
        label="Description"
        value={values.description}
        onChange={(value) => setFieldValue("description", value)}
        onBlur={() => setFieldTouched("description")}
        error={errors.description}
        touched={touched.description}
      />

      <MoneyInput
        label="Amount (VND)"
        value={values.amount}
        onChange={(value) => setFieldValue("amount", value)}
        onBlur={() => setFieldTouched("amount")}
        error={errors.amount}
        touched={touched.amount}
        required
      />

      <NumberInput
        label="Quantity"
        value={values.quantity}
        onChange={(value) => setFieldValue("quantity", value)}
        onBlur={() => setFieldTouched("quantity")}
        error={errors.quantity}
        touched={touched.quantity}
        required
      />

      <button
        type="submit"
        className="bg-[#0055FF] text-white px-4 py-2 rounded-md"
      >
        Submit
      </button>
    </form>
  );
};
```

### 2. Using Chat Input with Character Limit

The ChatInput component has been updated to enforce the 500 character limit:

```tsx
import { useState } from "react";
import { ChatInput } from "@/components/chat/chat-input";

const ChatExample = () => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Process message
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    setMessage("");
    setIsSubmitting(false);
  };

  return (
    <div className="h-[400px] flex flex-col">
      <div className="flex-1">{/* Chat messages would go here */}</div>

      <ChatInput
        value={message}
        onChange={setMessage}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
```

### 3. Manual Validation

You can also use the validation rules directly:

```tsx
import { validateField } from "@/lib/validation/form-validation";
import { inputValidationRules } from "@/lib/validation/input-validation";

// Validate a name field
const nameError = validateField("Jo", inputValidationRules.name);
console.log(nameError); // "Must be at least 3 characters"

// Validate a money amount
const amountError = validateField(
  "1000000000000000",
  inputValidationRules.money
);
console.log(amountError); // "Amount is too large"
```

### 4. Formatting Numbers and Currency

The validation module also provides utility functions for formatting:

```tsx
import {
  formatVND,
  formatNumber,
  parseFormattedNumber,
} from "@/lib/validation/input-validation";

// Format as VND currency
const formattedAmount = formatVND(1500000);
console.log(formattedAmount); // "1.500.000 ₫"

// Format as number with thousand separators
const formattedNumber = formatNumber(1500000);
console.log(formattedNumber); // "1.500.000"

// Parse a formatted number back to a number
const parsedNumber = parseFormattedNumber("1.500.000 ₫");
console.log(parsedNumber); // 1500000
```

## Validation Rules Reference

| Input Type   | Min Length | Max Length | Max Value           | Required |
| ------------ | ---------- | ---------- | ------------------- | -------- |
| Name/Title   | 3          | 40         | -                   | Yes      |
| Description  | -          | 100        | -                   | No       |
| Chat Message | -          | 500        | -                   | Yes      |
| Money        | -          | -          | 999,999,999,999,999 | Yes      |
| Number       | -          | -          | 999,999,999,999     | Yes      |
