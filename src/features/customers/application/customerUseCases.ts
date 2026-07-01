import type { CustomerPayload, CustomerRecord, PetPayload, PetRecord } from '../types';
import type { CustomerRepository } from '../repositories/customerRepository';

export interface CustomerUseCases {
  listCustomers(includeArchived?: boolean): Promise<CustomerRecord[]>;
  createCustomer(payload: CustomerPayload, createdBy: string): Promise<CustomerRecord>;
  updateCustomer(id: string, payload: CustomerPayload): Promise<CustomerRecord>;
  archiveCustomer(id: string): Promise<void>;
  restoreCustomer(id: string): Promise<void>;
  listPets(customerId: string, includeArchived?: boolean): Promise<PetRecord[]>;
  createPet(payload: PetPayload, createdBy: string): Promise<PetRecord>;
  updatePet(id: string, payload: PetPayload): Promise<PetRecord>;
  archivePet(id: string): Promise<void>;
  restorePet(id: string): Promise<void>;
}

export const createCustomerUseCases = (repository: CustomerRepository): CustomerUseCases => ({
  async listCustomers(includeArchived = false) {
    return repository.listCustomers(includeArchived);
  },
  async createCustomer(payload, createdBy) {
    return repository.createCustomer(payload, createdBy);
  },
  async updateCustomer(id, payload) {
    return repository.updateCustomer(id, payload);
  },
  async archiveCustomer(id) {
    return repository.archiveCustomer(id);
  },
  async restoreCustomer(id) {
    return repository.restoreCustomer(id);
  },
  async listPets(customerId, includeArchived = false) {
    return repository.listPets(customerId, includeArchived);
  },
  async createPet(payload, createdBy) {
    return repository.createPet(payload, createdBy);
  },
  async updatePet(id, payload) {
    return repository.updatePet(id, payload);
  },
  async archivePet(id) {
    return repository.archivePet(id);
  },
  async restorePet(id) {
    return repository.restorePet(id);
  },
});
