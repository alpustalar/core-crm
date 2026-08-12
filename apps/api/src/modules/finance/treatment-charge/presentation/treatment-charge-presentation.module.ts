import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TreatmentChargeController } from './http/controllers/treatment-charge.controller';

@Module({
  imports: [CqrsModule],
  controllers: [TreatmentChargeController],
})
export class TreatmentChargePresentationModule {}
