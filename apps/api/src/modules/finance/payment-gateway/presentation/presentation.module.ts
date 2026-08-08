import { Module } from '@nestjs/common';
import { ClinicPaymentGatewayController } from '@modules/finance/payment-gateway/presentation/http/controllers/payment-gateway.controller';

@Module({ controllers: [ClinicPaymentGatewayController] })
export class ClinicPaymentGatewayPresentationModule {}
