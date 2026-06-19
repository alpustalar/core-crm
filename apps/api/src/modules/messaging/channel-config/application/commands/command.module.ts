import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterClinicWhatsappChannelHandler } from './register-clinic-whatsapp-channel/register-clinic-whatsapp-channel.handler';
import { ClinicWhatsappChannelRepositoryModule } from '@modules/messaging/channel-config/infrastructure/persistence/prisma/repositories/clinic-whatsapp-channel/clinic-whatsapp-channel.repository.module';

const CommandHandlers = [RegisterClinicWhatsappChannelHandler];

@Module({
  imports: [CqrsModule, ClinicWhatsappChannelRepositoryModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class WhatsappChannelCommandModule {}
