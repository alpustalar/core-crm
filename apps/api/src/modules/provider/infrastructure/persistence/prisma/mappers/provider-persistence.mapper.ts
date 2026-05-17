import { ConvertUserToProviderDto, UpdateProviderDto } from '@shared';
import { Prisma } from '@prisma/client';
import { connect } from '@src/infrastructure/persistence/prisma/helpers';

export class ProviderPersistenceMapper {
  static toCreate(dto: ConvertUserToProviderDto) {
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

  static toUpdate(dto: UpdateProviderDto) {
    const { providerTitleId, providerSpecialtyId, clinicId, ...rest } = dto;

    const updateData: Prisma.ProviderUpdateInput = { ...rest };

    if (providerTitleId) {
      updateData.title = connect(providerTitleId);
    }
    if (providerSpecialtyId) {
      updateData.specialty = connect(providerSpecialtyId);
    }
    if (clinicId) {
      updateData.clinic = connect(clinicId);
    }

    return updateData;
  }
}
