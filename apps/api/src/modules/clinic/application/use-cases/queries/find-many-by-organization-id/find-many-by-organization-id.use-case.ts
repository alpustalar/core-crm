import { Inject, Injectable } from '@nestjs/common';
import {
  CLINIC_REPO_TOKEN,
  IClinicRepository,
} from '@modules/clinic/domain/repositories/clinic.repository.interface';

@Injectable()
export class FindManyByOrganizationIdUseCase {
  constructor(
    @Inject(CLINIC_REPO_TOKEN)
    private readonly clinicRepo: IClinicRepository
  ) {}

  async execute(organizationId: string) {
    return await this.clinicRepo.findManyByOrganizationId(organizationId);
  }
}
