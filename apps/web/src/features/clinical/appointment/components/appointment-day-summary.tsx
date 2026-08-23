'use client';

import type { ClinicDailySummary } from '@core-crm/shared/client';

import { Skeleton } from '@/components/ui/skeleton';

import type { AppointmentStatus } from '../appointment.types';

/**
 * Günün durum dağılımı. Aynı zamanda filtre: bir karta tıklamak listeyi o
 * duruma daraltır — resepsiyonun "bugün kaç kişi gelmedi" sorusu tek tıkla
 * listeye dönüşsün diye.
 */
const CARDS: {
  key: keyof Omit<ClinicDailySummary, 'date' | 'total'>;
  label: string;
  status: AppointmentStatus;
}[] = [
  { key: 'pending', label: 'Onay bekleyen', status: 'PENDING' },
  { key: 'confirmed', label: 'Onaylı', status: 'CONFIRMED' },
  { key: 'completed', label: 'Tamamlanan', status: 'COMPLETED' },
  { key: 'noShow', label: 'Gelmeyen', status: 'NOSHOW' },
  { key: 'cancelled', label: 'İptal', status: 'CANCELLED' },
];

interface AppointmentDaySummaryProps {
  summary: ClinicDailySummary | undefined;
  isLoading: boolean;
  activeStatus: AppointmentStatus | undefined;
  onSelectStatus: (status: AppointmentStatus | undefined) => void;
}

export function AppointmentDaySummary({
  summary,
  isLoading,
  activeStatus,
  onSelectStatus,
}: AppointmentDaySummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-16" />
        ))}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
      <button
        type="button"
        onClick={() => onSelectStatus(undefined)}
        aria-pressed={activeStatus === undefined}
        className="rounded-lg border p-3 text-left aria-pressed:border-primary"
      >
        <span className="text-muted-foreground block text-xs">Toplam</span>
        <span className="text-xl font-semibold">{summary.total}</span>
      </button>

      {CARDS.map((card) => (
        <button
          key={card.key}
          type="button"
          onClick={() =>
            onSelectStatus(activeStatus === card.status ? undefined : card.status)
          }
          aria-pressed={activeStatus === card.status}
          className="rounded-lg border p-3 text-left aria-pressed:border-primary"
        >
          <span className="text-muted-foreground block text-xs">
            {card.label}
          </span>
          <span className="text-xl font-semibold">{summary[card.key]}</span>
        </button>
      ))}
    </div>
  );
}
