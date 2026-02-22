import { OrganizationRepository } from '../../repositories/organization.repository';
import { CreateOrganizationDto } from '../../dto/create-organization.dto';
import { slugIt } from '@common/utils';

export class CreateOrganizationUseCase {
  constructor(private orgRepository: OrganizationRepository) {}

  async execute(dto: CreateOrganizationDto) {
    const slug = slugIt(dto.name);
    return await this.orgRepository.create({ ...dto, slug });
  }
}
