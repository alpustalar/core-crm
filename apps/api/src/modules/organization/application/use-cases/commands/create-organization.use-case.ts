import { OrganizationRepository } from '@modules/organization/infrastructure/persistence/prisma/repositories/organization.repository';
import { slugIt } from '@common/utils';
import { CreateOrganizationDto } from '@shared';

export class CreateOrganizationUseCase {
  constructor(private orgRepository: OrganizationRepository) {}

  execute(dto: CreateOrganizationDto) {
    const slug = slugIt(dto.name);
    return this.orgRepository.create({ ...dto, slug });
  }
}
