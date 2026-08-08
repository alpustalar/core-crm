import { GetWhatsappTemplatesHandler } from './get-whatsapp-templates.handler';
import { GetWhatsappTemplatesQuery } from './get-whatsapp-templates.query';
import { ClinicWhatsappChannel } from '@modules/channel-config/domain/entities/clinic-whatsapp-channel.entity';
import { IClinicWhatsappChannelQueryRepository } from '@modules/channel-config/domain/repositories/clinic-whatsapp-channel.repository';
import { IWhatsappCloudApi } from '@modules/channel-config/domain/interfaces/whatsapp-cloud-api.interface';
import { TokenCipherService } from '@src/infrastructure/security/crypto/token-cipher.service';

describe('GetWhatsappTemplatesHandler', () => {
  const ctx = { actor: { userId: 'u1' } } as never;

  const build = (channel: ClinicWhatsappChannel | null) => {
    const channelQueryRepo = {
      findByClinicId: jest.fn().mockResolvedValue(channel),
      findByPhoneNumberId: jest.fn(),
    } as unknown as IClinicWhatsappChannelQueryRepository;

    const cloudApi = {
      listMessageTemplates: jest.fn().mockResolvedValue([
        {
          name: 'randevu_hatirlatma',
          language: 'tr',
          status: 'APPROVED',
          category: 'UTILITY',
          components: [{ type: 'BODY', text: 'Merhaba {{1}}' }],
        },
      ]),
    } as unknown as IWhatsappCloudApi;

    const cipher = {
      decrypt: jest.fn((c: string) => `dec(${c})`),
    } as unknown as TokenCipherService;

    return {
      handler: new GetWhatsappTemplatesHandler(
        channelQueryRepo,
        cloudApi,
        cipher
      ),
      cloudApi,
    };
  };

  const channel = (params: {
    accessToken?: string | null;
    wabaId?: string | null;
  }) =>
    ClinicWhatsappChannel.create({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      phoneNumberId: 'pn-1',
      accessToken: 'accessToken' in params ? params.accessToken : 'enc',
      wabaId: 'wabaId' in params ? params.wabaId : 'waba-1',
      isActive: true,
    });

  it('aktif kanal → WABA şablonları döner', async () => {
    const { handler, cloudApi } = build(channel({}));
    const { data } = await handler.execute(
      new GetWhatsappTemplatesQuery('clinic-1', ctx)
    );
    expect(cloudApi.listMessageTemplates).toHaveBeenCalledWith(
      'waba-1',
      'dec(enc)'
    );
    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({
      name: 'randevu_hatirlatma',
      status: 'APPROVED',
    });
  });

  it('kanal yoksa boş liste (API çağrılmaz)', async () => {
    const { handler, cloudApi } = build(null);
    const { data } = await handler.execute(
      new GetWhatsappTemplatesQuery('clinic-1', ctx)
    );
    expect(data).toEqual([]);
    expect(cloudApi.listMessageTemplates).not.toHaveBeenCalled();
  });

  it('wabaId yoksa boş liste', async () => {
    const { handler, cloudApi } = build(channel({ wabaId: null }));
    const { data } = await handler.execute(
      new GetWhatsappTemplatesQuery('clinic-1', ctx)
    );
    expect(data).toEqual([]);
    expect(cloudApi.listMessageTemplates).not.toHaveBeenCalled();
  });
});
