import { AppLayout } from '../../shared/layouts/AppLayout';
import { createNavigationItems } from '../../shared/utils/navigation';
import { UserManagementScreen } from '../components/UserManagementScreen';

const navigationItems = createNavigationItems([
  { label: 'Dashboard', path: '/dashboard', roles: ['owner', 'doctor', 'staff', 'customer'] },
  { label: 'Clinic', path: '/clinic', roles: ['owner', 'doctor', 'staff'] },
  { label: 'Portal', path: '/portal', roles: ['customer'] },
  { label: 'Users', path: '/users', roles: ['owner', 'staff'] },
]);

export const UserManagementRoute = () => {
  return (
    <AppLayout role="owner" title="Haland Petcare" navigationItems={navigationItems}>
      <UserManagementScreen />
    </AppLayout>
  );
};
