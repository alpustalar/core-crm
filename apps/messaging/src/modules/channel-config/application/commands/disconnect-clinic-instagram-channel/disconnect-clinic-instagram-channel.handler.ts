import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ChannelNotConnectedException } from '@modules/channel-config/domain/exceptions/channel-config.exceptions';
import { MongoTransactionManager } from '@src/infrastructure/persistence/mongo/mongo-transaction.manager';
import {
  CLINIC_INSTAGRAM_CHANNEL_COMMAND_REPOSITORY,
  IClinicInstagramChannelCommandRepository,
} from '@modules/channel-config/domain/repositories/clinic-instagram-channel.repository';
import { DisconnectClinicInstagramChannelCommand } from './disconnect-clinic-instagram-channel.command';

@CommandHandler(DisconnectClinicInstagramChannelCommand)
export class DisconnectClinicInstagramChannelHandler implements ICommandHandler<
  DisconnectClinicInstagramChannelCommand,
  void
> {
  constructor(
    @Inject(CLINIC_INSTAGRAM_CHANNEL_COMMAND_REPOSITORY)
    private readonly channelCommandRepo: IClinicInstagramChannelCommandRepository,
    private readonly txManager: MongoTransactionManager
  ) {}

  async execute(
    command: DisconnectClinicInstagramChannelCommand
  ): Promise<void> {
    const channel = await this.channelCommandRepo.findByClinicId(
      command.clinicId
    );
    if (!channel) throw new ChannelNotConnectedException(
        'INSTAGRAM',
        command.clinicId
      );

    channel.deactivate();
    await this.txManager.run(() =>
      this.channelCommandRepo.upsertByClinicId(channel)
    );
  }
}
