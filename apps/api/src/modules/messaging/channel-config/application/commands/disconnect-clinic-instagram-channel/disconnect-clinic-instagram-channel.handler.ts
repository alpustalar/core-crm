import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  CLINIC_INSTAGRAM_CHANNEL_COMMAND_REPOSITORY,
  CLINIC_INSTAGRAM_CHANNEL_QUERY_REPOSITORY,
  IClinicInstagramChannelCommandRepository,
  IClinicInstagramChannelQueryRepository,
} from '@modules/messaging/channel-config/domain/repositories/clinic-instagram-channel.repository';
import { DisconnectClinicInstagramChannelCommand } from './disconnect-clinic-instagram-channel.command';

@CommandHandler(DisconnectClinicInstagramChannelCommand)
export class DisconnectClinicInstagramChannelHandler
  implements ICommandHandler<DisconnectClinicInstagramChannelCommand, void>
{
  constructor(
    @Inject(CLINIC_INSTAGRAM_CHANNEL_QUERY_REPOSITORY)
    private readonly channelQueryRepo: IClinicInstagramChannelQueryRepository,
    @Inject(CLINIC_INSTAGRAM_CHANNEL_COMMAND_REPOSITORY)
    private readonly channelCommandRepo: IClinicInstagramChannelCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(
    command: DisconnectClinicInstagramChannelCommand
  ): Promise<void> {
    const channel = await this.channelQueryRepo.findByClinicId(
      command.clinicId
    );
    if (!channel) throw new NotFoundException('Instagram kanalı bulunamadı.');

    channel.deactivate();
    await this.txManager.run(() => this.channelCommandRepo.save(channel));
  }
}
