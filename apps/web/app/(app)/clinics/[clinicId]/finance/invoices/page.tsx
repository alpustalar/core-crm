import { Suspense } from 'react';

import { FinanceTabs } from '@/features/finance/components/finance-tabs';
import { InvoiceList } from '@/features/finance/components/invoice-list';

export const metadata = {
  title: 'Faturalar — Core CRM',
};

export default async function InvoicesPage({
  params,
}: {
  params: Promise<{ clinicId: string }>;
}) {
  const { clinicId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Faturalar</h1>
        <p className="text-muted-foreground text-sm">
          Faturalar tahsilat olaylarından otomatik kesilir; elle fatura oluşturma
          yoktur.
        </p>
      </div>

      <Suspense>
        <FinanceTabs clinicId={clinicId} />
      </Suspense>

      <Suspense>
        <InvoiceList clinicId={clinicId} />
      </Suspense>
    </div>
  );
}
