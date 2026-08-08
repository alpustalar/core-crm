import { ConfigService } from '@nestjs/config';
import { GeminiChatAdapter } from './gemini-chat.adapter';
import { AiReplyRequest } from '@modules/ai-agent/domain/ports/ai-chat.port';
import { AiToolDefinition, IAiToolExecutor } from '@common/ai-tools';

describe('GeminiChatAdapter (REST function-calling döngüsü)', () => {
  const request = (over: Partial<AiReplyRequest> = {}): AiReplyRequest => ({
    clinicId: 'clinic-1',
    organizationId: 'org-1',
    conversationId: 'conv-1',
    channel: 'WHATSAPP',
    provider: 'GEMINI',
    model: 'gemini-2.0-flash',
    systemPrompt: null,
    apiKey: 'g-key',
    maxTokens: null,
    history: [{ role: 'user', content: 'merhaba' }],
    contactName: 'Ali',
    contactPhone: '+905550001122',
    patientId: null,
    leadId: null,
    ...over,
  });

  const build = (opts?: {
    toolDefs?: AiToolDefinition[];
    execute?: jest.Mock;
    configGet?: (key: string) => unknown;
  }) => {
    const config = {
      get: jest.fn((k: string) => opts?.configGet?.(k)),
    } as unknown as ConfigService;

    const toolExecutor = {
      getToolDefinitions: jest.fn().mockReturnValue(opts?.toolDefs ?? []),
      execute: opts?.execute ?? jest.fn(),
    } as unknown as IAiToolExecutor;

    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    return { adapter: new GeminiChatAdapter(config, toolExecutor), fetchMock };
  };

  const geminiText = (text: string) => ({
    ok: true,
    json: async () => ({
      candidates: [
        { content: { role: 'model', parts: [{ text }] }, finishReason: 'STOP' },
      ],
    }),
  });

  const geminiFunctionCall = (name: string, args: Record<string, unknown>) => ({
    ok: true,
    json: async () => ({
      candidates: [
        {
          content: { role: 'model', parts: [{ functionCall: { name, args } }] },
        },
      ],
    }),
  });

  it('anahtar yoksa (config + fallback boş) çağrı yapılmaz, boş yanıt döner', async () => {
    const { adapter, fetchMock } = build();
    const result = await adapter.generateReply(request({ apiKey: null }));

    expect(result).toEqual({ text: null, handoff: false, toolsUsed: [] });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('düz metin yanıtı döner (functionCall yok), doğru URL', async () => {
    const { adapter, fetchMock } = build();
    fetchMock.mockResolvedValueOnce(geminiText('Merhaba!'));

    const result = await adapter.generateReply(request());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain('/models/gemini-2.0-flash:generateContent');
    expect(url).toContain('key=g-key');
    expect(result.text).toBe('Merhaba!');
    expect(result.handoff).toBe(false);
  });

  it('functionCall → araç çalıştırılır, ikinci turda metin döner; handoff yansıtılır; tool şeması Gemini formatına çevrilir', async () => {
    const execute = jest
      .fn()
      .mockResolvedValue({ content: 'devredildi', isHandoff: true });
    const { adapter, fetchMock } = build({
      toolDefs: [
        {
          name: 'handoff_to_human',
          description: 'devret',
          inputSchema: {
            type: 'object',
            properties: { reason: { type: 'string' } },
            required: ['reason'],
            additionalProperties: false,
          },
        },
      ],
      execute,
    });
    fetchMock
      .mockResolvedValueOnce(
        geminiFunctionCall('handoff_to_human', { reason: 'x' })
      )
      .mockResolvedValueOnce(geminiText('Sizi aktarıyorum.'));

    const result = await adapter.generateReply(request());

    expect(execute).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.text).toBe('Sizi aktarıyorum.');
    expect(result.handoff).toBe(true);
    expect(result.toolsUsed).toContain('handoff_to_human');

    const decl = JSON.parse(fetchMock.mock.calls[0][1].body).tools[0]
      .functionDeclarations[0];
    expect(decl.parameters.type).toBe('OBJECT');
    expect(decl.parameters.properties.reason.type).toBe('STRING');
    expect(decl.parameters).not.toHaveProperty('additionalProperties');
  });

  it("parametresiz araç (boş properties) → declaration parameters'sız yazılır", async () => {
    const { adapter, fetchMock } = build({
      toolDefs: [
        {
          name: 'list_providers',
          description: 'doktorlar',
          inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false,
          },
        },
      ],
    });
    fetchMock.mockResolvedValueOnce(geminiText('ok'));

    await adapter.generateReply(request());

    const decl = JSON.parse(fetchMock.mock.calls[0][1].body).tools[0]
      .functionDeclarations[0];
    expect(decl.name).toBe('list_providers');
    expect(decl).not.toHaveProperty('parameters');
  });

  it('Gemini modeli olmayan model (ör. claude) verilirse fallback modele düşer', async () => {
    const { adapter, fetchMock } = build();
    fetchMock.mockResolvedValueOnce(geminiText('ok'));

    await adapter.generateReply(request({ model: 'claude-haiku-4-5' }));

    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain('/models/gemini-2.0-flash:generateContent');
  });

  it('Gemini hata dönerse fırlatır', async () => {
    const { adapter, fetchMock } = build();
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ error: { message: 'rate limit' } }),
    });

    await expect(adapter.generateReply(request())).rejects.toThrow(
      /rate limit/
    );
  });
});
