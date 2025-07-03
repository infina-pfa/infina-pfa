# @ui.mdc - Input Validation Rules

## Overview

This document outlines the standardized input validation rules for the Infina PFA application. These rules ensure consistent user experience and data integrity across all forms and input fields.

## Input Field Types & Validation Rules

### Text Inputs

| Input Type   | Min Length | Max Length | Required | Validation Rule                    |
| ------------ | ---------- | ---------- | -------- | ---------------------------------- |
| Name/Title   | 3          | 40         | Yes      | `inputValidationRules.name`        |
| Description  | -          | 100        | No       | `inputValidationRules.description` |
| Chat Message | -          | 500        | Yes      | `inputValidationRules.chatMessage` |

### Numeric Inputs

| Input Type | Format                       | Max Value           | Required | Validation Rule               |
| ---------- | ---------------------------- | ------------------- | -------- | ----------------------------- |
| Money      | VND currency with separators | 999,999,999,999,999 | Yes      | `inputValidationRules.money`  |
| Number     | Thousand separators          | 999,999,999,999     | Yes      | `inputValidationRules.number` |

## Components

### MoneyInput

A specialized input component for currency values that automatically formats the input as VND.

```tsx
import { MoneyInput } from "@/components/ui";

<MoneyInput
  label="Amount (VND)"
  value={amount}
  onChange={setAmount}
  onBlur={handleBlur}
  error={error}
  touched={touched}
  required
/>;
```

### NumberInput

A specialized input component for numeric values with thousand separators.

```tsx
import { NumberInput } from "@/components/ui";

<NumberInput
  label="Quantity"
  value={quantity}
  onChange={setQuantity}
  onBlur={handleBlur}
  error={error}
  touched={touched}
  required
/>;
```

### ChatInput

Enhanced chat input with 500 character limit and visual feedback.

```tsx
import { ChatInput } from "@/components/chat";

<ChatInput
  value={message}
  onChange={setMessage}
  onSubmit={handleSubmit}
  isSubmitting={isSubmitting}
/>;
```

## Visual Feedback

- **Error State**: Red underline (`#F44336`) with error message
- **Near Limit**: Yellow text (`#FFC107`) for character count when approaching limit (90%+)
- **Over Limit**: Red text (`#F44336`) for character count when over limit
- **Normal State**: Standard blue focus state (`#0055FF`)

## Implementation

### Using with Form Validation

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

### Direct Validation

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

### Formatting Utilities

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

## Design Guidelines

- All input components follow Infina's flat & borderless UI design
- Error states use the standard error color (`#F44336`)
- Warning states use the standard warning color (`#FFC107`)
- Focus states use the primary blue color (`#0055FF`)
- All components use the Nunito font family
- Text alignment for numeric inputs is right-aligned
- Text alignment for text inputs is left-aligned
