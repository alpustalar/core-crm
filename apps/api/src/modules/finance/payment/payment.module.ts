import { Module } from '@nestjs/common';
import { PaymentCommandModule } from './application/commands/command.module';
import { PaymentQueryModule } from './application/queries/query.module';
import { PaymentEventModule } from './infrastructure/events/payment-event.module';
import { PaymentPresentationModule } from './presentation/payment-presentation.module';
import { PaymentDomainService } from './domain/services/payment-domain.service';

@Module({
  imports: [
    PaymentCommandModule,
    PaymentQueryModule,
    PaymentEventModule,
    PaymentPresentationModule,
  ],
  exports: [
    PaymentCommandModule,
    PaymentQueryModule,
    PaymentEventModule,
    PaymentDomainService,
  ],
  providers: [PaymentDomainService],
})
export class PaymentModule {}
