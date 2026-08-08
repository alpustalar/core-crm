import { QueryResponse } from '@shared/common/response/response.interface';

/**
 * Instagram webhook routing: gelen olaydaki IG hesap id'sinden (entry.id) klinik kimliği.
 * SADECE internal (webhook controller) kullanır; token içermez.
 */
export interface InstagramChannelRouting {
  clinicId: string;
  organizationId: string;
  isActive: boolean;
}

/** Hesap eşleşmezse data null döner. */
export type FindInstagramChannelByIgUserIdResponse =
  QueryResponse<InstagramChannelRouting | null>;
