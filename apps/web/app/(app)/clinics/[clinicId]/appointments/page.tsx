import { Suspense } from 'react';

import { AppointmentDay } from '@/features/clinical/appointment/components/appointment-day';

export const metadata = {
  title: 'Randevular — Core CRM',
};

export default async function AppointmentsPage({
  params,
}: {
  params: Promise<{ clinicId: string }>;
}) {
  const { clinicId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Randevular</h1>
        <p className="text-muted-foreground text-sm">
          Gün, doktor ve durum filtresi URL&apos;de tutulur — bağlantıyı
          paylaşabilirsin.
        </p>
      </div>

      {/* `useSearchParams` kullanan alt ağaç Suspense sınırı ister. */}
      <Suspense>
        <AppointmentDay clinicId={clinicId} />
      </Suspense>
    </div>
  );
}
