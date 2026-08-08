import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV } from '@common/constants/env.constant';
import {
  AiReplyRequest,
  AiReplyResult,
  IAiChatPort,
} from '@modules/messaging/ai-agent/domain/ports/ai-chat.port';
import {
  AI_TOOL_EXECUTOR,
  AiToolContext,
  IAiToolExecutor,
} from '@common/ai-tools';
import {
  buildSystemPrompt,
  DEFAULT_MAX_TOKENS,
  MAX_TOOL_ITERATIONS,
} from '../ai-chat.constants';
import {
  GEMINI_API_BASE,
  GEMINI_FALLBACK_MODEL,
  GEMINI_TIMEOUT_MS,
} from './gemini.constants';

// ── Gemini REST tipleri (yalnız kullandığımız alt küme) ──
interface GeminiFunctionCall {
  name: string;
  args?: Record<string, unknown>;
}
interface GeminiPart {
  text?: string;
  functionCall?: GeminiFunctionCall;
  functionResponse?: { name: string; response: Record<string, unknown> };
}
interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}
interface GeminiResponse {
  candidates?: { content?: GeminiContent; finishReason?: string }[];
  error?: { message?: string };
}

/** Gemini'nin kabul ettiği OpenAPI-alt-küme şeması (JSON Schema'dan dönüştürülür). */
interface GeminiSchema {
  type: string;
  description?: string;
  enum?: unknown[];
  properties?: Record<string, GeminiSchema>;
  required?: string[];
  items?: GeminiSchema;
}

const JSON_TYPE_TO_GEMINI: Record<string, string> = {
  string: 'STRING',
  number: 'NUMBER',
  integer: 'INTEGER',
  boolean: 'BOOLEAN',
  array: 'ARRAY',
  object: 'OBJECT',
};

/**
 * Google Gemini tabanlı AI sohbet adapter'ı (Anthropic adapter'ın ucuz alternatifi).
 * SDK yerine raw REST (`generateContent`) + manuel function-calling döngüsü kullanır —
 * kod tabanındaki diğer fetch tabanlı kanal adapter'larıyla (Telegram/Instagram) tutarlı.
 * Anahtar klinik config'inden, yoksa platform fallback (ENV.GEMINI_API_KEY) çözülür.
 * Sistem prompt'u + dil politikası Anthropic ile aynı ortak yardımcıdan gelir.
 */
@Injectable()
export class GeminiChatAdapter implements IAiChatPort {
  private readonly logger = new Logger(GeminiChatAdapter.name);

  constructor(
    private readonly config: ConfigService,
    @Inject(AI_TOOL_EXECUTOR)
    private readonly toolExecutor: IAiToolExecutor
  ) {}

  async generateReply(request: AiReplyRequest): Promise<AiReplyResult> {
    const apiKey =
      request.apiKey ?? this.config.get<string>(ENV.GEMINI_API_KEY);
    if (!apiKey) {
      this.logger.warn(
        `Gemini anahtarı yok (clinicId=${request.clinicId}); AI yanıtı üretilemedi.`
      );
      return { text: null, handoff: false, toolsUsed: [] };
    }

    const model = this.resolveModel(request.model);
    const toolContext: AiToolContext = {
      clinicId: request.clinicId,
      organizationId: request.organizationId,
      conversationId: request.conversationId,
      channel: request.channel,
      contactName: request.contactName,
      contactPhone: request.contactPhone,
      patientId: request.patientId,
      leadId: request.leadId,
    };

    const functionDeclarations = this.toolExecutor
      .getToolDefinitions()
      .map((d) => {
        const parameters = this.toGeminiParameters(d.inputSchema);
        return parameters
          ? { name: d.name, description: d.description, parameters }
          : { name: d.name, description: d.description };
      });

    const systemInstruction = {
      parts: [{ text: buildSystemPrompt(request.systemPrompt) }],
    };

    const contents: GeminiContent[] = request.history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const maxTokens = request.maxTokens ?? DEFAULT_MAX_TOKENS;
    const toolsUsed: string[] = [];
    let handoff = false;

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const response = await this.callGemini({
        apiKey,
        model,
        systemInstruction,
        contents,
        functionDeclarations,
        maxTokens,
      });

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      const functionCalls = parts
        .map((p) => p.functionCall)
        .filter((c): c is GeminiFunctionCall => !!c);

      if (functionCalls.length === 0) {
        const text = this.extractText(parts);
        return { text: text || null, handoff, toolsUsed };
      }

      // Modelin turunu (text + functionCall) geçmişe ekle.
      contents.push({ role: 'model', parts });

      const responseParts: GeminiPart[] = [];
      for (const call of functionCalls) {
        toolsUsed.push(call.name);
        const result = await this.toolExecutor.execute(
          { name: call.name, input: call.args ?? {} },
          toolContext
        );
        if (result.isHandoff) handoff = true;
        responseParts.push({
          functionResponse: {
            name: call.name,
            response: { result: result.content },
          },
        });
      }
      contents.push({ role: 'user', parts: responseParts });
    }

