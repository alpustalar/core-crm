import { Module } from '@nestjs/common';
import { TreatmentPackageCommandModule } from './application/commands/command.module';
import { TreatmentPackageQueryModule } from './application/queries/query.module';

@Module({
  imports: [TreatmentPackageCommandModule, TreatmentPackageQueryModule],
})
export class TreatmentPackageModule {}
