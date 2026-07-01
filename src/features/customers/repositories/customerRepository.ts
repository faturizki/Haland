import type { CustomerPayload, CustomerRecord, PetPayload, PetRecord } from '../types';
import type { RepositoryContext } from '../../shared/utils/repositoryContract';

export interface CustomerRepository {
  listCustomers(includeArchived?: boolean, context?: RepositoryContext): Promise<CustomerRecord[]>;
  createCustomer(payload: CustomerPayload, createdBy: string, context?: RepositoryContext): Promise<CustomerRecord>;
  updateCustomer(id: string, payload: CustomerPayload, context?: RepositoryContext): Promise<CustomerRecord>;
  archiveCustomer(id: string, context?: RepositoryContext): Promise<void>;
  restoreCustomer(id: string, context?: RepositoryContext): Promise<void>;
  listPets(customerId: string, includeArchived?: boolean, context?: RepositoryContext): Promise<PetRecord[]>;
  createPet(payload: PetPayload, createdBy: string, context?: RepositoryContext): Promise<PetRecord>;
  updatePet(id: string, payload: PetPayload, context?: RepositoryContext): Promise<PetRecord>;
  archivePet(id: string, context?: RepositoryContext): Promise<void>;
  restorePet(id: string, context?: RepositoryContext): Promise<void>;
}
