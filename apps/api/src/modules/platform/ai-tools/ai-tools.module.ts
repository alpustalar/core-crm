import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { AI_TOOL_EXECUTOR } from '@common/ai-tools';
import { AiToolExecutor } from './infrastructure/ai-tool-executor.service';
import { AiToolRegistry } from './infrastructure/ai-tool.registry';
import { AiToolSupport } from './application/ai-tool.support';
import { HandoffToHumanTool } from './infrastructure/handoff-to-human.tool';

/**
 * AI aracı çekirdeği — CORE tarafında yaşayan tool gateway (dağıtık Strategy + merkezi
 * Registry/Dispatcher).
 *
 * - Araçlar kendi domain modüllerinde yaşar (`<domain>/application/ai-tools/`), her biri
 *   `@AiTool()` ile işaretli bir provider'dır. `AiToolRegistry`, `DiscoveryModule`
 *   yardımıyla uygulama-geneli keşifle hepsini toplar — bu modül domain modüllerini
 *   IMPORT ETMEZ (cross-module kural korunur; araçlar yalnız CommandBus/QueryBus kullanır).
 * - Modül `@Global`: `AiToolSupport` (araçların paylaştığı bus-orkestrasyon yardımcısı)
 *   dağıtık araçlara import coupling olmadan görünür olsun diye export edilir.
 * - `HandoffToHumanTool` domaine ait olmayan tek jenerik araçtır; bus dağıtımı yoktur
 *   (saf yanıt), bu yüzden burada provide edilir.
 *
 * **Sınır:** Tüketici (messaging) yalnız `AI_TOOL_EXECUTOR` token'ını + `@common/ai-tools`
 * sözleşmelerini bilir; `AiToolExecutor`/`AiToolRegistry` sınıflarını görmez. Faz 3'te
 * messaging ayrı servise çıkınca aynı token bir NATS istemcisine bağlanır ve sohbet
 * adapter'larında tek satır değişmez.
 */
@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [
    AiToolSupport,
    AiToolRegistry,
    AiToolExecutor,
    HandoffToHumanTool,
    { provide: AI_TOOL_EXECUTOR, useExisting: AiToolExecutor },
  ],
  exports: [AI_TOOL_EXECUTOR, AiToolSupport],
})
export class AiToolsModule {}
