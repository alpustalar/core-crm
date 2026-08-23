import { Module } from '@nestjs/common';
import { PosDeviceQueryController } from '@modules/finance/pos/physical/presentation/http/controllers/pos-device.query.controller';
import { PosDeviceCommandController } from '@modules/finance/pos/physical/presentation/http/controllers/pos-device.command.controller';
import { PosCallbackController } from '@modules/finance/pos/physical/presentation/http/controllers/pos-callback.controller';
import { PaxController } from '@modules/finance/pos/physical/presentation/http/controllers/pax.controller';
import { IyzicoTerminalCommandController } from '@modules/finance/pos/physical/presentation/http/controllers/iyzico-terminal.command.controller';

@Module({
  controllers: [
    PosDeviceQueryController,
    PosDeviceCommandController,
    PosCallbackController,
    PaxController,
    IyzicoTerminalCommandController,
  ],
})
export class PhysicalPosPresentationModule {}
