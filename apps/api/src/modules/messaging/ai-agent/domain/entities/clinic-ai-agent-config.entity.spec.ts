import { ClinicAiAgentConfig } from './clinic-ai-agent-config.entity';

describe('ClinicAiAgentConfig entity', () => {
  const create = () =>
    ClinicAiAgentConfig.create({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
    });

  it('create: güvenli varsayılanlar (pasif, haiku, pencere-içi)', () => {
    const config = create();
    expect(config.isEnabled).toBe(false);
    expect(config.model).toBe('claude-haiku-4-5');
    expect(config.replyOnlyWithinWindow).toBe(true);
    expect(config.apiKey).toBeNull();
    expect(config.systemPrompt).toBeNull();
    expect(config.id).toBeDefined();
  });

  it('enable/disable durumu değiştirir', () => {
    const config = create();
    config.enable();
    expect(config.isEnabled).toBe(true);
    config.disable();
    expect(config.isEnabled).toBe(false);
  });

  it('canReply yalnız etkinken true', () => {
    const config = create();
    expect(config.canReply()).toBe(false);
    config.enable();
    expect(config.canReply()).toBe(true);
  });

  it('updateSettings: sağlanan alanları günceller', () => {
    const config = create();
    config.updateSettings({
      isEnabled: true,
      model: 'claude-opus-4-8',
      systemPrompt: 'Sen bir asistansın',
      apiKey: 'encrypted-key',
      maxTokens: 2048,
      replyOnlyWithinWindow: false,
    });

    expect(config.isEnabled).toBe(true);
    expect(config.model).toBe('claude-opus-4-8');
    expect(config.systemPrompt).toBe('Sen bir asistansın');
    expect(config.apiKey).toBe('encrypted-key');
    expect(config.maxTokens).toBe(2048);
    expect(config.replyOnlyWithinWindow).toBe(false);
  });

  it('updateSettings: apiKey undefined → mevcut anahtar korunur', () => {
    const config = ClinicAiAgentConfig.create({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      apiKey: 'mevcut-key',
    });

    config.updateSettings({ model: 'claude-opus-4-8' });

    expect(config.apiKey).toBe('mevcut-key');
    expect(config.model).toBe('claude-opus-4-8');
  });
});
