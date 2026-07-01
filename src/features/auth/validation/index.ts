import { z } from 'zod';
import { pinSchema, usernameSchema } from '../../shared/validation';

export const loginSchema = z.object({
  username: usernameSchema,
  pin: pinSchema,
});

export const createUserSchema = z.object({
  username: usernameSchema,
  pin: pinSchema,
  displayName: z.string().trim().min(2).max(80),
  role: z.enum(['owner', 'doctor', 'staff', 'customer']),
  status: z.enum(['active', 'inactive']).optional(),
});

export const resetPinSchema = z.object({
  pin: pinSchema,
});

export const updateRoleSchema = z.object({
  role: z.enum(['owner', 'doctor', 'staff', 'customer']),
});
