import { AiProviderType } from '@shared';
import { MessageChannelType } from '@shared';

export const AI_CHAT_PORT = Symbol('AiChatPort');

/** Modele beslenen tek sohbet turu (kullanıcı/asistan). */
export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * AI yanıt turu girişi. provider, hangi adapter'ın kullanılacağını belirler (router).
 * apiKey null ise adapter provider'a göre platform fallback'ini (ANTHROPIC_API_KEY /
 * GEMINI_API_KEY) kullanır. context, araçların (randevu/müsaitlik) klinik kapsamında
 * çalışabilmesi için gereklidir.
 */
export interface AiReplyRequest {
  clinicId: string;
  organizationId: string;
  conversationId: string;
  channel: MessageChannelType;
  provider: AiProviderType;
  model: string;
  systemPrompt: string | null;
  apiKey: string | null;
  maxTokens: number | null;
  /** Kronolojik sohbet geçmişi (en eski → en yeni); son eleman güncel inbound mesaj. */
  history: AiChatMessage[];
  contactName: string | null;
  contactPhone: string;
  patientId: string | null;
  leadId: string | null;
}

/**
 * AI yanıt sonucu. text null ise gönderilecek metin üretilmedi (ör. yalnız handoff).
 * handoff true ise çağıran (processor) yazışmayı insana devreder.
 */
export interface AiReplyResult {
  text: string | null;
  handoff: boolean;
  toolsUsed: string[];
}

/**
 * Klinik-başına AI sohbet asistanını soyutlayan port. Çekirdek (processor) bu port'a
 * bağlıdır; gerçek sağlayıcı (Anthropic) adapter'ı infrastructure'da takılır. Test/fallback
 * için NoopAiChatAdapter kullanılır (message-channel.port + e-Document Noop deseni).
 */
export interface IAiChatPort {
  generateReply(request: AiReplyRequest): Promise<AiReplyResult>;
}
