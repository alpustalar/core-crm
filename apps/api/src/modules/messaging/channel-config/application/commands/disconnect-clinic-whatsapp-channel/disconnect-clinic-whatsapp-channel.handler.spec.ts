import { NotFoundException } from '@nestjs/common';
import { DisconnectClinicWhatsappChannelHandler } from './disconnect-clinic-whatsapp-channel.handler';
import { DisconnectClinicWhatsappChannelCommand } from './disconnect-clinic-whatsapp-channel.command';
import { ClinicWhatsappChannel } from '@modules/messaging/channel-config/domain/entities/clinic-whatsapp-channel.entity';
import { IClinicWhatsappChannelCommandRepository } from '@modules/messaging/channel-config/domain/repositories/clinic-whatsapp-channel.repository';
import { MongoTransactionManager } from '@src/infrastructure/persistence/mongo/mongo-transaction.manager';

describe('DisconnectClinicWhatsappChannelHandler', () => {
  const ctx = { actor: { userId: 'u1', organizationId: 'org-1' } } as never;

  const build = (channel: ClinicWhatsappChannel | null) => {
    let saved: ClinicWhatsappChannel | undefined;

    const channelCommandRepo = {
      // Kanal kapatma kararını besleyen okuma da Command Repo'dan.
      findByClinicId: jest.fn().mockResolvedValue(channel),
      upsertByClinicId: jest.fn(async (c: ClinicWhatsappChannel) => {
        saved = c;
        return c;
      }),
    } as unknown as IClinicWhatsappChannelCommandRepository;

    const txManager = {
      run: jest.fn((cb: () => Promise<unknown>) => cb()),
    } as unknown as MongoTransactionManager;

    const handler = new DisconnectClinicWhatsappChannelHandler(
      channelCommandRepo,
      txManager
    );
    return { handler, getSaved: () => saved };
  };

  it('kanal yoksa NotFoundException', async () => {
    const { handler } = build(null);
    await expect(
      handler.execute(
        new DisconnectClinicWhatsappChannelCommand('clinic-1', ctx)
      )
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('kanal pasifleştirilir (isActive=false) ve kaydedilir', async () => {
    const channel = ClinicWhatsappChannel.create({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      phoneNumberId: 'pn-1',
      isActive: true,
    });
    const { handler, getSaved } = build(channel);

    await handler.execute(
      new DisconnectClinicWhatsappChannelCommand('clinic-1', ctx)
    );

    expect(getSaved()!.isActive).toBe(false);
  });
});
