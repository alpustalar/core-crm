import { Module } from '@nestjs/common';
import { FindPosDevicesHandler } from './find-pos-devices/find-pos-devices.handler';
import { PosDeviceRepositoryModule } from '@modules/finance/pos/physical/infrastructure/persistence/prisma/repositories/pos-device/pos-device.repository.module';

export const POS_QUERY_HANDLERS = [FindPosDevicesHandler];

@Module({
  imports: [PosDeviceRepositoryModule],
  providers: POS_QUERY_HANDLERS,
  exports: POS_QUERY_HANDLERS,
})
export class PhysicalPosQueryModule {}
