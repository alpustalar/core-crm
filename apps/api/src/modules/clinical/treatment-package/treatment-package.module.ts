import { Module } from '@nestjs/common';
import { TreatmentPackageCommandModule } from './application/commands/command.module';
import { TreatmentPackageQueryModule } from './application/queries/query.module';
import { TreatmentPackageAiToolsModule } from './application/ai-tools/treatment-package-ai-tools.module';

@Module({
  imports: [
    TreatmentPackageCommandModule,
    TreatmentPackageQueryModule,
    TreatmentPackageAiToolsModule,
  ],
})
export class TreatmentPackageModule {}
