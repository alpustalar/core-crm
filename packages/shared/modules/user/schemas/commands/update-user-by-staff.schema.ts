import { z } from 'zod';
import { RegisterUserOrProviderAccountSchema } from '@shared/modules/registration/schemas/commands/register-user-or-provider-account.schema';
import { GlobalStatusSchema } from '@shared/generated-zod';

/**
 * Personelin bir kullanıcının PROFİLİNİ güncellemesi.
 *
 * Kapsam atamaları (`managedClinicIds` / `ownedOrganizationIds`) bilerek burada
 * DEĞİL: onlar yetki devridir ve kendi uçlarında (`:id/managed-clinics`,
 * `:id/owned-organizations`) yaşar. Aynı gövdede taşınsalardı telefon numarası
 * güncelleyen bir istek, eksik gönderilen bir dizi yüzünden kullanıcının tüm
 * yönetim kapsamını sessizce silebilirdi.
 */
export const UpdateUserByStaffSchema = z.lazy(() =>
  RegisterUserOrProviderAccountSchema.omit({ providerProfile: true })
    .partial()
    .extend({
      status: GlobalStatusSchema.optional(),
    })
);
