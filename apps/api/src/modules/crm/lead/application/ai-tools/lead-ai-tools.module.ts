import { Module } from '@nestjs/common';
import { RegisterLeadTool } from './register-lead.tool';

/**
 * Lead (potansiyel hasta) AI araçları. `@AiTool()` ile işaretli; merkezi `AiToolRegistry`
 * uygulama-geneli keşifle toplar. Araç dış modüllere yalnız CommandBus/QueryBus ile gider;
 * `AiToolSupport` global sağlanır — ek import gerekmez.
 */
export const LEAD_AI_TOOLS = [RegisterLeadTool];

@Module({
  providers: LEAD_AI_TOOLS,
})
export class LeadAiToolsModule {}
