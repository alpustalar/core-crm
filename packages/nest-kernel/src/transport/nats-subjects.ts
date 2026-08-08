import { ActorContext } from '@common/interfaces';
import {
  AiToolCall,
  AiToolContext,
  AiToolDefinition,
  AiToolResult,
} from '@common/ai-tools';
import { MessageChannelType as MessageChannel } from '@shared';
import { VerifiedToken } from '../auth/token-verifier.port';

/**
 * Servisler arası NATS konuları — **tek kaynak**.
 *
 * Auth Redis anahtarlarıyla aynı gerekçe: bu adlar bir süreç sınırını aşıyor. İki tarafta
 * ayrı ayrı yazılsalardı, bir harflik fark hiçbir derleme hatası vermez; istek sessizce
 * kimseye ulaşmaz ve yalnız zaman aşımı olarak görünürdü.
 *
 * Adlandırma: `<sahip>.<alan>.<eylem>`. `core.*` konularını `apps/api` dinler,
 * `messaging.*` konularını `apps/messaging`.
 */
export const NATS_SUBJECTS = {
  /** İstek/yanıt — messaging → core. */
  aiTool: {
    definitions: 'core.ai-tool.definitions',
    execute: 'core.ai-tool.execute',
  },
  auth: {
    /** ActorContext cache-miss'inde çözümleme. */
    resolveActor: 'core.auth.resolve-actor',
  },
  contact: {
    findPatient: 'core.contact.find-patient',
    registerAdReferralLead: 'core.contact.register-ad-referral-lead',
  },
  /** Olay (fire-and-forget) — core → messaging. */
  booking: {
    confirmed: 'messaging.booking.confirmed',
  },
} as const;

// ─── İstek/yanıt gövdeleri ───────────────────────────────────────────────────
// Her iki servis de bu tipleri kullanır; wire sözleşmesi tek yerde tanımlıdır.

export interface ExecuteAiToolRequest {
  readonly call: AiToolCall;
  readonly context: AiToolContext;
}
export type ExecuteAiToolResponse = AiToolResult;
export type AiToolDefinitionsResponse = AiToolDefinition[];

export type ResolveActorRequest = VerifiedToken;
/** Kullanıcı yoksa/pasifse `null`. */
export type ResolveActorResponse = ActorContext | null;

export interface FindPatientRequest {
  readonly clinicId: string;
  readonly channel: MessageChannel;
  /** Kanalın kontak kimliği: WhatsApp'ta telefon, Telegram'da chatId, Instagram'da IGSID. */
  readonly contactPhone: string;
  /** Kontak paylaşımıyla gelen doğrulanmış telefon (Telegram/Instagram akışı). */
  readonly matchPhone?: string | null;
}
/** Eşleşme yoksa (misafir) `null`. */
export type FindPatientResponse = string | null;

export interface RegisterAdReferralLeadRequest {
  readonly clinicId: string;
  readonly organizationId: string;
  readonly channel: MessageChannel;
  readonly contactPhone: string;
  readonly contactName?: string | null;
  readonly referral: {
    readonly adId: string | null;
    readonly ctwaClid: string | null;
    readonly sourceUrl: string | null;
  };
}
/** Lead üretilemezse `null`. */
export type RegisterAdReferralLeadResponse = string | null;

/** core → messaging olayı: ödeme onaylandı, hastaya kanaldan bilgi verilecek. */
export interface BookingConfirmedEventPayload {
  readonly clinicId: string;
  readonly conversationId: string;
  readonly bookingType: string;
  readonly referenceCode: string;
  readonly summary: string;
}
