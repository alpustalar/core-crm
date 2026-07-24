import { Module } from '@nestjs/common';
import { ListProvidersTool } from './list-providers.tool';
import { GetProviderDetailsTool } from './get-provider-details.tool';
import { CheckProviderAvailabilityTool } from './check-provider-availability.tool';

/**
 * Provider (hekim/uzman) AI araçları — hekim dizini (`FindProvidersDirectoryQuery`) ve
 * hekim müsaitliği (`GetProviderAvailabilityQuery`, bus ile appointment modülünden) provider
 * kapsamıdır (öz hakiki modül = provider). `@AiTool()` ile işaretli; merkezi `AiToolRegistry`
 * uygulama-geneli keşifle toplar. Araçlar dış modüllere yalnız CommandBus/QueryBus ile gider;
 * `AiToolSupport` global sağlanır — ek import gerekmez.
 */
export const PROVIDER_AI_TOOLS = [
  ListProvidersTool,
  GetProviderDetailsTool,
  CheckProviderAvailabilityTool,
];

@Module({
  providers: PROVIDER_AI_TOOLS,
})
export class ProviderAiToolsModule {}
