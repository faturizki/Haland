import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppShell } from '../../shared/components/AppShell';
import { DataTable } from '../../shared/components/DataTable';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { emptyStateMessage } from '../../shared/utils/empty';
import { useToast } from '../../shared/hooks/useToast';
import { useAuth } from '../../auth/hooks/useAuth';
import { createCustomerUseCases } from '../application/customerUseCases';
import { supabaseCustomerRepository } from '../repositories/supabaseCustomerRepository';
import { customerSchema, petSchema } from '../validation';
import type { CustomerPayload, CustomerRecord, PetPayload, PetRecord } from '../types';
import { canManageCustomers } from '../../auth/services/permissionService';

export const CustomerManagementScreen = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const customerUseCases = useMemo(() => createCustomerUseCases(supabaseCustomerRepository), []);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [pets, setPets] = useState<PetRecord[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);

  const customerForm = useForm<CustomerPayload>({ resolver: zodResolver(customerSchema), defaultValues: { name: '', phone: '', email: '' } });
  const petForm = useForm<PetPayload>({ resolver: zodResolver(petSchema), defaultValues: { customerId: '', name: '', species: '', breed: '', birthDate: '', weightKg: 0 } });

  const refreshCustomers = useCallback(async (showArchived = includeArchived) => {
    setIsLoading(true);
    setError(null);
    try {
      const nextCustomers = await customerUseCases.listCustomers(showArchived);
      setCustomers(nextCustomers);
      if (!selectedCustomerId && nextCustomers[0]) {
        setSelectedCustomerId(nextCustomers[0].id);
      }
    } catch (serviceError) {
      const message = serviceError instanceof Error ? serviceError.message : 'Unable to load customers.';
      setError(message);
      addToast({ title: 'Customers unavailable', description: message, variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [addToast, customerUseCases, includeArchived, selectedCustomerId]);

  const loadPets = useCallback(async (customerId: string, showArchived = includeArchived) => {
    setError(null);
    try {
      const nextPets = await customerUseCases.listPets(customerId, showArchived);
      setPets(nextPets);
      petForm.setValue('customerId', customerId);
    } catch (serviceError) {
      const message = serviceError instanceof Error ? serviceError.message : 'Unable to load pets.';
      setError(message);
      addToast({ title: 'Pets unavailable', description: message, variant: 'error' });
    }
  }, [addToast, customerUseCases, includeArchived, petForm]);

  useEffect(() => {
    void (async () => {
      await refreshCustomers(includeArchived);
    })();
  }, [includeArchived, refreshCustomers]);

  useEffect(() => {
    if (!selectedCustomerId) {
      return;
    }

    void (async () => {
      await loadPets(selectedCustomerId);
    })();
  }, [loadPets, selectedCustomerId]);

  const selectedCustomer = useMemo(() => customers.find((entry) => entry.id === selectedCustomerId) ?? null, [customers, selectedCustomerId]);
  const filteredCustomers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) {
      return customers;
    }

    return customers.filter((entry) => [entry.name, entry.phone, entry.email ?? ''].join(' ').toLowerCase().includes(query));
  }, [customers, searchQuery]);

  const resetCustomerForm = () => {
    customerForm.reset({ name: '', phone: '', email: '' });
    setEditingCustomerId(null);
  };

  const resetPetForm = () => {
    petForm.reset({ customerId: selectedCustomerId ?? '', name: '', species: '', breed: '', birthDate: '', weightKg: 0 });
    setEditingPetId(null);
  };

  const onCreateOrUpdateCustomer = async (values: CustomerPayload) => {
    if (!user || !canManageCustomers(user.role)) {
      setError('You are not permitted to manage customers.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (editingCustomerId) {
        await customerUseCases.updateCustomer(editingCustomerId, values);
        addToast({ title: 'Customer updated', description: 'The customer record was updated.', variant: 'success' });
      } else {
        const createdCustomer = await customerUseCases.createCustomer(values, user.id);
        setSelectedCustomerId(createdCustomer.id);
        addToast({ title: 'Customer created', description: 'The customer record was saved.', variant: 'success' });
      }
      await refreshCustomers(includeArchived);
      resetCustomerForm();
    } catch (serviceError) {
      const message = serviceError instanceof Error ? serviceError.message : 'Unable to save customer.';
      setError(message);
      addToast({ title: 'Customer save failed', description: message, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onArchiveCustomer = async (customerId: string) => {
    const confirmed = window.confirm('Archive this customer? The record will remain available for historical context.');
    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await customerUseCases.archiveCustomer(customerId);
      addToast({ title: 'Customer archived', description: 'The customer was archived.', variant: 'success' });
      await refreshCustomers(includeArchived);
    } catch (serviceError) {
      const message = serviceError instanceof Error ? serviceError.message : 'Unable to archive customer.';
      setError(message);
      addToast({ title: 'Archive failed', description: message, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRestoreCustomer = async (customerId: string) => {
    const confirmed = window.confirm('Restore this customer record?');
    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await customerUseCases.restoreCustomer(customerId);
      addToast({ title: 'Customer restored', description: 'The customer record was restored.', variant: 'success' });
      await refreshCustomers(includeArchived);
    } catch (serviceError) {
      const message = serviceError instanceof Error ? serviceError.message : 'Unable to restore customer.';
      setError(message);
      addToast({ title: 'Restore failed', description: message, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCreateOrUpdatePet = async (values: PetPayload) => {
    if (!user || !canManageCustomers(user.role)) {
      setError('You are not permitted to manage pets.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (editingPetId) {
        await customerUseCases.updatePet(editingPetId, values);
        addToast({ title: 'Pet updated', description: 'The pet record was updated.', variant: 'success' });
      } else {
        await customerUseCases.createPet(values, user.id);
        addToast({ title: 'Pet created', description: 'The pet record was saved.', variant: 'success' });
      }
      if (selectedCustomerId) {
        await loadPets(selectedCustomerId, includeArchived);
      }
      resetPetForm();
    } catch (serviceError) {
      const message = serviceError instanceof Error ? serviceError.message : 'Unable to save pet.';
      setError(message);
      addToast({ title: 'Pet save failed', description: message, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onArchivePet = async (petId: string) => {
    const confirmed = window.confirm('Archive this pet record?');
    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await customerUseCases.archivePet(petId);
      addToast({ title: 'Pet archived', description: 'The pet was archived.', variant: 'success' });
      if (selectedCustomerId) {
        await loadPets(selectedCustomerId, includeArchived);
      }
    } catch (serviceError) {
      const message = serviceError instanceof Error ? serviceError.message : 'Unable to archive pet.';
      setError(message);
      addToast({ title: 'Archive failed', description: message, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRestorePet = async (petId: string) => {
    const confirmed = window.confirm('Restore this pet record?');
    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await customerUseCases.restorePet(petId);
      addToast({ title: 'Pet restored', description: 'The pet record was restored.', variant: 'success' });
      if (selectedCustomerId) {
        await loadPets(selectedCustomerId, includeArchived);
      }
    } catch (serviceError) {
      const message = serviceError instanceof Error ? serviceError.message : 'Unable to restore pet.';
      setError(message);
      addToast({ title: 'Restore failed', description: message, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditingCustomer = (customer: CustomerRecord) => {
    customerForm.reset({ name: customer.name, phone: customer.phone, email: customer.email ?? '' });
    setEditingCustomerId(customer.id);
  };

  const startEditingPet = (pet: PetRecord) => {
    petForm.reset({ customerId: pet.customerId, name: pet.name, species: pet.species, breed: pet.breed, birthDate: pet.birthDate ?? '', weightKg: pet.weightKg });
    setEditingPetId(pet.id);
  };

  return (
    <AppShell title="Customer and pet management" description="Register customers and link pets to the clinic records.">
      {error ? <p className="form-error">{error}</p> : null}
      <div className="dashboard-grid">
        <section className="surface-card">
          <h2>Customers</h2>
          <label className="form-builder__field">
            <span>Search</span>
            <input id="customer-search" value={searchQuery} placeholder="Search by name or phone" onChange={(event) => setSearchQuery(event.target.value)} />
          </label>
          <label className="form-builder__field checkbox-row" htmlFor="include-archived-customers">
            <input id="include-archived-customers" type="checkbox" checked={includeArchived} onChange={(event) => setIncludeArchived(event.target.checked)} />
            <span>Include archived</span>
          </label>
          <form onSubmit={customerForm.handleSubmit(onCreateOrUpdateCustomer)} className="form-builder">
            <label className="form-builder__field" htmlFor="customer-name">
              <span>Name</span>
              <input id="customer-name" {...customerForm.register('name')} />
            </label>
            {customerForm.formState.errors.name ? <p className="form-error">{customerForm.formState.errors.name.message}</p> : null}
            <label className="form-builder__field" htmlFor="customer-phone">
              <span>Phone</span>
              <input id="customer-phone" {...customerForm.register('phone')} />
            </label>
            {customerForm.formState.errors.phone ? <p className="form-error">{customerForm.formState.errors.phone.message}</p> : null}
            <label className="form-builder__field" htmlFor="customer-email">
              <span>Email</span>
              <input id="customer-email" {...customerForm.register('email')} />
            </label>
            {customerForm.formState.errors.email ? <p className="form-error">{customerForm.formState.errors.email.message}</p> : null}
            <div>
              <button type="submit" disabled={isSubmitting}>{editingCustomerId ? 'Update customer' : 'Create customer'}</button>
              {editingCustomerId ? <button type="button" onClick={resetCustomerForm}>Cancel</button> : null}
            </div>
          </form>
          {isLoading ? <p>Loading customers...</p> : null}
          <DataTable<CustomerRecord>
            columns={[
              { key: 'name', header: 'Name', render: (row) => row.name },
              { key: 'phone', header: 'Phone', render: (row) => row.phone },
              { key: 'status', header: 'Status', render: (row) => <StatusBadge tone={row.deletedAt ? 'warning' : 'success'}>{row.deletedAt ? 'archived' : 'active'}</StatusBadge> },
              {
                key: 'actions',
                header: 'Actions',
                render: (row) => (
                  <div>
                    <button type="button" onClick={() => { setSelectedCustomerId(row.id); resetPetForm(); }}>Select</button>
                    <button type="button" onClick={() => startEditingCustomer(row)}>Edit</button>
                    {row.deletedAt ? <button type="button" onClick={() => void onRestoreCustomer(row.id)}>Restore</button> : <button type="button" onClick={() => void onArchiveCustomer(row.id)}>Archive</button>}
                  </div>
                ),
              },
            ]}
            rows={filteredCustomers}
            emptyMessage={emptyStateMessage('customers')}
          />
        </section>

        <section className="surface-card">
          <h2>Pets for {selectedCustomer?.name ?? 'selected customer'}</h2>
          <form onSubmit={petForm.handleSubmit(onCreateOrUpdatePet)} className="form-builder">
            <label className="form-builder__field" htmlFor="pet-name">
              <span>Pet name</span>
              <input id="pet-name" {...petForm.register('name')} />
            </label>
            {petForm.formState.errors.name ? <p className="form-error">{petForm.formState.errors.name.message}</p> : null}
            <label className="form-builder__field" htmlFor="pet-species">
              <span>Species</span>
              <input id="pet-species" {...petForm.register('species')} />
            </label>
            {petForm.formState.errors.species ? <p className="form-error">{petForm.formState.errors.species.message}</p> : null}
            <label className="form-builder__field" htmlFor="pet-breed">
              <span>Breed</span>
              <input id="pet-breed" {...petForm.register('breed')} />
            </label>
            {petForm.formState.errors.breed ? <p className="form-error">{petForm.formState.errors.breed.message}</p> : null}
            <label className="form-builder__field" htmlFor="pet-birth-date">
              <span>Birth date</span>
              <input id="pet-birth-date" type="date" {...petForm.register('birthDate')} />
            </label>
            <label className="form-builder__field" htmlFor="pet-weight">
              <span>Weight (kg)</span>
              <input id="pet-weight" type="number" step="0.1" {...petForm.register('weightKg')} />
            </label>
            {petForm.formState.errors.weightKg ? <p className="form-error">{petForm.formState.errors.weightKg.message}</p> : null}
            <div>
              <button type="submit" disabled={isSubmitting || !selectedCustomerId}>{editingPetId ? 'Update pet' : 'Create pet'}</button>
              {editingPetId ? <button type="button" onClick={resetPetForm}>Cancel</button> : null}
            </div>
          </form>
          <DataTable<PetRecord>
            columns={[
              { key: 'name', header: 'Name', render: (row) => row.name },
              { key: 'species', header: 'Species', render: (row) => row.species },
              { key: 'breed', header: 'Breed', render: (row) => row.breed },
              { key: 'weight', header: 'Weight', render: (row) => `${row.weightKg} kg` },
              { key: 'status', header: 'Status', render: (row) => <StatusBadge tone={row.deletedAt ? 'warning' : 'success'}>{row.deletedAt ? 'archived' : 'active'}</StatusBadge> },
              {
                key: 'actions',
                header: 'Actions',
                render: (row) => (
                  <div>
                    <button type="button" onClick={() => startEditingPet(row)}>Edit</button>
                    {row.deletedAt ? <button type="button" onClick={() => void onRestorePet(row.id)}>Restore</button> : <button type="button" onClick={() => void onArchivePet(row.id)}>Archive</button>}
                  </div>
                ),
              },
            ]}
            rows={pets}
            emptyMessage={selectedCustomerId ? emptyStateMessage('pets for this customer') : 'Select a customer to manage pets.'}
          />
        </section>
      </div>
    </AppShell>
  );
};
