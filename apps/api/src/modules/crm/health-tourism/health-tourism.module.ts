import { Module } from '@nestjs/common';
import { HealthTourismPresentationModule } from './presentation/health-tourism.presentation.module';
import { HealthTourismConfigModule } from './config/config.module';
import { BookingPaymentModule } from './booking-payment/booking-payment.module';

@Module({
  imports: [
    HealthTourismPresentationModule,
    HealthTourismConfigModule,
    BookingPaymentModule,
  ],
})
export class HealthTourismModule {}
