import { AppShell } from '../../shared/components/AppShell';
import { DataTable } from '../../shared/components/DataTable';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { emptyStateMessage } from '../../shared/utils/empty';
import { useToast } from '../../shared/hooks/useToast';

export const DashboardRoute = () => {
  const { addToast } = useToast();

  const rows = [
    { id: 1, name: 'Daily appointments', status: 'ready' },
    { id: 2, name: 'Revenue overview', status: 'pending' },
  ];

  return (
    <AppShell title="Dashboard" description="Operational overview and shared foundation components.">
      <div className="dashboard-grid">
        <section className="surface-card">
          <h2>Foundation status</h2>
          <p>The application shell now uses shared layouts, reusable components, validation utilities, and state containers.</p>
          <button onClick={() => addToast({ title: 'Foundation ready', description: 'Shared infrastructure is available for the full clinic product.', variant: 'success' })}>Dispatch notification</button>
        </section>
        <section className="surface-card">
          <h2>Operational readiness</h2>
          <DataTable
            columns={[
              { key: 'name', header: 'Module' },
              { key: 'status', header: 'Status', render: (row) => <StatusBadge tone={row.status === 'ready' ? 'success' : 'warning'}>{row.status}</StatusBadge> },
            ]}
            rows={rows}
            emptyMessage={emptyStateMessage('dashboard items')}
          />
        </section>
      </div>
    </AppShell>
  );
};
