import { Module } from '@nestjs/common';
import { IyzicoController } from './controllers/iyzico.controller';
import { PaymentCommandModule } from '@modules/payment/application/commands/command.module';
import { PaymentQueryModule } from '@modules/payment/application/queries/query.module';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule, PaymentCommandModule, PaymentQueryModule],
  controllers: [IyzicoController],
})
export class PaymentPresentationModule {}
