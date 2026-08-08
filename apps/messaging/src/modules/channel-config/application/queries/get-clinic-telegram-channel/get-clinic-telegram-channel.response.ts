import { QueryResponse } from '@shared/common/response/response.interface';
import { TelegramChannelResponse } from '@shared/modules/messaging/interfaces';

/** Kanal kayıtlı değilse data null döner. */
export type GetClinicTelegramChannelResponse =
  QueryResponse<TelegramChannelResponse | null>;
