import {
  EDocumentTypeSchema,
  EDocumentTypeType as EDocumentType,
} from '@input-type-schemas/EDocumentTypeSchema';
import { ClinicLegalTypeType as ClinicLegalType } from '@input-type-schemas/ClinicLegalTypeSchema';

export interface ResolveDocumentTypeInput {
  legalType: ClinicLegalType;
  buyerIsEInvoiceUser: boolean;
}

/**
 * Belge türünü çözer
 *   SERBEST_MESLEK                        → E_SMM   (muayenehane)
 *   KURUM + alıcı e-Fatura mükellefi      → E_FATURA
 *   KURUM + bireysel (nihai tüketici)     → E_ARSIV
 *
 * Bu "ne olması gerektiği"dir; entegratör kapalıysa Noop adapter sonucu INTERNAL'e çevirir.
 */
export function resolveDocumentType(
  input: ResolveDocumentTypeInput
): EDocumentType {
  if (input.legalType === 'SERBEST_MESLEK') {
    return EDocumentTypeSchema.enum.E_SMM;
  }
  if (input.buyerIsEInvoiceUser) {
    return EDocumentTypeSchema.enum.E_FATURA;
  }
  return EDocumentTypeSchema.enum.E_ARSIV;
}
