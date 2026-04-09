import { ClinicRepository } from '@modules/clinic/infrastructure/persistence/prisma/repositories/clinic.repository';
import { ActorContext } from '@common/interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FindManyByOrganizationIdUseCase {
  constructor(private readonly clinicRepo: ClinicRepository) {}

  async execute(organizationId: string, actor?: ActorContext) {
    return await this.clinicRepo.findManyByOrganizationId(organizationId);
  }
}
