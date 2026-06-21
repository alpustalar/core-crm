export interface CreateClinicAiAgentConfigProps {
  id?: string;
  clinicId: string;
  organizationId: string;
  isEnabled?: boolean;
  model?: string;
  systemPrompt?: string | null;
  /** Şifreli saklanır (TokenCipherService); null → platform anahtarı kullanılır. */
  apiKey?: string | null;
  maxTokens?: number | null;
  replyOnlyWithinWindow?: boolean;
}

export interface UpdateClinicAiAgentConfigProps {
  isEnabled?: boolean;
  model?: string;
  systemPrompt?: string | null;
  /** Şifreli; `undefined` → mevcut anahtar korunur. */
  apiKey?: string | null;
  maxTokens?: number | null;
  replyOnlyWithinWindow?: boolean;
}
