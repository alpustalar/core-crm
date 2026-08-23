import { defineEndpoint } from '@shared/common/contracts/endpoint';
import {
  AssignConversationSchema,
  SendMessageSchema,
} from '../schemas/commands';
import { GetConversationsSchema } from '../schemas/queries';
import type { ConversationResponse, MessageResponse } from '../interfaces';

/**
 * `apps/messaging` → `ConversationController`.
 *
 * **Yollar `/messaging` önekiyle yazılır.** Messaging ayrı bir servis (:8081) ama
 * dışarıya tek origin olarak görünür: ters vekil `/api/v1/messaging/*` isteklerini
 * oraya, kalan her şeyi api'ye (:8080) yönlendirir (`infra/nginx/core-crm.conf`).
 * Servisin ikiye bölünmüş olduğu bilgisi istemciye sızmaz — yalnız yol öneki bilinir.
 *
 * Yerel geliştirmede vekil varsayılan olarak kapalı; istemci bu önekli yolları
 * `NEXT_PUBLIC_MESSAGING_API_URL` verilmişse doğrudan messaging'e gönderir
 * (bkz. `apps/web/src/lib/api/client.ts`).
 */
export const messagingEndpoints = {
  conversations: defineEndpoint<ConversationResponse[]>()({
    method: 'GET',
    path: (p: { clinicId: string }) =>
      `/messaging/clinics/${p.clinicId}/conversations`,
    query: GetConversationsSchema,
  }),

  messages: defineEndpoint<MessageResponse[]>()({
    method: 'GET',
    path: (p: { clinicId: string; conversationId: string }) =>
      `/messaging/clinics/${p.clinicId}/conversations/${p.conversationId}/messages`,
  }),

  /** Gönderilen mesajın id'si döner (CLAUDE.md: create → `string`). */
  sendMessage: defineEndpoint<string>()({
    method: 'POST',
    path: (p: { clinicId: string; conversationId: string }) =>
      `/messaging/clinics/${p.clinicId}/conversations/${p.conversationId}/messages`,
    body: SendMessageSchema,
  }),

  markRead: defineEndpoint<void>()({
    method: 'POST',
    path: (p: { clinicId: string; conversationId: string }) =>
      `/messaging/clinics/${p.clinicId}/conversations/${p.conversationId}/read`,
  }),

  close: defineEndpoint<void>()({
    method: 'POST',
    path: (p: { clinicId: string; conversationId: string }) =>
      `/messaging/clinics/${p.clinicId}/conversations/${p.conversationId}/close`,
  }),

  assign: defineEndpoint<void>()({
    method: 'POST',
    path: (p: { clinicId: string; conversationId: string }) =>
      `/messaging/clinics/${p.clinicId}/conversations/${p.conversationId}/assign`,
    body: AssignConversationSchema,
  }),
};
