import { EDocumentStatusType as EDocumentStatus } from '@input-type-schemas/EDocumentStatusSchema';
import {
  EDocumentRequest,
  EDocumentResult,
  MailboxInfo,
} from '@modules/finance/e-document/domain/e-document.contracts';

export const E_INVOICE_PORT = Symbol('EInvoicePort');

/**
 * e-Belge portu. Çekirdek yalnız bu interface'i tanır; Logo/Nilvera/GİB
 * birer adapter'dır. Entegratör kapalıyken NoopEInvoiceAdapter devrededir.
 */
export interface EInvoicePort {
  issue(req: EDocumentRequest): Promise<EDocumentResult>;
  cancel(uuid: string, reason: string): Promise<void>;
  getStatus(uuid: string): Promise<EDocumentStatus>;
  checkMailbox(taxId: string): Promise<MailboxInfo>;
}
