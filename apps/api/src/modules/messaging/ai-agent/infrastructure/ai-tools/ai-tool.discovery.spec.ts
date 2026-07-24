import { Injectable, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AiToolRegistry } from './ai-tool.registry';
import {
  AiToolContext,
  AiToolDefinition,
  AiToolResult,
} from '@modules/messaging/ai-agent/domain/ports/ai-tool.port';
import {
  AiTool,
  IAiSubToolHandler,
} from '@modules/messaging/ai-agent/domain/ports/ai-sub-tool.port';

/**
 * DiscoveryService tabanlı toplama sözleşmesi: `@AiTool()` ile işaretli provider'lar
 * hangi modülde olursa olsun keşfedilir; işaretsiz provider'lar dışlanır. Bu, dağıtık
 * araç mimarisinin bel kemiğidir (araçlar domain modüllerinde yaşar, registry merkezde).
 */
class FakeToolBase implements IAiSubToolHandler {
  constructor(public readonly name: string) {}
  get definition(): AiToolDefinition {
    return {
      name: this.name,
      description: `${this.name} aracı`,
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
    };
  }
  async execute(
    _input: Record<string, unknown>,
    _ctx: AiToolContext
  ): Promise<AiToolResult> {
    return { content: this.name };
  }
}

@AiTool()
@Injectable()
class AlphaTool extends FakeToolBase {
  constructor() {
    super('alpha_tool');
  }
}

@AiTool()
@Injectable()
class BetaTool extends FakeToolBase {
  constructor() {
    super('beta_tool');
  }
}

/** İşaretsiz provider — registry tarafından ASLA toplanmamalı. */
@Injectable()
class PlainService {
  ping() {
    return 'pong';
  }
}

@Module({
  imports: [DiscoveryModule],
  providers: [AiToolRegistry, AlphaTool, BetaTool, PlainService],
})
class ProbeToolsModule {}

describe('AiToolRegistry — DiscoveryService keşfi', () => {
  it('yalnızca @AiTool() işaretli provider’ları toplar; işaretsizi dışlar', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ProbeToolsModule],
    }).compile();

    const registry = moduleRef.get(AiToolRegistry);
    // compile() sonrası provider'lar örneklenmiştir; bootstrap keşfini tetikle.
    registry.onApplicationBootstrap();

    expect(registry.resolve('alpha_tool')).toBeInstanceOf(AlphaTool);
    expect(registry.resolve('beta_tool')).toBeInstanceOf(BetaTool);
    const names = registry
      .definitions()
      .map((d) => d.name)
      .sort();
    expect(names).toEqual(['alpha_tool', 'beta_tool']);

    await moduleRef.close();
  });
});
