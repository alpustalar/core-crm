import { Module } from '@nestjs/common';
import { IyzicoQueryController } from './controllers/iyzico.query.controller';
import { IyzicoCommandController } from './controllers/iyzico.command.controller';
import { VirtualPosCommandModule } from '@modules/finance/pos/virtual/application/commands/command.module';
import { VirtualPosQueryModule } from '@modules/finance/pos/virtual/application/queries/query.module';

@Module({
  imports: [VirtualPosCommandModule, VirtualPosQueryModule],
  controllers: [IyzicoQueryController, IyzicoCommandController],
})
export class PaymentPresentationModule {}
