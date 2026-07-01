import { describe, expect, it } from 'vitest';
import { mapCustomerRow, mapPetRow } from './customerMapper';

describe('customerMapper', () => {
  it('maps customer rows', () => {
    expect(mapCustomerRow({ id: '1', name: 'Ada', phone: '123', email: 'ada@example.com', created_at: '2024-01-01T00:00:00.000Z', updated_at: '2024-01-01T00:00:00.000Z' })).toEqual(
      expect.objectContaining({ id: '1', name: 'Ada', phone: '123', email: 'ada@example.com' }),
    );
  });

  it('maps pet rows', () => {
    expect(mapPetRow({ id: '2', customer_id: '1', name: 'Milo', species: 'Dog', breed: 'Labrador', birth_date: '2020-01-01', weight_kg: 5 })).toEqual(
      expect.objectContaining({ id: '2', customerId: '1', name: 'Milo', species: 'Dog', breed: 'Labrador', weightKg: 5 }),
    );
  });
});
