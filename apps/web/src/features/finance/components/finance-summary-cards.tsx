'use client';

import type { LedgerSummaryView } from '@core-crm/shared/client';

import { Skeleton } from '@/components/ui/skeleton';

import { formatMoney } from '../finance.format';

interface FinanceSummaryCardsProps {
  summary: LedgerSummaryView | undefined;
  isLoading: boolean;
}

/**
 * Ciro/gider/bakiye kartları. Tutarlar finans tier'ında olduğu için yetkisi
 * olmayan aktörün cevabında **hiç yoklar** — o durumda kartları "—" ile
 * doldurmak yerine bloğun tamamı gizlenir. Boş bir tutar göstermek "veri yok"
 * izlenimi verirdi, oysa veri var, kullanıcının görme yetkisi yok.
 */
export function FinanceSummaryCards({
  summary,
  isLoading,
}: FinanceSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-20" />
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const hasFinancialAccess = summary.balance !== undefined;
  if (!hasFinancialAccess) {
    return (
      <p className="text-muted-foreground rounded-lg border p-3 text-sm">
        Tutar özetini görüntüleme yetkiniz yok.
      </p>
    );
  }

  const cards = [
    { label: 'Gelir', value: formatMoney(summary.totalIncome) },
    { label: 'Gider', value: formatMoney(summary.totalExpenses) },
    { label: 'Bakiye', value: formatMoney(summary.balance) },
    { label: 'Hareket', value: String(summary.entryCount ?? 0) },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border p-3">
          <span className="text-muted-foreground block text-xs">
            {card.label}
          </span>
          <span className="text-xl font-semibold">{card.value ?? '—'}</span>
        </div>
      ))}
    </div>
  );
}
