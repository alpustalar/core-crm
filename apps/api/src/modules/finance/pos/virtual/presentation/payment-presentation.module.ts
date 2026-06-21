import { Module } from '@nestjs/common';
import { IyzicoController } from './controllers/iyzico.controller';
import { VirtualPosCommandModule } from '@modules/finance/pos/virtual/application/commands/command.module';
import { VirtualPosQueryModule } from '@modules/finance/pos/virtual/application/queries/query.module';

@Module({
  imports: [VirtualPosCommandModule, VirtualPosQueryModule],
  controllers: [IyzicoController],
})
export class PaymentPresentationModule {}
