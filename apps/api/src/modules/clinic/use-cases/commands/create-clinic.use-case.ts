import { Injectable } from '@nestjs/common';
import { ClinicRepository } from '../../repositories/clinic.repository';
import { slugIt } from '@common/utils';
import { ClinicEventPublisher } from '../../events/publisher';
import { ActorContext } from '@common/interfaces';
import { PolicyFactory } from '@common/policy/factory.policy';
import { CreateClinicDto } from '@shared/modules/clinic';

@Injectable()
export class CreateClinicUseCase {
  constructor(
    private readonly clinicRepo: ClinicRepository,
    private readonly clinicEventPublisher: ClinicEventPublisher,
    private readonly policyFactory: PolicyFactory,
  ) {}

  async execute(dto: CreateClinicDto, actor: ActorContext) {
    const { name, organizationId, ...restDto } = dto;
    const slug = slugIt(name);

    const policy = this.policyFactory.organization(actor);

    const orgFilter = policy.getOrganizationFilter(organizationId);

    const clinic = await this.clinicRepo.create({
      name,
      slug,
      organization: orgFilter ? { connect: orgFilter } : undefined,
      ...restDto,
    });

    await this.clinicEventPublisher.createClinic({
      clinicId: clinic.id,
      clinicName: clinic.name,
      userId: actor.userId,
      organizationId: clinic?.organizationId ?? undefined,
    });

    return clinic;
  }
}
