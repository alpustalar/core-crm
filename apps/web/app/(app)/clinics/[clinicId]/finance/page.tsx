import { Suspense } from 'react';

import { FinanceTabs } from '@/features/finance/components/finance-tabs';
import { LedgerTable } from '@/features/finance/components/ledger-table';

export const metadata = {
  title: 'Finans — Core CRM',
};

export default async function FinancePage({
  params,
}: {
  params: Promise<{ clinicId: string }>;
}) {
  const { clinicId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Finans</h1>
        <p className="text-muted-foreground text-sm">
          Kliniğin cari hareketleri ve dönem özeti.
        </p>
      </div>

      <Suspense>
        <FinanceTabs clinicId={clinicId} />
      </Suspense>

      <Suspense>
        <LedgerTable clinicId={clinicId} />
      </Suspense>
    </div>
  );
}
