import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TreatmentPackageCommandModule } from './application/commands/command.module';
import { TreatmentPackageQueryModule } from './application/queries/query.module';

@Module({
  imports: [
    CqrsModule,
    TreatmentPackageCommandModule,
    TreatmentPackageQueryModule,
  ],
  providers: [],
  exports: [],
})
export class TreatmentPackageModule {}
