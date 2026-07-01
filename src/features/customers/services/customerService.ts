import { createCustomerUseCases } from '../application/customerUseCases';
import { supabaseCustomerRepository } from '../repositories/supabaseCustomerRepository';

export const customerService = createCustomerUseCases(supabaseCustomerRepository);
