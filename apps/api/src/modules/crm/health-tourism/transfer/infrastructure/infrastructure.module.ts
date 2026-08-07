import { TransferRepositoriesModule } from '@modules/crm/health-tourism/transfer/infrastructure/persistence/prisma/repositories/repositories.module';
import { Module } from '@nestjs/common';
import { TransferCacheModule } from '@modules/crm/health-tourism/transfer/infrastructure/cache/transfer-cache.module';
import { HotelbedsTransferApiModule } from '@modules/crm/health-tourism/transfer/infrastructure/http/hotelbeds-transfer-api.module';

const InfrastructureModules = [
  TransferRepositoriesModule,
  TransferCacheModule,
  HotelbedsTransferApiModule,
];
@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class TransferInfrastructureModule {}
