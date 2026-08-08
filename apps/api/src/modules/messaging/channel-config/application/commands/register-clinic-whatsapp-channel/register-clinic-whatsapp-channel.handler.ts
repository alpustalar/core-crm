import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MongoTransactionManager } from '@src/infrastructure/persistence/mongo/mongo-transaction.manager';
import { TokenCipherService } from '@src/infrastructure/security/crypto/token-cipher.service';
import {
  CLINIC_WHATSAPP_CHANNEL_COMMAND_REPOSITORY,
  IClinicWhatsappChannelCommandRepository,
} from '@modules/messaging/channel-config/domain/repositories/clinic-whatsapp-channel.repository';
import { ClinicWhatsappChannel } from '@modules/messaging/channel-config/domain/entities/clinic-whatsapp-channel.entity';
import { RegisterClinicWhatsappChannelCommand } from './register-clinic-whatsapp-channel.command';

@CommandHandler(RegisterClinicWhatsappChannelCommand)
export class RegisterClinicWhatsappChannelHandler implements ICommandHandler<
  RegisterClinicWhatsappChannelCommand,
  string
> {
  constructor(
    @Inject(CLINIC_WHATSAPP_CHANNEL_COMMAND_REPOSITORY)
    private readonly channelCommandRepo: IClinicWhatsappChannelCommandRepository,
    private readonly cipher: TokenCipherService,
    private readonly txManager: MongoTransactionManager
  ) {}

  async execute(
    command: RegisterClinicWhatsappChannelCommand
  ): Promise<string> {
    const { clinicId, input, ctx } = command;

    const channel = ClinicWhatsappChannel.create({
      clinicId,
      organizationId: ctx.actor.organizationId!,
      phoneNumberId: input.phoneNumberId,
      wabaId: input.wabaId,
      displayPhoneNumber: input.displayPhoneNumber,
      accessToken: input.accessToken
        ? this.cipher.encrypt(input.accessToken)
        : null,
      verifyToken: input.verifyToken,
    });

    const saved = await this.txManager.run(() =>
      this.channelCommandRepo.upsertByClinicId(channel)
    );
    return saved.id;
  }
}
