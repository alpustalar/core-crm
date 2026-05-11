import { ConvertUserToProviderDto } from '@shared';
import { Prisma } from '@prisma/client';
import { connect } from '@src/infrastructure/persistence/prisma/helpers';
import { UpdateProviderDto } from '@shared/modules/provider/dto/update-provider.dto';

export class ProviderCommandsPrismaMapper {
  constructor() {}
  static toCreateInput(dto: ConvertUserToProviderDto) {
    const { clinicId, userId, titleId, specialtyId, ...rest } = dto;
    const data: Prisma.ProviderCreateInput = {
      ...rest,
      clinic: {
        connect: { id: clinicId },
      },
      user: {
        connect: { id: userId },
      },
      title: {
        connect: { id: titleId },
      },
      specialty: {
        connect: { id: specialtyId },
      },
    };
    return data;
  }

  static toUpdateInput(dto: UpdateProviderDto) {
    const { titleId, specialtyId, clinicId, ...rest } = dto;

    const updateData: Prisma.ProviderUpdateInput = { ...rest };

    if (titleId) {
      updateData.title = connect(titleId);
    }
    if (specialtyId) {
      updateData.specialty = connect(specialtyId);
    }
    if (clinicId) {
      updateData.clinic = connect(clinicId);
    }

    return updateData;
  }
}
