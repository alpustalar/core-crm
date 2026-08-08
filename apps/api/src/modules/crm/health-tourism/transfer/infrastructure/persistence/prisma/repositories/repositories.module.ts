import { Module } from '@nestjs/common';
import { HotelbedsTransferBookingRepositoryModule } from '@modules/crm/health-tourism/transfer/infrastructure/persistence/prisma/repositories/hotelbeds-transfer-booking/hotelbeds-transfer-booking.repository.module';

const RepositoriesModules = [HotelbedsTransferBookingRepositoryModule];
@Module({
  imports: [...RepositoriesModules],
  exports: [...RepositoriesModules],
})
export class TransferRepositoriesModule {}
