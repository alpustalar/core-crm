import { ClinicWhatsappChannel as IClinicWhatsappChannel } from '@shared';
import { ClinicWhatsappChannel } from '../entities/clinic-whatsapp-channel.entity';

export const CLINIC_WHATSAPP_CHANNEL_COMMAND_REPOSITORY = Symbol(
  'IClinicWhatsappChannelCommandRepository'
);
export const CLINIC_WHATSAPP_CHANNEL_QUERY_REPOSITORY = Symbol(
  'IClinicWhatsappChannelQueryRepository'
);

export interface IClinicWhatsappChannelCommandRepository {
  /** clinicId unique → get-or-create (upsert). */
  upsertByClinicId(
    entity: ClinicWhatsappChannel
  ): Promise<ClinicWhatsappChannel>;

  /**
   * Kanalı yazma tarafı için yükler: kanal ya kapatılacak (deactivate) ya da
   * kimlik bilgisi dış API çağrısını besleyecek. İkisi de yazma kararı olduğu
   * için Command Context'e aittir (replica gecikmesi iptal edilmiş token ile
   * çağrı yapmaya yol açardı).
   */
  findByClinicId(clinicId: string): Promise<ClinicWhatsappChannel | null>;

  /** Kalite/hesap webhook'ları yalnızca display_phone_number taşır → kanal eşleme. */
  findByDisplayPhoneNumber(
    displayPhoneNumber: string
  ): Promise<ClinicWhatsappChannel | null>;
}

/** Okuma tarafı: entity değil, plain model döner (veri HTTP sınırını geçiyor). */
export interface IClinicWhatsappChannelQueryRepository {
  findByClinicId(clinicId: string): Promise<IClinicWhatsappChannel | null>;
  /** Webhook routing: gelen olaydaki phone_number_id → kanal (dolayısıyla klinik). */
  findByPhoneNumberId(
    phoneNumberId: string
  ): Promise<IClinicWhatsappChannel | null>;
}
