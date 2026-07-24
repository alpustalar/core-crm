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
}

export interface IClinicTelegramChannelQueryRepository {
  /** Klinik config görünümü + webhook routing: yol parametresindeki clinicId → kanal. */
  findByClinicId(clinicId: string): Promise<ClinicTelegramChannel | null>;
}
