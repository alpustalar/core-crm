import { AppointmentSlot } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { LockAppointmentSlotResponse } from './lock-appointment-slot.response';

/**
 * Randevu oluşturma akışında ("ilerle") bir slotu geçici olarak elde tutar. Aynı
 * anda başka bir sahip (holder) aynı slotu tutamaz.
 *
 * Kilidi tutan (holderId): personel akışında aktörün `userId`'si (verilmezse ondan
 * türetilir); hasta portalı / AI akışında kanal başına kararlı bir kimlik (ör. AI
 * yazışması için `conversationId`) `holderId` ile açıkça geçilir — böylece tek sistem
 * aktörünü paylaşan AI yazışmaları birbirinin kilidini ezmez.
 */
export class LockAppointmentSlotCommand {
  readonly __responseType!: LockAppointmentSlotResponse;

  constructor(
    public readonly payload: {
      data: AppointmentSlot;
      ctx: IGetContext;
      holderId?: string;
    }
  ) {}
}
