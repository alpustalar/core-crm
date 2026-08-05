import { ConnectClinicInstagramChannelHandler } from './connect-clinic-instagram-channel.handler';
import { ConnectClinicInstagramChannelCommand } from './connect-clinic-instagram-channel.command';
import { ClinicInstagramChannel } from '@modules/messaging/channel-config/domain/entities/clinic-instagram-channel.entity';
import { IClinicInstagramChannelCommandRepository } from '@modules/messaging/channel-config/domain/repositories/clinic-instagram-channel.repository';
import { IInstagramGraphApi } from '@modules/messaging/channel-config/domain/interfaces/instagram-graph-api.interface';
import { TokenCipherService } from '@src/infrastructure/security/crypto/token-cipher.service';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

describe('ConnectClinicInstagramChannelHandler (self-service)', () => {
  const ctx = { actor: { userId: 'u1', organizationId: 'org-1' } } as never;
  const longLivedExpiry = new Date('2026-08-23T00:00:00.000Z');

  const build = () => {
    let saved: ClinicInstagramChannel | undefined;

    const graphApi = {
      exchangeCodeForToken: jest
        .fn()
        .mockResolvedValue({ accessToken: 'short', expiresAt: null }),
      exchangeForLongLivedToken: jest
        .fn()
        .mockResolvedValue({ accessToken: 'long', expiresAt: longLivedExpiry }),
      subscribeToWebhooks: jest.fn().mockResolvedValue(undefined),
    } as unknown as IInstagramGraphApi;

    const channelCommandRepo = {
      upsertByClinicId: jest.fn(async (c: ClinicInstagramChannel) => {
        saved = c;
        return c;
      }),
    } as unknown as IClinicInstagramChannelCommandRepository;

    const cipher = {
      encrypt: jest.fn((t: string) => `enc(${t})`),
    } as unknown as TokenCipherService;

    const txManager = {
      run: jest.fn((cb: () => Promise<unknown>) => cb()),
    } as unknown as TransactionManager;

    const handler = new ConnectClinicInstagramChannelHandler(
      graphApi,
      channelCommandRepo,
      cipher,
      txManager
    );
    return { handler, graphApi, cipher, getSaved: () => saved };
  };

  it('kod→token→uzun-ömürlü, webhook abone, şifreli token ile ACTIVE kayıt', async () => {
    const { handler, graphApi, cipher, getSaved } = build();

    const id = await handler.execute(
      new ConnectClinicInstagramChannelCommand({
        clinicId: 'clinic-1',
        input: { code: 'auth', igUserId: 'ig-123', username: 'klinik' },
        ctx,
      })
    );

    expect(graphApi.exchangeCodeForToken).toHaveBeenCalledWith('auth');
    expect(graphApi.exchangeForLongLivedToken).toHaveBeenCalledWith('short');
    expect(graphApi.subscribeToWebhooks).toHaveBeenCalledWith('ig-123', 'long');
    expect(cipher.encrypt).toHaveBeenCalledWith('long');

    const channel = getSaved()!;
    expect(channel.id).toBe(id);
    expect(channel.igUserId).toBe('ig-123');
    expect(channel.accessToken).toBe('enc(long)');
    expect(channel.tokenExpiresAt).toEqual(longLivedExpiry);
    expect(channel.isActive).toBe(true);
  });

  it('uzun-ömürlü exchange başarısızsa kısa-ömürlü ile devam', async () => {
    const { handler, graphApi, cipher, getSaved } = build();
    (graphApi.exchangeForLongLivedToken as jest.Mock).mockRejectedValueOnce(
      new Error('down')
    );

    await handler.execute(
      new ConnectClinicInstagramChannelCommand({
        clinicId: 'clinic-1',
        input: { code: 'auth', igUserId: 'ig-123' },
        ctx,
      })
    );

    expect(graphApi.subscribeToWebhooks).toHaveBeenCalledWith(
      'ig-123',
      'short'
    );
    expect(cipher.encrypt).toHaveBeenCalledWith('short');
    expect(getSaved()!.accessToken).toBe('enc(short)');
  });

  it('webhook abonelik başarısızsa kanal kaydedilmez', async () => {
    const { handler, graphApi, getSaved } = build();
    (graphApi.subscribeToWebhooks as jest.Mock).mockRejectedValueOnce(
      new Error('subscribe failed')
    );

    await expect(
      handler.execute(
        new ConnectClinicInstagramChannelCommand({
          clinicId: 'clinic-1',
          input: { code: 'auth', igUserId: 'ig-123' },
          ctx,
        })
      )
    ).rejects.toThrow('subscribe failed');
    expect(getSaved()).toBeUndefined();
  });
});
