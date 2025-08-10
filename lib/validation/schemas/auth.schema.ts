import { z } from 'zod';

// Base email schema
export const emailSchema = z
  .string()
  .min(1, 'emailRequired')
  .email('invalidEmail')
  .toLowerCase()
  .trim();

// Base password schema
export const passwordSchema = z
  .string()
  .min(1, 'passwordRequired')
  .min(6, 'passwordTooShort');

// Sign in schema
export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Sign up schema with password confirmation
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'confirmPasswordRequired'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'passwordsDontMatch',
  path: ['confirmPassword'],
});

// Type inference
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password schema
export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'confirmPasswordRequired'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'passwordsDontMatch',
  path: ['confirmPassword'],
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;