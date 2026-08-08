import { QueryResponse } from '@shared/common/response/response.interface';

/** Var olan bir yazışmanın eşleme durumu. */
export interface ConversationContactState {
  conversationId: string;
  patientId: string | null;
}

/** Yazışma henüz yoksa data null döner (yeni kontak → ör. ilk Telegram mesajı). */
export type GetConversationContactStateResponse =
  QueryResponse<ConversationContactState | null>;
