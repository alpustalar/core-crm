import { AiChatRouterAdapter } from './ai-chat-router.adapter';
import { AnthropicChatAdapter } from './anthropic/anthropic-chat.adapter';
import { GeminiChatAdapter } from './gemini/gemini-chat.adapter';
import { AiReplyRequest } from '@modules/ai-agent/domain/ports/ai-chat.port';

describe('AiChatRouterAdapter (provider yönlendirme)', () => {
  const request = (provider: AiReplyRequest['provider']): AiReplyRequest => ({
    clinicId: 'clinic-1',
    organizationId: 'org-1',
    conversationId: 'conv-1',
    channel: 'WHATSAPP',
    provider,
    model: 'm',
    systemPrompt: null,
    apiKey: 'k',
    maxTokens: null,
    history: [{ role: 'user', content: 'merhaba' }],
    contactName: null,
    contactPhone: '+905550001122',
    patientId: null,
    leadId: null,
  });

  const build = () => {
    const anthropic = {
      generateReply: jest
        .fn()
        .mockResolvedValue({ text: 'A', handoff: false, toolsUsed: [] }),
    } as unknown as AnthropicChatAdapter;
    const gemini = {
      generateReply: jest
        .fn()
        .mockResolvedValue({ text: 'G', handoff: false, toolsUsed: [] }),
    } as unknown as GeminiChatAdapter;
    return {
      router: new AiChatRouterAdapter(anthropic, gemini),
      anthropic,
      gemini,
    };
  };

  it("GEMINI → Gemini adapter'a yönlendirir", async () => {
    const { router, anthropic, gemini } = build();
    const result = await router.generateReply(request('GEMINI'));

    expect(gemini.generateReply).toHaveBeenCalledTimes(1);
    expect(anthropic.generateReply).not.toHaveBeenCalled();
    expect(result.text).toBe('G');
  });

  it("ANTHROPIC → Anthropic adapter'a yönlendirir", async () => {
    const { router, anthropic, gemini } = build();
    const result = await router.generateReply(request('ANTHROPIC'));

    expect(anthropic.generateReply).toHaveBeenCalledTimes(1);
    expect(gemini.generateReply).not.toHaveBeenCalled();
    expect(result.text).toBe('A');
  });
});
