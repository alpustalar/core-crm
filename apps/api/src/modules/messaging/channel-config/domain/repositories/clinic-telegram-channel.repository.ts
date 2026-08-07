import { ClinicTelegramChannel as IClinicTelegramChannel } from '@shared';
import { ClinicTelegramChannel } from '../entities/clinic-telegram-channel.entity';

export const CLINIC_TELEGRAM_CHANNEL_COMMAND_REPOSITORY = Symbol(
  'IClinicTelegramChannelCommandRepository'
);
export const CLINIC_TELEGRAM_CHANNEL_QUERY_REPOSITORY = Symbol(
  'IClinicTelegramChannelQueryRepository'
);

export interface IClinicTelegramChannelCommandRepository {
  /** clinicId+provider unique → get-or-create (upsert) (şu an yalnız BOT_API). */
  upsertByClinicAndProvider(
    entity: ClinicTelegramChannel
  ): Promise<ClinicTelegramChannel>;

  /**
   * Kanalı yazma tarafı için yükler: kanal ya iptal edilecek (revoke) ya da bot
   * token'ı dış API çağrısını besleyecek — ikisi de yazma kararı.
   */
  findByClinicId(clinicId: string): Promise<ClinicTelegramChannel | null>;
}

/** Okuma tarafı: entity değil, plain model döner (veri HTTP sınırını geçiyor). */
export interface IClinicTelegramChannelQueryRepository {
  /** Klinik config görünümü + webhook routing: yol parametresindeki clinicId → kanal. */
  findByClinicId(clinicId: string): Promise<IClinicTelegramChannel | null>;
}
