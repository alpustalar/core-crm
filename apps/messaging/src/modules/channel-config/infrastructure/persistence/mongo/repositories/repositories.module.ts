import { Module } from '@nestjs/common';
import { ClinicInstagramChannelRepositoryModule } from './clinic-instagram-channel/clinic-instagram-channel.repository.module';
import { ClinicTelegramChannelRepositoryModule } from './clinic-telegram-channel/clinic-telegram-channel.repository.module';
import { ClinicWhatsappChannelRepositoryModule } from './clinic-whatsapp-channel/clinic-whatsapp-channel.repository.module';

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
