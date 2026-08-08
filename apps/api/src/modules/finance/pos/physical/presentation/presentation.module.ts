import { Module } from '@nestjs/common';
import { PosDeviceController } from '@modules/finance/pos/physical/presentation/http/controllers/pos-device.controller';
import { PosCallbackController } from '@modules/finance/pos/physical/presentation/http/controllers/pos-callback.controller';
import { PaxController } from '@modules/finance/pos/physical/presentation/http/controllers/pax.controller';
import { IyzicoTerminalController } from '@modules/finance/pos/physical/presentation/http/controllers/iyzico-terminal.controller';

@Module({
  controllers: [
    PosDeviceController,
    PosCallbackController,
    PaxController,
    IyzicoTerminalController,
  ],
})
export class PhysicalPosPresentationModule {}
