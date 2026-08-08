import { DashboardOverview } from '@/features/identity/auth/components/dashboard-overview';

export const metadata = {
  title: 'Panel — Core CRM',
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Panel</h1>
        <p className="text-muted-foreground text-sm">
          Modüller Faz 2&apos;den itibaren buraya bağlanacak.
        </p>
      </div>

      <DashboardOverview />
    </div>
  );
}
