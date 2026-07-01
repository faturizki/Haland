import { describe, expect, it } from 'vitest';
import { customerService } from './customerService';

describe('customerService', () => {
  it('exposes the expected customer and pet operations', () => {
    expect(typeof customerService.listCustomers).toBe('function');
    expect(typeof customerService.createCustomer).toBe('function');
    expect(typeof customerService.updateCustomer).toBe('function');
    expect(typeof customerService.archiveCustomer).toBe('function');
    expect(typeof customerService.restoreCustomer).toBe('function');
    expect(typeof customerService.listPets).toBe('function');
    expect(typeof customerService.createPet).toBe('function');
    expect(typeof customerService.updatePet).toBe('function');
    expect(typeof customerService.archivePet).toBe('function');
    expect(typeof customerService.restorePet).toBe('function');
  });
});
