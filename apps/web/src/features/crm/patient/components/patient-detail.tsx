'use client';

import dayjs from 'dayjs';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/api';
import { PatientFinanceSummary } from '@/features/finance/components/patient-finance-summary';

import { usePatient } from '../api/use-patient';
import { PatientStatusBadge } from './patient-status-badge';

interface FieldProps {
  label: string;
  value: string | null | undefined;
}

/**
 * Alan **yoksa hiç render edilmez**. Backend policy'si görme yetkisi olmayan
 * alanı cevaptan siliyor (`class-transformer` grupları); burada `undefined`ı
 * "—" diye göstermek "veri yok" ile "görme yetkin yok"u aynı şeye çevirirdi.
 * Boş bırakılmış (null) alan ise "—" gösterir: o gerçekten boş.
 */
function Field({ label, value }: FieldProps) {
  if (value === undefined) return null;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-sm">{value ?? '—'}</span>
    </div>
  );
}

export function PatientDetail({ patientId }: { patientId: string }) {
  const { data, isPending, error } = usePatient(patientId);

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-destructive text-sm">
        {error instanceof ApiError ? error.message : 'Hasta kaydı yüklenemedi.'}
      </p>
    );
  }

  const patient = data.data;
  const fullName = [patient.firstName, patient.lastName]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{fullName}</h1>
        <PatientStatusBadge status={patient.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Künye</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field label="Protokol no" value={patient.protocolNo} />
            <Field label="Telefon" value={patient.phone} />
            <Field label="E-posta" value={patient.email} />
            <Field
              label="Doğum tarihi"
              value={
                patient.birthDate
                  ? dayjs(patient.birthDate).format('DD.MM.YYYY')
                  : patient.birthDate
              }
            />
            <Field label="Cinsiyet" value={patient.gender} />
            <Field label="Adres" value={patient.address} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tıbbi</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field label="Kan grubu" value={patient.bloodType} />
            <Field label="Alerjiler" value={patient.allergies} />
            <Field label="Kronik hastalıklar" value={patient.chronicDiseases} />
            <Field
              label="Kontrol tarihi"
              value={
                patient.checkupDate
                  ? dayjs(patient.checkupDate).format('DD.MM.YYYY')
                  : patient.checkupDate
              }
            />
          </CardContent>
        </Card>

        <PatientFinanceSummary patientId={patientId} />
      </div>
    </div>
  );
}
