import { ClinicInstagramChannel as IClinicInstagramChannel } from '@shared';
import { ClinicInstagramChannel } from '../entities/clinic-instagram-channel.entity';

export const CLINIC_INSTAGRAM_CHANNEL_COMMAND_REPOSITORY = Symbol(
  'IClinicInstagramChannelCommandRepository'
);
export const CLINIC_INSTAGRAM_CHANNEL_QUERY_REPOSITORY = Symbol(
  'IClinicInstagramChannelQueryRepository'
);

export interface IClinicInstagramChannelCommandRepository {
  /** clinicId unique → get-or-create (upsert). */
  upsertByClinicId(
    entity: ClinicInstagramChannel
  ): Promise<ClinicInstagramChannel>;

  /** Kanal kapatma (deactivate) kararını beslediği için Command Context'te okunur. */
  findByClinicId(clinicId: string): Promise<ClinicInstagramChannel | null>;
}

/** Okuma tarafı: entity değil, plain model döner (veri HTTP sınırını geçiyor). */
export interface IClinicInstagramChannelQueryRepository {
  findByClinicId(clinicId: string): Promise<IClinicInstagramChannel | null>;
  /** Webhook routing: gelen olaydaki IG hesap id'si (entry.id) → kanal (dolayısıyla klinik). */
  findByIgUserId(igUserId: string): Promise<IClinicInstagramChannel | null>;
}
