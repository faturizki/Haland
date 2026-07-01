import type { CustomerRecord, PetRecord } from '../types';

export const mapCustomerRow = (row: Record<string, unknown>): CustomerRecord => ({
  id: String(row.id ?? ''),
  name: String(row.name ?? ''),
  phone: String(row.phone ?? ''),
  email: typeof row.email === 'string' ? row.email : null,
  createdAt: String(row.created_at ?? ''),
  updatedAt: String(row.updated_at ?? ''),
  deletedAt: typeof row.deleted_at === 'string' ? row.deleted_at : null,
});

export const mapPetRow = (row: Record<string, unknown>): PetRecord => ({
  id: String(row.id ?? ''),
  customerId: String(row.customer_id ?? ''),
  name: String(row.name ?? ''),
  species: String(row.species ?? ''),
  breed: String(row.breed ?? ''),
  birthDate: typeof row.birth_date === 'string' ? row.birth_date : null,
  weightKg: Number(row.weight_kg ?? 0),
  createdAt: String(row.created_at ?? ''),
  updatedAt: String(row.updated_at ?? ''),
  deletedAt: typeof row.deleted_at === 'string' ? row.deleted_at : null,
});
