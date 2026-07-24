import { z } from 'zod';

/** Tablette imza yakalama — signatureImage tablette çizilen imzanın base64 data-URI'si. */
export const SignConsentFormSchema = z.object({
  templateId: z.uuid(),
  signatureImage: z.string().min(1),
  appointmentId: z.uuid().nullable().optional(),
  treatmentId: z.uuid().nullable().optional(),
});

export type SignConsentForm = z.infer<typeof SignConsentFormSchema>;
