import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(120),
  phone: z.string().trim().min(3, 'Phone number is required').max(32),
  email: z.union([z.string().trim().email('Email must be valid'), z.literal('')]).optional(),
});

export const petSchema = z.object({
  customerId: z.string().trim().min(1, 'Customer is required'),
  name: z.string().trim().min(2, 'Pet name is required').max(80),
  species: z.string().trim().min(2, 'Species is required').max(80),
  breed: z.string().trim().min(2, 'Breed is required').max(80),
  birthDate: z.union([z.string().trim().min(1), z.literal('')]).optional(),
  weightKg: z.coerce.number().min(0, 'Weight must be zero or greater'),
});
