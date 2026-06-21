import { ConnectClinicWhatsappChannelHandler } from './connect-clinic-whatsapp-channel.handler';
import { ConnectClinicWhatsappChannelCommand } from './connect-clinic-whatsapp-channel.command';
import { ClinicWhatsappChannel } from '@modules/messaging/channel-config/domain/entities/clinic-whatsapp-channel.entity';
import { IClinicWhatsappChannelCommandRepository } from '@modules/messaging/channel-config/domain/repositories/clinic-whatsapp-channel.repository';
import { IWhatsappCloudApi } from '@modules/messaging/channel-config/domain/interfaces/whatsapp-cloud-api.interface';
import { TokenCipherService } from '@src/infrastructure/security/crypto/token-cipher.service';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

describe('ConnectClinicWhatsappChannelHandler (Embedded Signup self-service)', () => {
  const ctx = { actor: { userId: 'u1', organizationId: 'org-1' } } as never;

  const longLivedExpiry = new Date('2026-08-19T00:00:00.000Z');

  const build = () => {
    let saved: ClinicWhatsappChannel | undefined;

    const cloudApi = {
      exchangeCodeForToken: jest
        .fn()
        .mockResolvedValue({ accessToken: 'short-token', expiresAt: null }),
      exchangeForLongLivedToken: jest.fn().mockResolvedValue({
        accessToken: 'long-token',
        expiresAt: longLivedExpiry,
      }),
      subscribeAppToWaba: jest.fn().mockResolvedValue(undefined),
      registerPhoneNumber: jest.fn().mockResolvedValue(undefined),
    } as unknown as IWhatsappCloudApi;

    const channelCommandRepo = {
      save: jest.fn(async (c: ClinicWhatsappChannel) => {
        saved = c;
        return c;
      }),
    } as unknown as IClinicWhatsappChannelCommandRepository;

    const cipher = {
      encrypt: jest.fn((t: string) => `enc(${t})`),
    } as unknown as TokenCipherService;

    const txManager = {
      run: jest.fn((cb: () => Promise<unknown>) => cb()),
    } as unknown as TransactionManager;

    const handler = new ConnectClinicWhatsappChannelHandler(
      cloudApi,
      channelCommandRepo,
      cipher,
      txManager
    );
    return { handler, cloudApi, cipher, getSaved: () => saved };
  };

  it('kod→token→uzun-ömürlü, WABA subscribe, register (PIN), şifreli token+PIN ile kayıt', async () => {
    const { handler, cloudApi, cipher, getSaved } = build();

    const id = await handler.execute(
      new ConnectClinicWhatsappChannelCommand(
        'clinic-1',
        { code: 'auth-code', wabaId: 'waba-9', phoneNumberId: 'pn-9' },
        ctx
      )
    );

    expect(cloudApi.exchangeCodeForToken).toHaveBeenCalledWith('auth-code');
    // Kısa-ömürlü → uzun-ömürlü exchange yapılır.
    expect(cloudApi.exchangeForLongLivedToken).toHaveBeenCalledWith(
      'short-token'
    );
    // Sonraki çağrılar uzun-ömürlü token'la yapılır.
    expect(cloudApi.subscribeAppToWaba).toHaveBeenCalledWith(
      'waba-9',
      'long-token'
    );
    // Numara Cloud API'ye 6-haneli PIN ile register edilir.
    const registerCall = (cloudApi.registerPhoneNumber as jest.Mock).mock
      .calls[0];
    expect(registerCall[0]).toBe('pn-9');
    expect(registerCall[1]).toMatch(/^\d{6}$/);
    expect(registerCall[2]).toBe('long-token');

    expect(cipher.encrypt).toHaveBeenCalledWith('long-token');
    expect(cipher.encrypt).toHaveBeenCalledWith(registerCall[1]); // PIN şifreli

    const channel = getSaved()!;
    expect(channel.id).toBe(id);
    expect(channel.accessToken).toBe('enc(long-token)');
    expect(channel.tokenExpiresAt).toEqual(longLivedExpiry);
    expect(channel.registrationPin).toBe(`enc(${registerCall[1]})`);
    expect(channel.registeredAt).toBeInstanceOf(Date);
    expect(channel.isActive).toBe(true);
  });

  it('uzun-ömürlü exchange başarısızsa kısa-ömürlü token ile devam eder (kritik değil)', async () => {
    const { handler, cloudApi, cipher, getSaved } = build();
    (cloudApi.exchangeForLongLivedToken as jest.Mock).mockRejectedValueOnce(
      new Error('exchange down')
    );

    await handler.execute(
      new ConnectClinicWhatsappChannelCommand(
        'clinic-1',
        { code: 'c', wabaId: 'w', phoneNumberId: 'p' },
        ctx
      )
    );

    expect(cloudApi.subscribeAppToWaba).toHaveBeenCalledWith(
      'w',
      'short-token'
    );
    expect(cipher.encrypt).toHaveBeenCalledWith('short-token');
    expect(getSaved()!.accessToken).toBe('enc(short-token)');
  });

  it('WABA subscribe başarısızsa kanal kaydedilmez', async () => {
    const { handler, cloudApi, getSaved } = build();
    (cloudApi.subscribeAppToWaba as jest.Mock).mockRejectedValueOnce(
      new Error('subscribe failed')
    );

    await expect(
      handler.execute(
        new ConnectClinicWhatsappChannelCommand(
          'clinic-1',
          { code: 'c', wabaId: 'w', phoneNumberId: 'p' },
          ctx
        )
      )
    ).rejects.toThrow('subscribe failed');
    expect(getSaved()).toBeUndefined();
  });

  it('numara register başarısızsa kanal kaydedilmez', async () => {
    const { handler, cloudApi, getSaved } = build();
    (cloudApi.registerPhoneNumber as jest.Mock).mockRejectedValueOnce(
      new Error('register failed')
    );

    await expect(
      handler.execute(
        new ConnectClinicWhatsappChannelCommand(
          'clinic-1',
          { code: 'c', wabaId: 'w', phoneNumberId: 'p' },
          ctx
        )
      )
    ).rejects.toThrow('register failed');
    expect(getSaved()).toBeUndefined();
  });
});
