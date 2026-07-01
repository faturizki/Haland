import { supabase } from '../../auth/lib/supabase';
import type { CustomerRepository } from './customerRepository';
import type { CustomerPayload, CustomerRecord, PetPayload, PetRecord } from '../types';
import { mapCustomerRow, mapPetRow } from './customerMapper';
import { toRepositoryError } from '../../shared/utils/repositoryError';
import { createRepositoryContext, type RepositoryContext } from '../../shared/utils/repositoryContract';
import { BaseRepository } from '../../shared/services/baseRepository';
import { createQueryBuilder } from '../../shared/utils/queryBuilder';

export const supabaseCustomerRepository: CustomerRepository = new (class extends BaseRepository implements CustomerRepository {
  async listCustomers(includeArchived = false, context: RepositoryContext = createRepositoryContext()): Promise<CustomerRecord[]> {
    const result = await this.executeWithContext('listCustomers', 'customers', async () => {
      const querySpec = createQueryBuilder('customers', 'id, name, phone, email, created_at, updated_at, deleted_at')
        .tenantScope(context.clinicId ?? 'default-clinic')
        .softDelete(includeArchived)
        .orderBy('created_at', 'desc')
        .toSpec();

      let query = supabase.from(querySpec.table).select(querySpec.select).order('created_at', { ascending: false });
      if (!includeArchived) {
        query = query.is('deleted_at', null);
      }

      const { data, error } = await query;
      if (error) {
        throw toRepositoryError(error);
      }

      return (data ?? []).map((row) => mapCustomerRow(row as unknown as Record<string, unknown>));
    }, context);

    return result.data;
  }

  async createCustomer(payload: CustomerPayload, createdBy: string, context: RepositoryContext = createRepositoryContext()): Promise<CustomerRecord> {
    const result = await this.executeWithContext('createCustomer', 'customers', async () => {
      const querySpec = createQueryBuilder('customers', 'id, name, phone, email, created_at, updated_at, deleted_at')
        .tenantScope(context.clinicId ?? 'default-clinic')
        .toSpec();
      const { data, error } = await supabase.from(querySpec.table).insert({
        name: payload.name,
        phone: payload.phone,
        email: payload.email?.trim() || null,
        created_by: createdBy,
      }).select('id, name, phone, email, created_at, updated_at, deleted_at').single();

      if (error) {
        throw toRepositoryError(error);
      }

      return mapCustomerRow(data as Record<string, unknown>);
    }, context);

    return result.data;
  }

  async updateCustomer(id: string, payload: CustomerPayload, context: RepositoryContext = createRepositoryContext()): Promise<CustomerRecord> {
    const result = await this.executeWithContext('updateCustomer', 'customers', async () => {
      const querySpec = createQueryBuilder('customers', 'id, name, phone, email, created_at, updated_at, deleted_at')
        .tenantScope(context.clinicId ?? 'default-clinic')
        .toSpec();
      const { data, error } = await supabase.from(querySpec.table).update({
        name: payload.name,
        phone: payload.phone,
        email: payload.email?.trim() || null,
      }).eq('id', id).select('id, name, phone, email, created_at, updated_at, deleted_at').single();

      if (error) {
        throw toRepositoryError(error);
      }

      return mapCustomerRow(data as Record<string, unknown>);
    }, context);

    return result.data;
  }

  async archiveCustomer(id: string, context: RepositoryContext = createRepositoryContext()): Promise<void> {
    await this.executeWithContext('archiveCustomer', 'customers', async () => {
      const querySpec = createQueryBuilder('customers', 'id').tenantScope(context.clinicId ?? 'default-clinic').toSpec();
      const { error } = await supabase.from(querySpec.table).update({ deleted_at: new Date().toISOString() }).eq('id', id);
      if (error) {
        throw toRepositoryError(error);
      }
      return undefined;
    }, context);
  }

  async restoreCustomer(id: string, context: RepositoryContext = createRepositoryContext()): Promise<void> {
    await this.executeWithContext('restoreCustomer', 'customers', async () => {
      const querySpec = createQueryBuilder('customers', 'id').tenantScope(context.clinicId ?? 'default-clinic').toSpec();
      const { error } = await supabase.from(querySpec.table).update({ deleted_at: null }).eq('id', id);
      if (error) {
        throw toRepositoryError(error);
      }
      return undefined;
    }, context);
  }

  async listPets(customerId: string, includeArchived = false, context: RepositoryContext = createRepositoryContext()): Promise<PetRecord[]> {
    const result = await this.executeWithContext('listPets', 'pets', async () => {
      const querySpec = createQueryBuilder('pets', 'id, customer_id, name, species, breed, birth_date, weight_kg, created_at, updated_at, deleted_at')
        .tenantScope(context.clinicId ?? 'default-clinic')
        .softDelete(includeArchived)
        .where('customer_id', customerId)
        .orderBy('created_at', 'desc')
        .toSpec();
      let query = supabase.from(querySpec.table).select(querySpec.select).eq('customer_id', customerId).order('created_at', { ascending: false });
      if (!includeArchived) {
        query = query.is('deleted_at', null);
      }

      const { data, error } = await query;
      if (error) {
        throw toRepositoryError(error);
      }

      return (data ?? []).map((row) => mapPetRow(row as unknown as Record<string, unknown>));
    }, context);

    return result.data;
  }

  async createPet(payload: PetPayload, createdBy: string, context: RepositoryContext = createRepositoryContext()): Promise<PetRecord> {
    const result = await this.executeWithContext('createPet', 'pets', async () => {
      const querySpec = createQueryBuilder('pets', 'id, customer_id, name, species, breed, birth_date, weight_kg, created_at, updated_at, deleted_at')
        .tenantScope(context.clinicId ?? 'default-clinic')
        .toSpec();
      const { data, error } = await supabase.from(querySpec.table).insert({
        customer_id: payload.customerId,
        name: payload.name,
        species: payload.species,
        breed: payload.breed,
        birth_date: payload.birthDate?.trim() || null,
        weight_kg: payload.weightKg,
        created_by: createdBy,
      }).select('id, customer_id, name, species, breed, birth_date, weight_kg, created_at, updated_at, deleted_at').single();

      if (error) {
        throw toRepositoryError(error);
      }

      return mapPetRow(data as Record<string, unknown>);
    }, context);

    return result.data;
  }

  async updatePet(id: string, payload: PetPayload, context: RepositoryContext = createRepositoryContext()): Promise<PetRecord> {
    const result = await this.executeWithContext('updatePet', 'pets', async () => {
      const querySpec = createQueryBuilder('pets', 'id, customer_id, name, species, breed, birth_date, weight_kg, created_at, updated_at, deleted_at')
        .tenantScope(context.clinicId ?? 'default-clinic')
        .toSpec();
      const { data, error } = await supabase.from(querySpec.table).update({
        customer_id: payload.customerId,
        name: payload.name,
        species: payload.species,
        breed: payload.breed,
        birth_date: payload.birthDate?.trim() || null,
        weight_kg: payload.weightKg,
      }).eq('id', id).select('id, customer_id, name, species, breed, birth_date, weight_kg, created_at, updated_at, deleted_at').single();

      if (error) {
        throw toRepositoryError(error);
      }

      return mapPetRow(data as Record<string, unknown>);
    }, context);

    return result.data;
  }

  async archivePet(id: string, context: RepositoryContext = createRepositoryContext()): Promise<void> {
    await this.executeWithContext('archivePet', 'pets', async () => {
      const querySpec = createQueryBuilder('pets', 'id').tenantScope(context.clinicId ?? 'default-clinic').toSpec();
      const { error } = await supabase.from(querySpec.table).update({ deleted_at: new Date().toISOString() }).eq('id', id);
      if (error) {
        throw toRepositoryError(error);
      }
      return undefined;
    }, context);
  }

  async restorePet(id: string, context: RepositoryContext = createRepositoryContext()): Promise<void> {
    await this.executeWithContext('restorePet', 'pets', async () => {
      const querySpec = createQueryBuilder('pets', 'id').tenantScope(context.clinicId ?? 'default-clinic').toSpec();
      const { error } = await supabase.from(querySpec.table).update({ deleted_at: null }).eq('id', id);
      if (error) {
        throw toRepositoryError(error);
      }
      return undefined;
    }, context);
  }
})();
