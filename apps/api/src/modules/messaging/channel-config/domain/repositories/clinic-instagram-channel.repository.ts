import { ClinicInstagramChannel } from '../entities/clinic-instagram-channel.entity';

export const CLINIC_INSTAGRAM_CHANNEL_COMMAND_REPOSITORY = Symbol(
  'IClinicInstagramChannelCommandRepository'
);
export const CLINIC_INSTAGRAM_CHANNEL_QUERY_REPOSITORY = Symbol(
  'IClinicInstagramChannelQueryRepository'
);

export interface IClinicInstagramChannelCommandRepository {
  /** clinicId unique → upsert tabanlı kayıt. */
  save(entity: ClinicInstagramChannel): Promise<ClinicInstagramChannel>;
}

export interface IClinicInstagramChannelQueryRepository {
  findByClinicId(clinicId: string): Promise<ClinicInstagramChannel | null>;
  /** Webhook routing: gelen olaydaki IG hesap id'si (entry.id) → kanal (dolayısıyla klinik). */
  findByIgUserId(igUserId: string): Promise<ClinicInstagramChannel | null>;
}
