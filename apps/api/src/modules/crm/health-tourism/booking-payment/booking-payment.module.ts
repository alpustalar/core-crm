import { Module } from '@nestjs/common';
import { BookingPaymentPresentationModule } from './presentation/presentation.module';
import { BookingPaymentApplicationModule } from '@modules/crm/health-tourism/booking-payment/application/application.module';
import { BookingPaymentInfrastructureModule } from '@modules/crm/health-tourism/booking-payment/infrastructure/infrastructure.module';

@Module({
  imports: [
    BookingPaymentApplicationModule,
    BookingPaymentPresentationModule,
    BookingPaymentInfrastructureModule,
  ],
})
export class BookingPaymentModule {}
