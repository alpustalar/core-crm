import { Module } from '@nestjs/common';
import { PosDeviceQueryController } from '@modules/finance/pos/physical/presentation/http/controllers/pos-device.query.controller';
import { PosDeviceCommandController } from '@modules/finance/pos/physical/presentation/http/controllers/pos-device.command.controller';
import { PosCallbackController } from '@modules/finance/pos/physical/presentation/http/controllers/pos-callback.controller';
import { PaxController } from '@modules/finance/pos/physical/presentation/http/controllers/pax.controller';
import { IyzicoTerminalController } from '@modules/finance/pos/physical/presentation/http/controllers/iyzico-terminal.controller';

@Module({
  controllers: [
    PosDeviceQueryController,
    PosDeviceCommandController,
    PosCallbackController,
    PaxController,
    IyzicoTerminalController,
  ],
})
export class PhysicalPosPresentationModule {}
