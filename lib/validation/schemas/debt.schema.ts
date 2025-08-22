import { z } from 'zod';

// Base schemas
export const lenderSchema = z
  .string()
  .min(1, 'lenderRequired')
  .trim();

export const purposeSchema = z
  .string()
  .min(1, 'purposeRequired')
  .trim();

export const amountSchema = z
  .number()
  .positive('amountRequired')
  .min(0.01, 'amountRequired');

export const rateSchema = z
  .number()
  .min(0, 'rateInvalid')
  .max(100, 'rateInvalid');

export const dueDateSchema = z
  .date()
  .refine((date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, 'dueDatePast');

export const currentPaidAmountSchema = z
  .number()
  .min(0)
  .optional()
  .default(0);

// Create debt schema
export const createDebtSchema = z.object({
  lender: lenderSchema,
  purpose: purposeSchema,
  amount: amountSchema,
  rate: rateSchema,
  dueDate: dueDateSchema,
  currentPaidAmount: currentPaidAmountSchema,
});

// Update debt schema (without amount since it can't be edited)
export const updateDebtSchema = z.object({
  lender: lenderSchema,
  purpose: purposeSchema,
  rate: rateSchema,
  dueDate: dueDateSchema,
});

// Form data schemas (with string date for form inputs)
export const debtFormSchema = z.object({
  lender: lenderSchema,
  purpose: purposeSchema,
  amount: amountSchema,
  rate: rateSchema,
  dueDate: z.string().min(1, 'dueDateRequired'),
  currentPaidAmount: currentPaidAmountSchema,
});

// Type inference
export type CreateDebtFormData = z.infer<typeof createDebtSchema>;
export type UpdateDebtFormData = z.infer<typeof updateDebtSchema>;
export type DebtFormData = z.infer<typeof debtFormSchema>;