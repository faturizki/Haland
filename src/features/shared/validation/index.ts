import { z } from 'zod';

export const emailSchema = z.string().trim().email();
export const passwordSchema = z.string().min(8);
export const pinSchema = z.string().regex(/^\d{6}$/);
export const usernameSchema = z.string().trim().min(3).max(32).regex(/^[a-z0-9]+$/i);

export const authFormSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const createValidationError = (message: string) => ({
  code: 'validation_error',
  message,
});
