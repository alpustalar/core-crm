import { Module } from '@nestjs/common';
import { VirtualPosCommandModule } from './application/commands/command.module';
import { VirtualPosQueryModule } from './application/queries/query.module';
import { PaymentPresentationModule } from './presentation/payment-presentation.module';
import { PosInfrastructureModule } from '@src/infrastructure/payment/pos/pos.infrastructure.module';

@Module({
  imports: [
    VirtualPosCommandModule,
    VirtualPosQueryModule,
    PosInfrastructureModule,
    PaymentPresentationModule,
  ],
  exports: [VirtualPosCommandModule, VirtualPosQueryModule],
})
export class VirtualPosModule {}
