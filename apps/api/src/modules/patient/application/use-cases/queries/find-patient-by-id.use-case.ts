import { Injectable } from '@nestjs/common';
import { PatientRepository } from '@modules/patient/infrastructure/persistence/prisma/repositories';

@Injectable()
export class FindPatientByIdUseCase {
  constructor(private readonly patientRepo: PatientRepository) {}

  execute(id: string) {
    return this.patientRepo.findById(id);
  }
}