    this.logger.warn(
      `AI araç döngüsü limiti aşıldı (clinicId=${request.clinicId}); insana devrediliyor.`
    );
    return { text: null, handoff: true, toolsUsed };
  }

  /** request.model bir Gemini modeli değilse güvenli varsayılana düşer. */
  private resolveModel(requestModel: string): string {
    const fallback =
      this.config.get<string>(ENV.GEMINI_DEFAULT_MODEL) ??
      GEMINI_FALLBACK_MODEL;
    return requestModel && requestModel.toLowerCase().includes('gemini')
      ? requestModel
      : fallback;
  }

  private async callGemini(params: {
    apiKey: string;
    model: string;
    systemInstruction: { parts: { text: string }[] };
    contents: GeminiContent[];
    functionDeclarations: {
      name: string;
      description: string;
      parameters?: GeminiSchema;
    }[];
    maxTokens: number;
  }): Promise<GeminiResponse> {
    const { apiKey, model, systemInstruction, contents, maxTokens } = params;
    const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`;

    const body: Record<string, unknown> = {
      systemInstruction,
      contents,
      generationConfig: { maxOutputTokens: maxTokens },
    };
    if (params.functionDeclarations.length > 0) {
      body.tools = [{ functionDeclarations: params.functionDeclarations }];
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const json = (await res.json()) as GeminiResponse;
      if (!res.ok) {
        throw new Error(
          json.error?.message ?? `Gemini API hatası (HTTP ${res.status}).`
        );
      }
      return json;
    } finally {
      clearTimeout(timeout);
    }
  }

  private extractText(parts: GeminiPart[]): string {
    return parts
      .map((p) => p.text)
      .filter((t): t is string => !!t)
      .join('\n')
      .trim();
  }

  /**
   * JSON Schema (Anthropic input_schema formatı) → Gemini OpenAPI-alt-küme şeması.
   * Gemini `additionalProperties`'i desteklemez (kaldırılır), `type` büyük harfe map'lenir.
   * Parametresiz araçlarda (boş properties) undefined döner → declaration parameters'sız yazılır.
   */
  private toGeminiParameters(
    schema: Record<string, unknown>
  ): GeminiSchema | undefined {
    const converted = this.toGeminiSchema(schema);
    if (
      converted.type === 'OBJECT' &&
      (!converted.properties || Object.keys(converted.properties).length === 0)
    ) {
      return undefined;
    }
    return converted;
  }

  private toGeminiSchema(schema: Record<string, unknown>): GeminiSchema {
    const rawType = typeof schema.type === 'string' ? schema.type : 'object';
    const out: GeminiSchema = {
      type: JSON_TYPE_TO_GEMINI[rawType] ?? rawType.toUpperCase(),
    };

    if (typeof schema.description === 'string') {
      out.description = schema.description;
    }
    if (Array.isArray(schema.enum)) {
      out.enum = schema.enum;
    }
    if (Array.isArray(schema.required)) {
      out.required = schema.required as string[];
    }
    if (schema.properties && typeof schema.properties === 'object') {
      out.properties = {};
      for (const [key, value] of Object.entries(
        schema.properties as Record<string, Record<string, unknown>>
      )) {
        out.properties[key] = this.toGeminiSchema(value);
      }
    }
    if (schema.items && typeof schema.items === 'object') {
      out.items = this.toGeminiSchema(schema.items as Record<string, unknown>);
    }
    return out;
  }
}
