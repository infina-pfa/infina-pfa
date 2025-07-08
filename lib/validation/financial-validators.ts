/**
 * Centralized financial validation utilities
 * Following single responsibility principle - each validator has one clear purpose
 */

export const amountValidator = {
  /**
   * Validate if amount is a positive number
   */
  isPositive(amount: number | undefined | null): boolean {
    return amount !== undefined && amount !== null && amount > 0;
  },

  /**
   * Validate amount with custom error message
   */
  validatePositive(
    amount: number | undefined | null,
    entityType: string
  ): void {
    if (!this.isPositive(amount)) {
      throw new Error(`${entityType} amount must be greater than 0`);
    }
  },
};

export const dateValidator = {
  /**
   * Check if date is not in the future
   */
  isNotInFuture(date: string | Date): boolean {
    const checkDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    return checkDate <= today;
  },

  /**
   * Validate date is not in future with custom error message
   */
  validateNotInFuture(date: string | Date, entityType: string): void {
    if (!this.isNotInFuture(date)) {
      throw new Error(`${entityType} date cannot be in the future`);
    }
  },

  /**
   * Check if end date is after start date
   */
  isEndAfterStart(startDate: string | Date, endDate: string | Date): boolean {
    return new Date(endDate) > new Date(startDate);
  },

  /**
   * Validate date range
   */
  validateRange(startDate: string | Date, endDate: string | Date): void {
    if (!this.isEndAfterStart(startDate, endDate)) {
      throw new Error("End date must be after start date");
    }
  },
};

export const textValidator = {
  /**
   * Check if text is not empty after trimming
   */
  isNotEmpty(text: string | undefined | null): boolean {
    return Boolean(text?.trim());
  },

  /**
   * Validate text is not empty
   */
  validateNotEmpty(text: string | undefined | null, fieldName: string): void {
    if (!this.isNotEmpty(text)) {
      throw new Error(`${fieldName} is required`);
    }
  },

  /**
   * Check if text length is within limit
   */
  isWithinLimit(text: string | undefined | null, maxLength: number): boolean {
    return !text || text.length <= maxLength;
  },

  /**
   * Validate text length
   */
  validateLength(
    text: string | undefined | null,
    maxLength: number,
    fieldName: string
  ): void {
    if (!this.isWithinLimit(text, maxLength)) {
      throw new Error(`${fieldName} cannot exceed ${maxLength} characters`);
    }
  },
};

export const recurringValidator = {
  /**
   * Check if month number is valid (1-12)
   */
  isValidMonth(month: number | undefined | null): boolean {
    return month !== undefined && month !== null && month >= 1 && month <= 12;
  },

  /**
   * Validate recurring month
   */
  validateMonth(month: number | undefined | null): void {
    if (month !== undefined && month !== null && !this.isValidMonth(month)) {
      throw new Error("Recurring month must be between 1 and 12");
    }
  },

  /**
   * Check if recurring period is valid (0 for one-time, positive for recurring)
   */
  isValidRecurring(recurring: number | undefined | null): boolean {
    return recurring === undefined || recurring === null || recurring >= 0;
  },

  /**
   * Validate recurring period
   */
  validateRecurring(recurring: number | undefined | null): void {
    if (!this.isValidRecurring(recurring)) {
      throw new Error("Recurring period must be 0 or greater");
    }
  },
};

export const incomeValidator = {
  /**
   * Validate income creation data
   */
  validateCreate(data: {
    name?: string;
    amount?: number;
    description?: string;
    recurring?: number;
  }): void {
    textValidator.validateNotEmpty(data.name, "Income name");
    textValidator.validateLength(data.name, 100, "Income name");

    amountValidator.validatePositive(data.amount, "Income");

    if (data.description) {
      textValidator.validateLength(data.description, 500, "Income description");
    }

    recurringValidator.validateRecurring(data.recurring);
  },

  /**
   * Validate income update data
   */
  validateUpdate(data: {
    name?: string;
    amount?: number;
    description?: string;
    recurring?: number;
  }): void {
    if (data.name !== undefined) {
      textValidator.validateNotEmpty(data.name, "Income name");
      textValidator.validateLength(data.name, 100, "Income name");
    }

    if (data.amount !== undefined) {
      amountValidator.validatePositive(data.amount, "Income");
    }

    if (data.description !== undefined) {
      textValidator.validateLength(data.description, 500, "Income description");
    }

    if (data.recurring !== undefined) {
      recurringValidator.validateRecurring(data.recurring);
    }
  },
};
