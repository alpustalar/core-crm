import { Injectable } from '@nestjs/common';
import { FindPatientByIdUseCase } from '@modules/patient/application/use-cases/queries';

@Injectable()
export class PatientModuleApi {
  constructor(
    private readonly findPatientByIdUseCase: FindPatientByIdUseCase
  ) {}

  findPatientById(id: string) {
    return this.findPatientByIdUseCase.execute(id);
  }
}
