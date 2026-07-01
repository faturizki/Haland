import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { LoginCredentials } from '../types';
import { loginSchema } from '../validation';
import { useAuth } from '../hooks/useAuth';

interface LoginFormProps {
  onSubmit?: (values: LoginCredentials) => void;
}

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const { signIn, isLoading } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>({ resolver: zodResolver(loginSchema) });

  const submit = async (values: LoginCredentials) => {
    try {
      await signIn(values);
      onSubmit?.(values);
    } catch {
      // handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="form-builder">
      <label className="form-builder__field">
        <span>Username</span>
        <input autoComplete="username" {...register('username')} />
      </label>
      {errors.username ? <p className="form-error">{errors.username.message}</p> : null}
      <label className="form-builder__field">
        <span>6-digit PIN</span>
        <input type="password" autoComplete="current-password" {...register('pin')} />
      </label>
      {errors.pin ? <p className="form-error">{errors.pin.message}</p> : null}
      <button type="submit" disabled={isLoading}>Continue</button>
    </form>
  );
};
