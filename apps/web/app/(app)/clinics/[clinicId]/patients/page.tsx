import { Suspense } from 'react';

import { PatientList } from '@/features/crm/patient/components/patient-list';

export const metadata = {
  title: 'Hastalar — Core CRM',
};

export default async function PatientsPage({
  params,
}: {
  params: Promise<{ clinicId: string }>;
}) {
  const { clinicId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Hastalar</h1>
        <p className="text-muted-foreground text-sm">
          Varsayılan kapsam bu klinik; kapsamı organizasyona genişletebilirsin.
        </p>
      </div>

      <Suspense>
        <PatientList clinicId={clinicId} />
      </Suspense>
    </div>
  );
}
