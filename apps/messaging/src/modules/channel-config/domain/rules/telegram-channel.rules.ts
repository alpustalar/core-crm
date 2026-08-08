import { ClinicTelegramChannel as IClinicTelegramChannel } from '@shared';
import { TelegramChannelStatusSchema } from '@shared';

/**
 * Kanal kuralı entity'den bağımsız saf fonksiyon: yazma tarafı (entity) ve okuma
 * tarafı (düz kayıt döndüren query repo) aynı tanımı paylaşır.
 */
export function isTelegramChannelActive(
  channel: Pick<IClinicTelegramChannel, 'status'>
): boolean {
  return channel.status === TelegramChannelStatusSchema.enum.ACTIVE;
}
