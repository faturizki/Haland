import { supabase } from '../../auth/lib/supabase';
import type { CustomerRepository } from './customerRepository';
import { mapCustomerRow, mapPetRow } from './customerMapper';
import { toRepositoryError } from '../../shared/utils/repositoryError';

export const supabaseCustomerRepository: CustomerRepository = {
  async listCustomers(includeArchived = false) {
    let query = supabase.from('customers').select('id, name, phone, email, created_at, updated_at, deleted_at').order('created_at', { ascending: false });
    if (!includeArchived) {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query;
    if (error) {
      throw toRepositoryError(error);
    }

    return (data ?? []).map((row) => mapCustomerRow(row as Record<string, unknown>));
  },

  async createCustomer(payload, createdBy) {
    const { data, error } = await supabase.from('customers').insert({
      name: payload.name,
      phone: payload.phone,
      email: payload.email?.trim() || null,
      created_by: createdBy,
    }).select('id, name, phone, email, created_at, updated_at, deleted_at').single();

    if (error) {
      throw toRepositoryError(error);
    }

    return mapCustomerRow(data as Record<string, unknown>);
  },

  async updateCustomer(id, payload) {
    const { data, error } = await supabase.from('customers').update({
      name: payload.name,
      phone: payload.phone,
      email: payload.email?.trim() || null,
    }).eq('id', id).select('id, name, phone, email, created_at, updated_at, deleted_at').single();

    if (error) {
      throw toRepositoryError(error);
    }

    return mapCustomerRow(data as Record<string, unknown>);
  },

  async archiveCustomer(id) {
    const { error } = await supabase.from('customers').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) {
      throw toRepositoryError(error);
    }
  },

  async restoreCustomer(id) {
    const { error } = await supabase.from('customers').update({ deleted_at: null }).eq('id', id);
    if (error) {
      throw toRepositoryError(error);
    }
  },

  async listPets(customerId, includeArchived = false) {
    let query = supabase.from('pets').select('id, customer_id, name, species, breed, birth_date, weight_kg, created_at, updated_at, deleted_at').eq('customer_id', customerId).order('created_at', { ascending: false });
    if (!includeArchived) {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query;
    if (error) {
      throw toRepositoryError(error);
    }

    return (data ?? []).map((row) => mapPetRow(row as Record<string, unknown>));
  },

  async createPet(payload, createdBy) {
    const { data, error } = await supabase.from('pets').insert({
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
  },

  async updatePet(id, payload) {
    const { data, error } = await supabase.from('pets').update({
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
  },

  async archivePet(id) {
    const { error } = await supabase.from('pets').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) {
      throw toRepositoryError(error);
    }
  },

  async restorePet(id) {
    const { error } = await supabase.from('pets').update({ deleted_at: null }).eq('id', id);
    if (error) {
      throw toRepositoryError(error);
    }
  },
};
