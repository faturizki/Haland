import { useAuth } from '../../auth/hooks/useAuth';
import { AppLayout } from '../../shared/layouts/AppLayout';
import { createNavigationItems } from '../../shared/utils/navigation';
import { CustomerManagementScreen } from '../components/CustomerManagementScreen';

const navigationItems = createNavigationItems([
  { label: 'Dashboard', path: '/dashboard', roles: ['owner', 'doctor', 'staff', 'customer'] },
  { label: 'Clinic', path: '/clinic', roles: ['owner', 'doctor', 'staff'] },
  { label: 'Customers', path: '/customers', roles: ['owner', 'staff'] },
  { label: 'Portal', path: '/portal', roles: ['customer'] },
  { label: 'Users', path: '/users', roles: ['owner', 'staff'] },
]);

export const CustomerManagementRoute = () => {
  const { role } = useAuth();

  return (
    <AppLayout role={role ?? 'owner'} title="Haland Petcare" navigationItems={navigationItems}>
      <CustomerManagementScreen />
    </AppLayout>
  );
};
