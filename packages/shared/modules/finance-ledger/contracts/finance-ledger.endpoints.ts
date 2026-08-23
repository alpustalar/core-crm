import { defineEndpoint } from '@shared/common/contracts/endpoint';
import { GetLedgerSummarySchema } from '../schemas/queries';
import type {
  ClinicLedgerEntry,
  LedgerSummaryView,
  PatientFinanceSummaryView,
  PatientLedgerEntry,
} from '../interfaces';

/**
 * `apps/api` → `FinanceLedgerQueryController`. Modül `app.routes.ts`'te
 * `finance` altına takılı, controller'ın kendi öneki `finance-ledger` — yollar
 * bu yüzden `/finance/finance-ledger/...` biçiminde.
 *
 * Hepsi salt okuma: cari hareketler event-driven üretiliyor, elle kayıt açan bir
 * uç yok. Sayfalama istemcinin birinci sınıf `pagination` seçeneğiyle gider.
 */
export const financeLedgerEndpoints = {
  clinicLedger: defineEndpoint<ClinicLedgerEntry[]>()({
    method: 'GET',
    path: (p: { clinicId: string }) =>
      `/finance/finance-ledger/clinic/${p.clinicId}`,
  }),

  clinicSummary: defineEndpoint<LedgerSummaryView>()({
    method: 'GET',
    path: (p: { clinicId: string }) =>
      `/finance/finance-ledger/clinic/${p.clinicId}/summary`,
    query: GetLedgerSummarySchema,
  }),

  patientSummary: defineEndpoint<PatientFinanceSummaryView>()({
    method: 'GET',
    path: (p: { patientId: string }) =>
      `/finance/finance-ledger/patient/${p.patientId}/summary`,
  }),

  patientLedger: defineEndpoint<PatientLedgerEntry[]>()({
    method: 'GET',
    path: (p: { patientId: string }) =>
      `/finance/finance-ledger/patient/${p.patientId}`,
  }),
};
