export const INVOICE_ISSUANCE_SERVICE = Symbol('IInvoiceIssuanceService');

export interface IInvoiceIssuanceService {
  /**
   * Randevunun faturası kesilmişse `AppointmentAlreadyInvoicedException` fırlatır.
   *
   * Veri döndürmez: bu bir okuma değil, çağıranın yazmasını kapıda durduran
   * senkron invariant kontrolüdür (bkz. CLAUDE.md — domain servisi istisnası).
   * Yazma kararını beslediği için okuma Command Repository'den (aynı transaction
   * kapsamı) yapılır; QueryBus üzerinden gidilseydi karar replica'dan/kilitsiz
   * okunan veriye dayanırdı.
   */
  assertAppointmentNotInvoiced(appointmentId: string): Promise<void>;
}
