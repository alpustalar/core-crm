import { QueryResponse } from '@shared/common/response/response.interface';
import { InstagramChannelResponse } from '@shared/modules/messaging/interfaces';

/** Kanal kayıtlı değilse data null döner. */
export type GetClinicInstagramChannelResponse =
  QueryResponse<InstagramChannelResponse | null>;
