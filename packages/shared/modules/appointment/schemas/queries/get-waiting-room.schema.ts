import { z } from 'zod';

/**
 * Bekleme odası: kliniğe gelmiş (check-in / ARRIVED) ve henüz işleme alınmamış
 * hastalar, geliş sırasına göre. clinicId gövdede değil, aktörden gelir; providerId
 * verilirse tek doktoranın bekleyenlerine daralır.
 */
export const GetWaitingRoomSchema = z.object({
  providerId: z.uuid().optional(),
  clinicId: z.uuid(),
});
