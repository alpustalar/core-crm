import { z } from 'zod';

/** Mükellefiyet tipi — @prisma/client'a bağlanmadan lokal enum. */
export const ClinicLegalTypeEnum = z.enum(['SERBEST_MESLEK', 'KURUM']);

export const UpsertClinicGovernmentSpecsSchema = z.object({
  healthFacilityCode: z.string().min(1), // SKRS Tesis Kodu
  ussPassword: z.string().optional(),
  companyTaxNumber: z.string().optional(), // kliniğin VKN'si (fatura)
  /** Serbest meslek (muayenehane) | kurum (poliklinik). Verilmezse KURUM. */
  legalType: ClinicLegalTypeEnum.optional(),
});
