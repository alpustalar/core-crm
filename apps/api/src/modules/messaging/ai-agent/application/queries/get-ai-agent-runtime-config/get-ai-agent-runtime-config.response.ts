import { QueryResponse } from '@shared/common/response/response.interface';

/**
 * AI yanıt akışı için çözülmüş (decrypted) runtime config. SADECE internal
 * (AiReplyProcessor / adapter) akışından kullanılır — controller'a ASLA açılmaz; apiKey
 * düz metindir. apiKey null ise çağıran taraf platform fallback'i (ENV.ANTHROPIC_API_KEY) kullanır.
 */
export interface AiAgentRuntimeConfig {
  isEnabled: boolean;
  model: string;
  systemPrompt: string | null;
  maxTokens: number | null;
  replyOnlyWithinWindow: boolean;
  apiKey: string | null;
}

/** Config yoksa data null döner. */
export type GetAiAgentRuntimeConfigResponse =
  QueryResponse<AiAgentRuntimeConfig | null>;
