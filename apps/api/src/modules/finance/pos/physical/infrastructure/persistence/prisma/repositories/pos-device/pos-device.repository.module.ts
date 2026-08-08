import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/infrastructure/persistence/prisma/prisma.module';
import { PosDeviceCommandRepository } from './pos-device.command.repository';
import { PosDeviceQueryRepository } from './pos-device.query.repository';
import { POS_DEVICE_COMMAND_REPOSITORY } from '@modules/finance/pos/physical/domain/repositories/pos-device/pos-device.command.repository';
import { POS_DEVICE_QUERY_REPOSITORY } from '@modules/finance/pos/physical/domain/repositories/pos-device/pos-device.query.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: POS_DEVICE_COMMAND_REPOSITORY,
      useClass: PosDeviceCommandRepository,
    },
    {
      provide: POS_DEVICE_QUERY_REPOSITORY,
      useClass: PosDeviceQueryRepository,
    },
  ],
  exports: [POS_DEVICE_COMMAND_REPOSITORY, POS_DEVICE_QUERY_REPOSITORY],
})
export class PosDeviceRepositoryModule {}
