import { Module } from '@nestjs/common';
import { PosDeviceController } from './controllers/pos-device.controller';
import { PosCallbackController } from './controllers/pos-callback.controller';
import { PaxController } from './controllers/pax.controller';
import { IyzicoTerminalController } from './controllers/iyzico-terminal.controller';

@Module({
  controllers: [
    PosDeviceController,
    PosCallbackController,
    PaxController,
    IyzicoTerminalController,
  ],
})
export class PosPresentationModule {}
