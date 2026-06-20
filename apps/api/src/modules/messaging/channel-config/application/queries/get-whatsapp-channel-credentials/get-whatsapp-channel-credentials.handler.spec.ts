import { GetWhatsappChannelCredentialsHandler } from './get-whatsapp-channel-credentials.handler';
import { GetWhatsappChannelCredentialsQuery } from './get-whatsapp-channel-credentials.query';
import { ClinicWhatsappChannel } from '@modules/messaging/channel-config/domain/entities/clinic-whatsapp-channel.entity';
import { IClinicWhatsappChannelQueryRepository } from '@modules/messaging/channel-config/domain/repositories/clinic-whatsapp-channel.repository';
import { TokenCipherService } from '@common/crypto/token-cipher.service';

describe('GetWhatsappChannelCredentialsHandler (decrypted credential — internal)', () => {
  const build = (channel: ClinicWhatsappChannel | null) => {
    const channelQueryRepo = {
      findByClinicId: jest.fn().mockResolvedValue(channel),
      findByPhoneNumberId: jest.fn(),
    } as unknown as IClinicWhatsappChannelQueryRepository;

    const cipher = {
      decrypt: jest.fn((c: string) => `decrypted(${c})`),
    } as unknown as TokenCipherService;

    return {
      handler: new GetWhatsappChannelCredentialsHandler(channelQueryRepo, cipher),
      cipher,
    };
  };

  const activeChannel = (accessToken: string | null) =>
    ClinicWhatsappChannel.create({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      phoneNumberId: 'pn-1',
      accessToken,
      isActive: true,
    });

  it('aktif kanal + token → phoneNumberId + decrypted token döner', async () => {
    const { handler, cipher } = build(activeChannel('enc-token'));

    const { data } = await handler.execute(
      new GetWhatsappChannelCredentialsQuery('clinic-1')
    );

    expect(cipher.decrypt).toHaveBeenCalledWith('enc-token');
    expect(data).toEqual({
      phoneNumberId: 'pn-1',
      accessToken: 'decrypted(enc-token)',
      tokenExpiresAt: null,
      wabaId: null,
    });
  });

  it('kanal yoksa null döner', async () => {
    const { handler } = build(null);
    const { data } = await handler.execute(
      new GetWhatsappChannelCredentialsQuery('clinic-1')
    );
    expect(data).toBeNull();
  });

  it('token yapılandırılmamışsa null döner (decrypt çağrılmaz)', async () => {
    const { handler, cipher } = build(activeChannel(null));
    const { data } = await handler.execute(
      new GetWhatsappChannelCredentialsQuery('clinic-1')
    );
    expect(data).toBeNull();
    expect(cipher.decrypt).not.toHaveBeenCalled();
  });
});
