import { Module } from '@nestjs/common';
import { BookingPaymentPresentationModule } from './presentation/presentation.module';

@Module({ imports: [BookingPaymentPresentationModule] })
export class BookingPaymentModule {}
