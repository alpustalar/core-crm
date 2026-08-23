import { PatientDetail } from '@/features/crm/patient/components/patient-detail';

export const metadata = {
  title: 'Hasta — Core CRM',
};

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;

  return <PatientDetail patientId={patientId} />;
}
