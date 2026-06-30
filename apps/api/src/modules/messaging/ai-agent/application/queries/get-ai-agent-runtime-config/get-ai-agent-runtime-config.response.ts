import { QueryResponse } from '@shared/common/response/response.interface';
import { AiProviderType } from '@input-type-schemas/AiProviderSchema';

/**
 * AI yanıt akışı için çözülmüş (decrypted) runtime config. SADECE internal
 * (AiReplyProcessor / adapter) akışından kullanılır — controller'a ASLA açılmaz; apiKey
 * düz metindir. apiKey null ise çağıran taraf provider'a göre platform fallback'i
 * (ANTHROPIC_API_KEY / GEMINI_API_KEY) kullanır.
 */
export interface AiAgentRuntimeConfig {
  isEnabled: boolean;
  provider: AiProviderType;
  model: string;
  systemPrompt: string | null;
  maxTokens: number | null;
  replyOnlyWithinWindow: boolean;
  apiKey: string | null;
}

/** Config yoksa data null döner. */
export type GetAiAgentRuntimeConfigResponse =
  QueryResponse<AiAgentRuntimeConfig | null>;
