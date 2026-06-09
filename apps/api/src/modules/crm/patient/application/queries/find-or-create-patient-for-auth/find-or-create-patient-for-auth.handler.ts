import {
  IPatientRepository,
  PATIENT_REPOSITORY,
} from '@modules/crm/patient/domain/repositories/patient.repository.interface';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Patient } from '@modules/crm/patient/domain/entities/patient.entity';
import { FindOrCreatePatientForAuthQuery } from './find-or-create-patient-for-auth.query';

@QueryHandler(FindOrCreatePatientForAuthQuery)
export class FindOrCreatePatientForAuthHandler
  implements IQueryHandler<FindOrCreatePatientForAuthQuery, Patient>
{
  constructor(
    @Inject(PATIENT_REPOSITORY)
    private readonly patientRepo: IPatientRepository
  ) {}

  execute(query: FindOrCreatePatientForAuthQuery): Promise<Patient> {
    return this.patientRepo.findOrCreateByPhone(query.dto);
  }

  // TODO: DTO düzeltilecek firebaseUid ile db id aynı olacak. İş mantığı belirlenecek
}
