import { Module } from '@nestjs/common';
import { PatientQueryModule } from '@modules/crm/patient/application/queries/query.module';
import { PatientCommandModule } from '@modules/crm/patient/application/commands/command.module';
import { PatientPresentationModule } from '@modules/crm/patient/presentation/presentation.module';

/**
 * `app.routes.ts` bu modülü `patients` yoluna bağlar. Modül bugüne dek boştu:
 * hasta kayıtlarına yalnız cross-module (lead dönüşümü, hasta portalı) erişiliyor,
 * personel için bir HTTP yüzeyi yoktu. Okuma uçları (liste + detay) buradan açılır.
 */
@Module({
  imports: [PatientQueryModule, PatientCommandModule, PatientPresentationModule],
})
export class PatientModule {}
