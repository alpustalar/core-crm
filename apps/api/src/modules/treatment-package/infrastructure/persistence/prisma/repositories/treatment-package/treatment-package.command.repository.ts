import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ITreatmentPackageCommandRepository } from '../../../../../domain/repositories/treatment-package.repository.interface';
import { CreateTreatmentPackageProps } from '@modules/treatment-package/domain/types/create-treatment-package.props';

@Injectable()
export class TreatmentPackageCommandRepository
  extends BaseRepository
  implements ITreatmentPackageCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(props: CreateTreatmentPackageProps) {
    const {
      clinicId,
      name,
      examinationCount,
      controlCount,
      validityDays,
      price,
      providerIds,
      items,
    } = props;

    return this.db.treatmentPackage.create({
      data: {
        clinicId,
        name,
        examinationCount,
        controlCount,
        validityDays,
        price,
        providers: providerIds?.length
          ? { create: providerIds.map((providerId) => ({ providerId })) }
          : undefined,
        items: items?.length
          ? {
              create: items.map(({ treatmentId, count }) => ({
                treatmentId,
                count,
              })),
            }
          : undefined,
      },
    });
  }

  async update(id: string, props: Partial<CreateTreatmentPackageProps>) {
    const { providerIds, items, ...rest } = props;

    return this.db.treatmentPackage.update({
      where: { id },
      data: {
        ...rest,
        ...(providerIds !== undefined && {
          providers: {
            deleteMany: {},
            create: providerIds.map((providerId) => ({ providerId })),
          },
        }),
        ...(items !== undefined && {
          items: {
            deleteMany: {},
            create: items.map(({ treatmentId, count }) => ({
              treatmentId,
              count,
            })),
          },
        }),
      },
    });
  }

  async softDelete(id: string) {
    await this.db.treatmentPackage.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
