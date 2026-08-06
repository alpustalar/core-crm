import { Module } from '@nestjs/common';
import { TreatmentPackageAiToolsModule } from '@modules/clinical/treatment-package/application/ai-tools/treatment-package-ai-tools.module';
import { TreatmentPackageCommandModule } from '@modules/clinical/treatment-package/application/commands/command.module';
import { TreatmentPackageQueryModule } from '@modules/clinical/treatment-package/application/queries/query.module';

const ApplicationModules = [
  TreatmentPackageAiToolsModule,
  TreatmentPackageCommandModule,
  TreatmentPackageQueryModule,
];
@Module({
  imports: [...ApplicationModules],
  exports: [...ApplicationModules],
})
export class TreatmentPackageApplicationModule {}
