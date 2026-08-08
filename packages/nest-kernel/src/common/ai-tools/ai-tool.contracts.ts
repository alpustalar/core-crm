import { MessageChannelType } from '@shared';

export const AI_TOOL_EXECUTOR = Symbol('AiToolExecutor');

/**
 * Bir aracın (function calling) AI'a sunulan tanımı. inputSchema, JSON Schema nesnesidir
 * (Anthropic `input_schema` formatına birebir eşlenir). SDK'ya bağımlı değildir.
 */
export interface AiToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

/** AI'ın çağırdığı tek araç isteği. */
export interface AiToolCall {
  name: string;
  input: Record<string, unknown>;
}

/**
 * Araç çalıştırma sonucu. content modele geri verilen metindir. isHandoff true ise
 * tur sonunda yazışma insana devredilir (handoff aracı).
 */
export interface AiToolResult {
  content: string;
  isHandoff?: boolean;
}

/**
 * Araçların klinik kapsamı + kontak bilgisi. Tüm bus dağıtımları bu bağlamdan üretilen
 * klinik-kapsamlı sistem context'i ile yapılır (cross-module kural: yalnız bus).
 */
export interface AiToolContext {
  clinicId: string;
  organizationId: string;
  conversationId: string;
  /** Yazışmanın kanalı. contactPhone'un anlamını belirler: WHATSAPP'ta doğrulanmış
   *  telefon, TELEGRAM'da chatId, INSTAGRAM'da IGSID. */
  channel: MessageChannelType;
  contactName: string | null;
  contactPhone: string;
  patientId: string | null;
  /** Hasta kaydı yoksa (misafir) yazışmaya bağlı lead; otel/transfer rezervasyonu buna bağlanır. */
  leadId: string | null;
}

/**
 * AI araçlarını (hizmet/fiyat, müsaitlik, randevu, insana devir) CommandBus/QueryBus'a
 * bağlayan çalıştırıcı. Adapter yalnız bu port'a bağlıdır; gerçek bus dağıtımı
 * infrastructure'daki implementasyonda yapılır.
 */
export interface IAiToolExecutor {
  getToolDefinitions(): AiToolDefinition[];
  execute(call: AiToolCall, context: AiToolContext): Promise<AiToolResult>;
}
