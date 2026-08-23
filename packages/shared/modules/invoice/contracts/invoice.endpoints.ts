import { defineEndpoint } from '@shared/common/contracts/endpoint';
import { GetInvoicesSchema } from '../schemas/queries';
import type { InvoiceDetailView, InvoiceListItemView } from '../interfaces';

/**
 * `apps/api` → `InvoiceQueryController`. Modül `app.routes.ts`'te `invoices`
 * önekine takılı, controller'ın kendi `@Controller()`'ı boş.
 *
 * Yalnız okuma: faturalar event-driven kesiliyor, manuel kesim ucu yok
 * (controller'ın kendi notu).
 */
export const invoiceEndpoints = {
  list: defineEndpoint<InvoiceListItemView[]>()({
    method: 'GET',
    path: '/invoices',
    query: GetInvoicesSchema,
  }),

  byId: defineEndpoint<InvoiceDetailView>()({
    method: 'GET',
    path: (p: { invoiceId: string }) => `/invoices/${p.invoiceId}`,
  }),

  byPaymentId: defineEndpoint<InvoiceDetailView>()({
    method: 'GET',
    path: (p: { paymentId: string }) => `/invoices/by-payment/${p.paymentId}`,
  }),
};
