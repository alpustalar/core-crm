import { EDocumentTypeType as EDocumentType } from '@input-type-schemas/EDocumentTypeSchema';
import { EDocumentStatusType as EDocumentStatus } from '@input-type-schemas/EDocumentStatusSchema';

/** Portun döndürdüğü belge sonucu. Noop'ta documentType=INTERNAL, uuid=null. */
export interface EDocumentResult {
  documentType: EDocumentType;
  uuid: string | null; // ETTN/UUID; INTERNAL'de null
  status: EDocumentStatus;
  invoiceNumber: string | null; // entegratör belge no atarsa
  rawResponse?: unknown;
}
