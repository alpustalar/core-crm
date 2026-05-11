import { Module } from '@nestjs/common';
import { PaymentUseCaseModule } from '@modules/payment/application/use-cases/payment-use-case.module';
import { IyzicoController } from './controllers/iyzico.controller';

@Module({
  imports: [PaymentUseCaseModule],
  controllers: [IyzicoController],
})
export class PaymentPresentationModule {}
