/** AI asistan config'i (FE) — anahtar maskeli (yalnız var/yok bilgisi döner). */
export interface AiAgentConfigResponse {
  id: string;
  clinicId: string;
  isEnabled: boolean;
  model: string;
  systemPrompt: string | null;
  hasApiKey: boolean;
  maxTokens: number | null;
  replyOnlyWithinWindow: boolean;
  createdAt: Date;
  updatedAt: Date;
}
