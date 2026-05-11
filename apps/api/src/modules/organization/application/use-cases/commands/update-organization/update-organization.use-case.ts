import { OrganizationRepository } from '@modules/organization/infrastructure/persistence/prisma/repositories/organization.repository';
import { FindOneUseCase } from '../../queries/find-one/find-one.use-case';
import { NotFoundException } from '@nestjs/common';
import { ActorContext } from '@common/interfaces';
import { UpdateOrganizationDto } from '@shared';

export type UpdateOrganizationInput = {
  actor: ActorContext;
  dto: UpdateOrganizationDto;
  organizationId?: string;
};

export class UpdateOrganizationUseCase {
  constructor(
    private readonly orgRepo: OrganizationRepository,
    private readonly findOrganization: FindOneUseCase
  ) {}

  async execute({ actor, dto, organizationId }: UpdateOrganizationInput) {
    const org = await this.findOrganization.execute(actor, organizationId);

    if (!org) {
      throw new NotFoundException('organizasyon bulunamadı');
    }

    return this.orgRepo.updateByOwner(org.id, dto);
  }
}
