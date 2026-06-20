import { NotFoundException } from '@nestjs/common';
import { DisconnectClinicWhatsappChannelHandler } from './disconnect-clinic-whatsapp-channel.handler';
import { DisconnectClinicWhatsappChannelCommand } from './disconnect-clinic-whatsapp-channel.command';
import { ClinicWhatsappChannel } from '@modules/messaging/channel-config/domain/entities/clinic-whatsapp-channel.entity';
import {
  IClinicWhatsappChannelCommandRepository,
  IClinicWhatsappChannelQueryRepository,
} from '@modules/messaging/channel-config/domain/repositories/clinic-whatsapp-channel.repository';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

describe('DisconnectClinicWhatsappChannelHandler', () => {
  const ctx = { actor: { userId: 'u1', organizationId: 'org-1' } } as never;

  const build = (channel: ClinicWhatsappChannel | null) => {
    let saved: ClinicWhatsappChannel | undefined;

    const channelQueryRepo = {
      findByClinicId: jest.fn().mockResolvedValue(channel),
      findByPhoneNumberId: jest.fn(),
    } as unknown as IClinicWhatsappChannelQueryRepository;

    const channelCommandRepo = {
      save: jest.fn(async (c: ClinicWhatsappChannel) => {
        saved = c;
        return c;
      }),
    } as unknown as IClinicWhatsappChannelCommandRepository;

    const txManager = {
      run: jest.fn((cb: () => Promise<unknown>) => cb()),
    } as unknown as TransactionManager;

    const handler = new DisconnectClinicWhatsappChannelHandler(
      channelQueryRepo,
      channelCommandRepo,
      txManager
    );
    return { handler, getSaved: () => saved };
  };

  it('kanal yoksa NotFoundException', async () => {
    const { handler } = build(null);
    await expect(
      handler.execute(new DisconnectClinicWhatsappChannelCommand('clinic-1', ctx))
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
