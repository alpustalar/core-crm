import { Module } from '@nestjs/common';
import { GetClinicServicesTool } from './get-clinic-services.tool';
import { GetPatientPackagesTool } from './get-patient-packages.tool';

/**
 * Tedavi paketi (hizmet/seans) AI araçları — kliniğin sunduğu hizmetler
 * (`FindTreatmentPackagesQuery`) ve hastanın kalan seansları (`FindPatientPackagesQuery`)
 * treatment-package modülünün query'leridir (öz hakiki modül = treatment-package).
 * `@AiTool()` ile işaretli; merkezi `AiToolRegistry` uygulama-geneli keşifle toplar.
 * Araçlar dış modüllere yalnız CommandBus/QueryBus ile gider; `AiToolSupport` global
 * sağlanır — ek import gerekmez.
 */
export const TREATMENT_PACKAGE_AI_TOOLS = [
  GetClinicServicesTool,
  GetPatientPackagesTool,
];

@Module({
  providers: TREATMENT_PACKAGE_AI_TOOLS,
})
export class TreatmentPackageAiToolsModule {}
