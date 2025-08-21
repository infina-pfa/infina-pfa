export interface CreateDebtRequest {
  lender: string;
  purpose: string;
  rate: number;
  dueDate: Date;
  amount: number;
  currentPaidAmount?: number;
}

export interface UpdateDebtRequest {
  lender?: string;
  purpose?: string;
  rate?: number;
  dueDate?: Date;
}

export interface PayDebtRequest {
  amount: number;
  name?: string;
  description?: string;
}

export interface DebtResponse {
  id: string;
  userId: string;
  lender: string;
  purpose: string;
  rate: number;
  dueDate: string;
  amount: number;
  currentPaidAmount: number;
  createdAt: string;
  updatedAt: string;
  payments?: PaymentResponse[];
}

export interface DebtDetailResponse extends DebtResponse {
  payments: PaymentResponse[];
}

export interface PaymentResponse {
  id: string;
  name: string;
  description: string;
  amount: number;
  type: 'debt_payment';
  recurring: number;
  createdAt: string;
  updatedAt: string;
  debt?: DebtSimple;
}

export interface DebtSimple {
  id: string;
  userId: string;
  amount: number;
  rate: number;
  dueDate: string;
  lender: string;
  purpose: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyPaymentResponse {
  monthlyPayment: number;
}

export enum DebtErrorCode {
  DEBT_NOT_FOUND = 'DEBT_NOT_FOUND',
  DEBT_INVALID_AMOUNT = 'DEBT_INVALID_AMOUNT',
  DEBT_PAYMENT_NOT_FOUND = 'DEBT_PAYMENT_NOT_FOUND',
  DEBT_ACCESS_DENIED = 'DEBT_ACCESS_DENIED',
}