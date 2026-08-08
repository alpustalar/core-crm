import { Module } from '@nestjs/common';
import { ClinicPaymentGatewayPresentationModule } from './presentation/presentation.module';

@Module({ imports: [ClinicPaymentGatewayPresentationModule] })
export class PaymentGatewayModule {}
