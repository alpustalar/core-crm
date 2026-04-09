import { Injectable } from '@nestjs/common';
import { ClinicRepository } from '@modules/clinic/infrastructure/persistence/prisma/repositories/clinic.repository';
import { slugIt } from '@common/utils';
import { ClinicEventPublisher } from '../../../infrastructure/publisher';
import { ActorContext } from '@common/interfaces';
import { PolicyFactory } from '@modules/policy/policy-factory';
import { CreateClinicDto } from '@shared';

@Injectable()
export class CreateClinicUseCase {
  constructor(
    private readonly clinicRepo: ClinicRepository,
    private readonly clinicEventPublisher: ClinicEventPublisher,
    private readonly policyFactory: PolicyFactory
  ) {}

  async execute(dto: CreateClinicDto, actor: ActorContext) {
    const { name, organizationId, ...restDto } = dto;
    const slug = slugIt(name);

    const { policy } = this.policyFactory.organization(actor);

    const orgFilter = policy.getOrganizationFilter(organizationId);

    const clinic = await this.clinicRepo.create({
      name,
      slug,
      organization: orgFilter ? { connect: orgFilter } : undefined,
      ...restDto,
    });

    this.clinicEventPublisher.createClinic({
      clinicId: clinic.id,
      userId: actor.userId,
      organizationId: clinic?.organizationId ?? undefined,
      source: actor?.source,
    });

    return clinic;
  }
}
