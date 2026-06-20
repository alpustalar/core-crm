import { ClinicWhatsappChannel } from '../entities/clinic-whatsapp-channel.entity';

export const CLINIC_WHATSAPP_CHANNEL_COMMAND_REPOSITORY = Symbol(
  'IClinicWhatsappChannelCommandRepository'
);
export const CLINIC_WHATSAPP_CHANNEL_QUERY_REPOSITORY = Symbol(
  'IClinicWhatsappChannelQueryRepository'
);

export interface IClinicWhatsappChannelCommandRepository {
  /** clinicId unique → upsert tabanlı kayıt. */
  save(entity: ClinicWhatsappChannel): Promise<ClinicWhatsappChannel>;
}

export interface IClinicWhatsappChannelQueryRepository {
  findByClinicId(clinicId: string): Promise<ClinicWhatsappChannel | null>;
  /** Webhook routing: gelen olaydaki phone_number_id → kanal (dolayısıyla klinik). */
  findByPhoneNumberId(
    phoneNumberId: string
  ): Promise<ClinicWhatsappChannel | null>;
  /** Kalite/hesap webhook'ları yalnızca display_phone_number taşır → kanal eşleme. */
  findByDisplayPhoneNumber(
    displayPhoneNumber: string
  ): Promise<ClinicWhatsappChannel | null>;
}
