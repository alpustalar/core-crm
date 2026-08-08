import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import {
  AiToolCall,
  AiToolContext,
  AiToolDefinition,
  AiToolResult,
  IAiToolExecutor,
} from '@common/ai-tools';
import {
  AiToolDefinitionsResponse,
  ExecuteAiToolRequest,
  ExecuteAiToolResponse,
  NATS_CLIENT,
  NATS_SUBJECTS,
} from '@src/transport';

/**
 * Araç çalıştırma core'da kalır (randevu, otel, transfer… core'un aggregate'leri);
 * messaging onları NATS üzerinden çağırır.
 *
 * Zaman aşımı sohbet için seçildi: model bir aracı çağırdığında kullanıcı yanıt bekler,
 * ama core takılırsa yazışma süresiz asılı kalmamalı. Hata durumunda modele "yapılamadı"
 * diyen bir sonuç dönülür — istisna fırlatılmaz, çünkü aracın başarısızlığı sohbeti
 * bitirmemeli, model devam edip kullanıcıya durumu anlatabilmeli.
 */
const TOOL_EXECUTION_TIMEOUT_MS = 20_000;
const DEFINITIONS_TIMEOUT_MS = 5_000;

@Injectable()
export class NatsAiToolExecutor implements IAiToolExecutor, OnModuleInit {
  private readonly logger = new Logger(NatsAiToolExecutor.name);

  /**
   * Araç tanımları her LLM çağrısında gerekir ama nadiren değişir (yalnız core yeniden
   * dağıtıldığında). Her sohbet turunda RPC yapmak yerine açılışta bir kez çekilir.
   */
  private definitions: AiToolDefinition[] = [];

  constructor(@Inject(NATS_CLIENT) private readonly client: ClientProxy) {}

  async onModuleInit(): Promise<void> {
    await this.refreshDefinitions();
  }

  getToolDefinitions(): AiToolDefinition[] {
    if (this.definitions.length === 0) {
      // Açılışta core hazır değildiyse boş kalmış olabilir; arka planda tazele.
      // Bu tur araçsız gider (model yine yanıt üretir), sonraki tur araçlı olur.
      void this.refreshDefinitions();
    }
    return this.definitions;
  }

  async execute(
    call: AiToolCall,
    context: AiToolContext
  ): Promise<AiToolResult> {
    const request: ExecuteAiToolRequest = { call, context };

    try {
      return await firstValueFrom(
        this.client
          .send<ExecuteAiToolResponse, ExecuteAiToolRequest>(
            NATS_SUBJECTS.aiTool.execute,
            request
          )
          .pipe(timeout(TOOL_EXECUTION_TIMEOUT_MS))
      );
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.warn(`Araç çağrısı başarısız (${call.name}): ${reason}`);
      return { content: `Bu işlem şu anda gerçekleştirilemedi: ${reason}` };
    }
  }

  private async refreshDefinitions(): Promise<void> {
    try {
      this.definitions = await firstValueFrom(
        this.client
          .send<AiToolDefinitionsResponse, Record<string, never>>(
            NATS_SUBJECTS.aiTool.definitions,
            {}
          )
          .pipe(timeout(DEFINITIONS_TIMEOUT_MS))
      );
      this.logger.log(`${this.definitions.length} AI aracı core'dan alındı.`);
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'Bilinmeyen hata';
      // Açılışı bloklamaz: core sonra ayağa kalkabilir, ilk sohbet turunda tekrar denenir.
      this.logger.warn(`AI araç tanımları alınamadı: ${reason}`);
    }
  }
}
