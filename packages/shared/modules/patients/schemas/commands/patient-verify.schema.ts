import { z } from 'zod';

export const PatientVerifySchema = z.object({
  idToken: z.string().min(1, { error: 'Firebase ID token zorunludur.' }),
  organizationId: z.uuid({ error: 'Geçerli bir organizasyon seçilmelidir.' }),
  firstName: z.string().min(2, { error: 'Ad en az 2 karakter olmalıdır.' }),
  clinicId:z.uuid({error: 'Geçerli bir klinik seçilmelidir'})
});
