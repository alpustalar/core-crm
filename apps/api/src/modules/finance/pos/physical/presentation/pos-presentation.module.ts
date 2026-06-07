import { Module } from '@nestjs/common';
import { PosDeviceController } from './controllers/pos-device.controller';
import { PosCallbackController } from './controllers/pos-callback.controller';
import { PaxController } from './controllers/pax.controller';

@Module({
  controllers: [PosDeviceController, PosCallbackController, PaxController],
})
export class PosPresentationModule {}
