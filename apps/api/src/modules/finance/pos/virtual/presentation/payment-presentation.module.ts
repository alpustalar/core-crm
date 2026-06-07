import { Module } from '@nestjs/common';
import { IyzicoController } from './controllers/iyzico.controller';
import { PaymentCommandModule } from '@modules/finance/pos/virtual/application/commands/command.module';
import { PaymentQueryModule } from '@modules/finance/pos/virtual/application/queries/query.module';

@Module({
  imports: [PaymentCommandModule, PaymentQueryModule],
  controllers: [IyzicoController],
})
export class PaymentPresentationModule {}
