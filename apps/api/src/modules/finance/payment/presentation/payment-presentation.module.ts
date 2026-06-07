import { Module } from '@nestjs/common';
import { IyzicoController } from './controllers/iyzico.controller';
import { PaymentCommandModule } from '@modules/finance/payment/application/commands/command.module';
import { PaymentQueryModule } from '@modules/finance/payment/application/queries/query.module';

@Module({
  imports: [PaymentCommandModule, PaymentQueryModule],
  controllers: [IyzicoController],
})
export class PaymentPresentationModule {}
