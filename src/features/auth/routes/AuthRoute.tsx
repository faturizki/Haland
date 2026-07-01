import { RouteLayout } from '../../shared/layouts/RouteLayout';
import { LoginForm } from '../components/LoginForm';

export const AuthRoute = () => {
  return (
    <RouteLayout>
      <section className="auth-route">
        <div className="surface-card">
          <h1>Secure sign in</h1>
          <p>Sign in with your clinic username and 6-digit PIN.</p>
          <LoginForm />
        </div>
      </section>
    </RouteLayout>
  );
};
