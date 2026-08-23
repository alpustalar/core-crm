import { Module } from '@nestjs/common';
import { PatientQueryController } from '@modules/crm/patient/presentation/http/controllers/patient.query.controller';

@Module({ controllers: [PatientQueryController] })
export class PatientPresentationModule {}
