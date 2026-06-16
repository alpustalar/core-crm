import { z } from 'zod';

export const UpsertClinicGovernmentSpecsSchema = z.object({
  healthFacilityCode: z.string().min(1), // SKRS Tesis Kodu
  ussPassword: z.string().optional(),
  companyTaxNumber: z.string().optional(), // kliniğin VKN'si (fatura)
});
