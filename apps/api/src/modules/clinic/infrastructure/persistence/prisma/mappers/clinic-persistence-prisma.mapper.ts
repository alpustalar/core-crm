import { CreateClinicDto } from '@shared';
import { slugIt } from '@common/utils';
import { GlobalStatusSchema } from '@input-type-schemas/GlobalStatusSchema';

export class ClinicPersistencePrismaMapper {
  constructor() {}

  static toCreateClinicInput(dto: CreateClinicDto) {
    const { name, organizationId, sectorId, status, ...restDto } = dto;
    return {
      name,
      slug: slugIt(dto.name),
      organizationId,
      sectorId,
      status: status ?? GlobalStatusSchema.enum.ACTIVE,
      logo: null,
      ...restDto,
    };
  }
}
