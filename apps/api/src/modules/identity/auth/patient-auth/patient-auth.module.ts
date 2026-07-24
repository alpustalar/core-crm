import { Module } from '@nestjs/common';
import { PatientAuthService } from './patient-auth.service';
import { PatientAuthController } from './patient-auth.controller';
import { PatientGuard } from './guards/patient.guard';
import { FirebaseModule } from '@src/infrastructure/firebase/firebase.module';
import { PatientModule } from '@modules/crm/patient/patient.module';

@Module({
  imports: [FirebaseModule, PatientModule],
  providers: [PatientAuthService, PatientGuard],
  controllers: [PatientAuthController],
  exports: [PatientGuard, PatientAuthService],
})
export class PatientAuthModule {}
