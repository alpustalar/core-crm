import { ConfigService } from '@nestjs/config';
import { AnthropicChatAdapter } from './anthropic-chat.adapter';
import {
  AiReplyRequest,
} from '@modules/messaging/ai-agent/domain/ports/ai-chat.port';
import { IAiToolExecutor } from '@modules/messaging/ai-agent/domain/ports/ai-tool.port';

const mockCreate = jest.fn();

jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  })),
}));

describe('AnthropicChatAdapter (tool-use döngüsü)', () => {
  const request = (over: Partial<AiReplyRequest> = {}): AiReplyRequest => ({
    clinicId: 'clinic-1',
    organizationId: 'org-1',
    conversationId: 'conv-1',
    channel: 'WHATSAPP',
    provider: 'ANTHROPIC',
    model: 'claude-haiku-4-5',
    systemPrompt: null,
    apiKey: 'sk-clinic',
    maxTokens: null,
    history: [{ role: 'user', content: 'merhaba' }],
    contactName: 'Ali',
    contactPhone: '+905550001122',
    patientId: null,
    leadId: null,
    ...over,
  });

  const build = (toolExecOver: Partial<IAiToolExecutor> = {}) => {
    const config = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    const toolExecutor = {
      getToolDefinitions: jest.fn().mockReturnValue([]),
      execute: jest.fn(),
      ...toolExecOver,
    } as unknown as IAiToolExecutor;

    const adapter = new AnthropicChatAdapter(config, toolExecutor);
    return { adapter, config, toolExecutor };
  };

  beforeEach(() => mockCreate.mockReset());

  it('anahtar yoksa (config + platform fallback boş) çağrı yapılmaz, boş yanıt döner', async () => {
    const { adapter } = build();
    const result = await adapter.generateReply(request({ apiKey: null }));

    expect(result).toEqual({ text: null, handoff: false, toolsUsed: [] });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('düz metin yanıtı döner (araç yok)', async () => {
    mockCreate.mockResolvedValueOnce({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Merhaba, nasıl yardımcı olabilirim?' }],
    });

    const { adapter } = build();
    const result = await adapter.generateReply(request());

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(result.text).toBe('Merhaba, nasıl yardımcı olabilirim?');
    expect(result.handoff).toBe(false);
  });

  it('tool-use → araç çalıştırılır, sonra nihai metin döner; handoff yansıtılır', async () => {
    mockCreate
      .mockResolvedValueOnce({
        stop_reason: 'tool_use',
        content: [
          {
            type: 'tool_use',
            id: 'tu-1',
            name: 'handoff_to_human',
            input: { reason: 'yetkili istendi' },
          },
        ],
      })
      .mockResolvedValueOnce({
        stop_reason: 'end_turn',
        content: [{ type: 'text', text: 'Sizi yetkiliye aktarıyorum.' }],
      });

    const execute = jest.fn().mockResolvedValue({
      content: 'devredildi',
      isHandoff: true,
    });

    const { adapter } = build({ execute });
    const result = await adapter.generateReply(request());

    expect(execute).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(result.text).toBe('Sizi yetkiliye aktarıyorum.');
    expect(result.handoff).toBe(true);
    expect(result.toolsUsed).toContain('handoff_to_human');
  });
});
