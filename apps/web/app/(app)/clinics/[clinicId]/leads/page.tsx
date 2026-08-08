import { Suspense } from 'react';

import { LeadList } from '@/features/crm/lead/components/lead-list';

export const metadata = {
  title: 'Leadler — Core CRM',
};

/**
 * Aktif klinik URL'de taşınır (§10). Global bir store yerine route param
 * kullanmak derin bağlantıyı, çoklu sekmeyi ve paylaşılan URL'leri bedavaya
 * çözer; klinik değiştirici yalnız `router.push` yapar.
 */
export default async function LeadsPage({
  params,
}: {
  params: Promise<{ clinicId: string }>;
}) {
  const { clinicId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Leadler</h1>
        <p className="text-muted-foreground text-sm">
          Filtre ve sayfa URL&apos;de tutulur — bağlantıyı paylaşabilirsin.
        </p>
      </div>

      {/* `useSearchParams` kullanan alt ağaç Suspense sınırı ister. */}
      <Suspense>
        <LeadList clinicId={clinicId} />
      </Suspense>
    </div>
  );
}
