'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  financeLedgerEndpoints,
  type GetLedgerSummary,
  type PaginationInput,
} from '@core-crm/shared/client';

import { api, apiWithMeta } from '@/lib/api';

import { ledgerKeys } from './finance.keys';

interface UseClinicLedgerParams {
  clinicId: string;
  pagination?: PaginationInput;
}

/** Klinik cari hareketleri — sayfalama sunucuda, bu yüzden `apiWithMeta`. */
export function useClinicLedger({
  clinicId,
  pagination,
}: UseClinicLedgerParams) {
  return useQuery({
    queryKey: ledgerKeys.clinicEntries(clinicId, pagination),
    queryFn: ({ signal }) =>
      apiWithMeta(financeLedgerEndpoints.clinicLedger, {
        params: { clinicId },
        pagination,
        signal,
      }),
    placeholderData: keepPreviousData,
  });
}

interface UseClinicFinanceSummaryParams {
  clinicId: string;
  range?: GetLedgerSummary;
}

/**
 * Özet ayrı bir uçtan gelir, listeden türetilmez: toplam ciro tüm defteri
 * kapsıyor, elimizdeki sayfa ise yalnız 20 satır — sayfadan toplam hesaplamak
 * sessizce yanlış bir rakam üretirdi.
 */
export function useClinicFinanceSummary({
  clinicId,
  range,
}: UseClinicFinanceSummaryParams) {
  return useQuery({
    queryKey: ledgerKeys.clinicSummary(clinicId, range),
    queryFn: ({ signal }) =>
      api(financeLedgerEndpoints.clinicSummary, {
        params: { clinicId },
        query: range,
        signal,
      }),
    placeholderData: keepPreviousData,
  });
}
