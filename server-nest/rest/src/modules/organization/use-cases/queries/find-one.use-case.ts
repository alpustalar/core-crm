import { OrganizationRepository } from '../../repositories/organization.repository';
import { Organization } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { ActorContext } from '../../../../common/interfaces';

export class FindOneUseCase {
  constructor(private readonly orgRepo: OrganizationRepository) {}

  async execute(actor: ActorContext, organizationId?: string) {
    let organization: Organization | null;
    if (organizationId) {
      organization = await this.orgRepo.findOneByIdByOwner(
        actor.userId,
        organizationId,
      );
    } else {
      organization = await this.orgRepo.findFirstByOwnerCredentials(
        actor.userId,
      );
    }

    if (!organization) {
      throw new NotFoundException('Organizasyon bulunamadı');
    }
    return organization;
  }
}
