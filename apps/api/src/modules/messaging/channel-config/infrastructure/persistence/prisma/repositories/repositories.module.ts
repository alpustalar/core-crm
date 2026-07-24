import { Module } from '@nestjs/common';
import { ClinicInstagramChannelRepositoryModule } from '@modules/messaging/channel-config/infrastructure/persistence/prisma/repositories/clinic-instagram-channel/clinic-instagram-channel.repository.module';
import { ClinicTelegramChannelRepositoryModule } from '@modules/messaging/channel-config/infrastructure/persistence/prisma/repositories/clinic-telegram-channel/clinic-telegram-channel.repository.module';
import { ClinicWhatsappChannelRepositoryModule } from '@modules/messaging/channel-config/infrastructure/persistence/prisma/repositories/clinic-whatsapp-channel/clinic-whatsapp-channel.repository.module';

const Modules = [
  ClinicInstagramChannelRepositoryModule,
  ClinicTelegramChannelRepositoryModule,
  ClinicWhatsappChannelRepositoryModule,
];

@Module({
  imports: Modules,
  exports: Modules,
})
export class RepositoriesModule {}
