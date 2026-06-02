import { z } from 'zod';

export const PatientVerifySchema = z.object({
  idToken: z.string().min(1, { message: 'Firebase ID token zorunludur.' }),
  organizationId: z.string().uuid({ message: 'Geçerli bir organizasyon seçilmelidir.' }),
  firstName: z.string().min(2, { message: 'Ad en az 2 karakter olmalıdır.' }),
});
