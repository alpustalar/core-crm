import type {
  GetInvoices,
  GetLedgerSummary,
  PaginationInput,
} from '@core-crm/shared/client';

/**
 * Cari defter ve faturalar ayrı kökler altında: fatura kesildiğinde defter
 * satırı da doğar ama ikisi farklı uçlardan gelir, tek çağrıyla ikisini birden
 * geçersizleştirmek istediğimizde `financeKeys.all` yeterli değil — bu yüzden
 * kökler kardeş, ortak bir üst anahtar yok.
 */
export const ledgerKeys = {
  all: ['finance-ledger'] as const,

  clinic: (clinicId: string) => [...ledgerKeys.all, 'clinic', clinicId] as const,

  clinicEntries: (clinicId: string, pagination: PaginationInput | undefined) =>
    [...ledgerKeys.clinic(clinicId), 'entries', { pagination }] as const,

  clinicSummary: (clinicId: string, range: GetLedgerSummary | undefined) =>
    [...ledgerKeys.clinic(clinicId), 'summary', { range }] as const,

  patient: (patientId: string) =>
    [...ledgerKeys.all, 'patient', patientId] as const,

  patientSummary: (patientId: string) =>
    [...ledgerKeys.patient(patientId), 'summary'] as const,

  patientEntries: (patientId: string, pagination: PaginationInput | undefined) =>
    [...ledgerKeys.patient(patientId), 'entries', { pagination }] as const,
};

export const invoiceKeys = {
  all: ['invoices'] as const,

  lists: () => [...invoiceKeys.all, 'list'] as const,

  list: (filter: GetInvoices, pagination: PaginationInput | undefined) =>
    [...invoiceKeys.lists(), { filter, pagination }] as const,

  details: () => [...invoiceKeys.all, 'detail'] as const,

  detail: (invoiceId: string) => [...invoiceKeys.details(), invoiceId] as const,
};
