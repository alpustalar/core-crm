'use client';

import { useQuery } from '@tanstack/react-query';
import { financeLedgerEndpoints } from '@core-crm/shared/client';

import { api } from '@/lib/api';

import { ledgerKeys } from './finance.keys';

/**
 * Hasta cari özeti. Hasta detay ekranında kullanılır: kalan bakiye tahsilat
 * yapan resepsiyona da açık (backend `balance`ı INTERNAL tier'ında tutuyor),
 * ciro/tahsilat kırılımı ise finans tier'ında.
 */
export function usePatientFinanceSummary(patientId: string, enabled = true) {
  return useQuery({
    queryKey: ledgerKeys.patientSummary(patientId),
    queryFn: ({ signal }) =>
      api(financeLedgerEndpoints.patientSummary, {
        params: { patientId },
        signal,
      }),
    enabled,
  });
}
