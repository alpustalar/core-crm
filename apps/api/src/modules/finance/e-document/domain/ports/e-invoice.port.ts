import { EDocumentStatusType as EDocumentStatus } from '@input-type-schemas/EDocumentStatusSchema';
import { EDocumentRequest } from '../types/e-document-request.type';
import { EDocumentResult } from '../types/e-document-result.type';

export const E_INVOICE_PORT = Symbol('EInvoicePort');

export interface MailboxInfo {
  isEInvoiceUser: boolean;
  alias?: string;
}

/**
 * e-Belge portu (doc 07 §1). Çekirdek yalnız bu interface'i tanır; Logo/Nilvera/GİB
 * birer adapter'dır. Entegratör kapalıyken NoopEInvoiceAdapter devrededir.
 */
export interface EInvoicePort {
  issue(req: EDocumentRequest): Promise<EDocumentResult>;
  cancel(uuid: string, reason: string): Promise<void>;
  getStatus(uuid: string): Promise<EDocumentStatus>;
  checkMailbox(taxId: string): Promise<MailboxInfo>;
}
