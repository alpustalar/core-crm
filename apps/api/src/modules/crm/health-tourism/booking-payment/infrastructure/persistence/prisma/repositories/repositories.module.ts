import { Module } from '@nestjs/common';
import { BookingPaymentRepositoryModule } from '@modules/crm/health-tourism/booking-payment/infrastructure/persistence/prisma/repositories/booking-payment/booking-payment.repository.module';

@Module({
  imports: [BookingPaymentRepositoryModule],
  exports: [BookingPaymentRepositoryModule],
})
export class BookingPaymentRepositoriesModule {}
