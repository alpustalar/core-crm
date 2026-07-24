import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { AiToolDefinition } from '@modules/messaging/ai-agent/domain/ports/ai-tool.port';
import {
  AI_TOOL_METADATA,
  IAiSubToolHandler,
} from '@modules/messaging/ai-agent/domain/ports/ai-sub-tool.port';

/**
 * Tüm AI araç stratejilerini isimlerine göre bir haritada toplar. Araçlar dağıtıktır:
 * her biri kendi domain modülünde `@AiTool()` ile işaretli bir provider'dır. Registry,
 * uygulama tümüyle ayağa kalktıktan sonra (`onApplicationBootstrap`) `DiscoveryService`
 * ile tüm provider'ları tarar, bu metadata'ya sahip olanları toplar. Dispatcher
 * (AiToolExecutor) buradan çözer; tanımları LLM'e bu registry aktarır. İki araç aynı adı
 * kullanırsa erken (bootstrap) hata verir.
 */
@Injectable()
export class AiToolRegistry implements OnApplicationBootstrap {
  private readonly logger = new Logger(AiToolRegistry.name);
  private readonly tools = new Map<string, IAiSubToolHandler>();

  constructor(private readonly discovery: DiscoveryService) {}

  onApplicationBootstrap(): void {
    const discovered = this.discovery
      .getProviders()
      .filter(
        (wrapper) =>
          wrapper.metatype &&
          wrapper.instance &&
          Reflect.getMetadata(AI_TOOL_METADATA, wrapper.metatype) === true
      )
      .map((wrapper) => wrapper.instance as IAiSubToolHandler);

    // Aynı singleton birden çok wrapper altında listelenebilir — instance kimliğiyle tekille.
    const unique = [...new Set(discovered)];
    this.registerAll(unique);
    this.logger.log(`${this.tools.size} AI aracı keşfedildi.`);
  }

  /**
   * Araçları haritaya kaydeder; ad çakışmasını erken reddeder. Bootstrap keşfi ve testler
   * için ortak giriş noktası.
   */
  registerAll(tools: IAiSubToolHandler[]): void {
    for (const tool of tools) {
      const name = tool.name;
      if (this.tools.has(name)) {
        throw new Error(`Yinelenen AI aracı adı: ${name}`);
      }
      this.tools.set(name, tool);
    }
  }

  /** Adına göre aracı çözer; yoksa undefined. */
  resolve(name: string): IAiSubToolHandler | undefined {
    return this.tools.get(name);
  }

  /** Kayıtlı tüm araçların LLM tanımlarını döner (function-calling). */
  definitions(): AiToolDefinition[] {
    return [...this.tools.values()].map((tool) => tool.definition);
  }
}
