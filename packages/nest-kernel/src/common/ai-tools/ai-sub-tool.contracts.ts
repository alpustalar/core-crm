import {
  AiToolContext,
  AiToolDefinition,
  AiToolResult,
} from './ai-tool.contracts';

/**
 * Bir sınıfın AI aracı (function-calling tool) olduğunu işaretleyen metadata anahtarı.
 * `@AiTool()` bunu class üzerine yazar; `AiToolRegistry` bootstrap'ta `DiscoveryService`
 * ile tüm provider'ları tarayıp bu metadata'ya sahip olanları toplar.
 */
export const AI_TOOL_METADATA = Symbol('AI_TOOL_METADATA');

/**
 * AI aracı stratejilerini işaretleyen class decorator. Araç hangi modülde tanımlı olursa
 * olsun (dağıtık — kendi domain modülünde), bu dekoratör + provider olarak kaydı yeter;
 * merkezi registry onu uygulama-geneli keşifle otomatik toplar. Yeni araç = bu dekoratör
 * + modülün providers dizisine bir satır (registry'ye dokunulmaz — Open/Closed).
 */
export function AiTool(): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(AI_TOOL_METADATA, true, target);
  };
}

/**
 * Tek bir AI aracının (function-calling tool) sözleşmesi — Strategy. Her araç kendi
 * dikey diliminde: LLM'e sunulan tanımını (`definition`) ve çalıştırma mantığını
 * (`execute`) taşır. `AiToolRegistry` bunları isimlerine göre toplar; `AiToolExecutor`
 * yalnız dispatch eder. Araçlar diğer modüllere yalnız CommandBus/QueryBus ile gider.
 */
export interface IAiSubToolHandler {
  /** Aracın benzersiz adı (AI_TOOL_NAMES değeri). Registry anahtarı. */
  readonly name: string;
  /** LLM'e sunulan tanım (isim + açıklama + JSON Schema). */
  readonly definition: AiToolDefinition;
  /** Aracı klinik-kapsamlı bağlamda çalıştırır. */
  execute(
    input: Record<string, unknown>,
    context: AiToolContext
  ): Promise<AiToolResult>;
}
