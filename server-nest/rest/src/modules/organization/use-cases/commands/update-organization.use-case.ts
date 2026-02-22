import { OrganizationRepository } from '../../repositories/organization.repository';
import { FindOneUseCase } from '../queries/find-one.use-case';
import { UpdateOrganizationDto } from '../../dto/update-organization.dto';
import { NotFoundException } from '@nestjs/common';
import { ActorContext } from '../../../../common/interfaces';

export class UpdateOrganizationUseCase {
  constructor(
    private readonly orgRepo: OrganizationRepository,
    private readonly findOrganization: FindOneUseCase,
  ) {}

  async execute(
    actor: ActorContext,
    dto: UpdateOrganizationDto,
    organizationId?: string,
  ) {
    const org = await this.findOrganization.execute(actor, organizationId);

    if (!org) {
      throw new NotFoundException('organizasyon bulunamadı');
    }

    return await this.orgRepo.updateByOwner(org.id, dto);
  }
}
