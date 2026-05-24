import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PosDeviceController } from './controllers/pos-device.controller';
import { PosCallbackController } from './controllers/pos-callback.controller';
import { PaxController } from './controllers/pax.controller';

@Module({
  imports: [CqrsModule],
  controllers: [PosDeviceController, PosCallbackController, PaxController],
})
export class PosPresentationModule {}
