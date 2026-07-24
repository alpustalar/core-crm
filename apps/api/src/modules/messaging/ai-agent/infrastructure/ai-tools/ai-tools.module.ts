import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { AiToolExecutor } from './ai-tool-executor.service';
import { AiToolRegistry } from './ai-tool.registry';
import { AiToolSupport } from './ai-tool.support';
import { HandoffToHumanTool } from './handoff-to-human.tool';

/**
 * AI aracı çekirdeği (dağıtık Strategy + merkezi Registry/Dispatcher).
 *
 * - Araçlar artık kendi domain modüllerinde yaşar (`<domain>/application/ai-tools/`), her
 *   biri `@AiTool()` ile işaretli bir provider'dır. `AiToolRegistry`, `DiscoveryModule`
 *   yardımıyla uygulama-geneli keşifle hepsini toplar — bu modül domain modüllerini
 *   IMPORT ETMEZ (cross-module kural korunur; araçlar yalnız CommandBus/QueryBus kullanır).
 * - Modül `@Global`: `AiToolSupport` (araçların paylaştığı bus-orkestrasyon yardımcısı)
 *   dağıtık araçlara import coupling olmadan görünür olsun diye export edilir.
 * - `HandoffToHumanTool` domaine ait olmayan tek jenerik araçtır; burada provide edilir.
 */
@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [
    AiToolSupport,
    AiToolRegistry,
    AiToolExecutor,
    HandoffToHumanTool,
  ],
  exports: [AiToolExecutor, AiToolSupport],
})
export class AiToolsModule {}
