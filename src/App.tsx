import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthGuard } from './features/auth/components/AuthGuard';
import { AuthRoute } from './features/auth/routes/AuthRoute';
import { UserManagementRoute } from './features/auth/routes/UserManagementRoute';
import { ClinicRoute } from './features/clinic/routes/ClinicRoute';
import { DashboardRoute } from './features/dashboard/routes/DashboardRoute';
import { PortalRoute } from './features/portal/routes/PortalRoute';
import { AppLayout } from './features/shared/layouts/AppLayout';
import { createNavigationItems } from './features/shared/utils/navigation';

const navigationItems = createNavigationItems([
  { label: 'Dashboard', path: '/dashboard', roles: ['owner', 'doctor', 'staff', 'customer'] },
  { label: 'Clinic', path: '/clinic', roles: ['owner', 'doctor', 'staff'] },
  { label: 'Portal', path: '/portal', roles: ['customer'] },
]);

const App = () => {
  return (
    <Routes>
      <Route path="/auth" element={<AuthRoute />} />
      <Route element={<AuthGuard allowedRoles={['owner', 'doctor', 'staff', 'customer']} />}>
        <Route
          path="/dashboard"
          element={
            <AppLayout role="owner" title="Haland Petcare" navigationItems={navigationItems}>
              <DashboardRoute />
            </AppLayout>
          }
        />
        <Route
          path="/clinic"
          element={
            <AppLayout role="owner" title="Haland Petcare" navigationItems={navigationItems}>
              <ClinicRoute />
            </AppLayout>
          }
        />
        <Route
          path="/portal"
          element={
            <AppLayout role="customer" title="Haland Petcare" navigationItems={navigationItems}>
              <PortalRoute />
            </AppLayout>
          }
        />
      </Route>
      <Route element={<AuthGuard allowedRoles={['owner', 'staff']} />}>
        <Route path="/users" element={<UserManagementRoute />} />
      </Route>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};

export default App;
