import { createAuthUseCases } from '../application/authUseCases';
import { supabaseAuthRepository } from '../repositories/supabaseAuthRepository';

export const authService = createAuthUseCases(supabaseAuthRepository);
