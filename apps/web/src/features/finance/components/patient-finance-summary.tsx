'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCapability } from '@/lib/auth';

import { usePatientFinanceSummary } from '../api/use-patient-finance';
import { formatMoney } from '../finance.format';

/**
 * Hastanın cari durumu — hasta detay ekranında. Sorgu yetkinlik yoksa hiç
 * **atılmaz** (`enabled`): backend zaten 403 dönerdi, isteği atmak boşuna bir
 * ağ turu ve konsolda gereksiz bir hata olurdu.
 */
export function PatientFinanceSummary({ patientId }: { patientId: string }) {
  const canRead = useCapability('financeledger:read');
  const { data, isPending, error } = usePatientFinanceSummary(
    patientId,
    canRead
  );

  if (!canRead) return null;

  if (isPending) return <Skeleton className="h-32" />;

  // Cari özet hasta künyesinin yardımcı bilgisi; yüklenemezse detay ekranının
  // tamamını hata ekranına çevirmek yerine bu kart sessizce düşer.
  if (error || !data) return null;

  const rows = [
    { label: 'Kalan bakiye', value: formatMoney(data.balance) },
    { label: 'Toplam hizmet', value: formatMoney(data.totalServiceAmount) },
    { label: 'Toplam tahsilat', value: formatMoney(data.totalPayments) },
  ].filter((row) => row.value !== undefined);

  if (rows.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cari durum</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">{row.label}</span>
            <span className="text-sm font-medium">{row.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
