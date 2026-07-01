import { describe, expect, it } from 'vitest';
import { customerSchema, petSchema } from './index';

describe('customer and pet validation', () => {
  it('accepts valid customer payloads', () => {
    const result = customerSchema.safeParse({
      name: 'Maya Tan',
      phone: '08123456789',
      email: 'maya@example.com',
    });

    expect(result.success).toBe(true);
  });

  it('rejects missing contact details for customers', () => {
    const result = customerSchema.safeParse({
      name: 'Maya Tan',
      phone: '   ',
      email: '',
    });

    expect(result.success).toBe(false);
  });

  it('accepts valid pet payloads', () => {
    const result = petSchema.safeParse({
      customerId: '11111111-1111-1111-1111-111111111111',
      name: 'Koko',
      species: 'Dog',
      breed: 'Shih Tzu',
      birthDate: '2022-01-10',
      weightKg: 6.5,
    });

    expect(result.success).toBe(true);
  });

  it('rejects pet payloads without required fields', () => {
    const result = petSchema.safeParse({
      customerId: '',
      name: '',
      species: '',
      breed: '',
      weightKg: -1,
    });

    expect(result.success).toBe(false);
  });
});
