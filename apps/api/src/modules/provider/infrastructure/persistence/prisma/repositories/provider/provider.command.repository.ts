import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IProviderCommandRepository } from '@modules/provider/domain/repositories/provider.repository.interface';
import { ConvertUserToProviderDto } from '@shared/modules/provider/dto/convert-user-to-provider.dto';
import { UpdateProviderInfoDto } from '@shared/modules/provider/dto/update-provider-info.dto';
import { Provider } from '@modules/provider/domain/entities/provider.entity';

@Injectable()
export class ProviderCommandRepository
  extends BaseRepository
  implements IProviderCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: ConvertUserToProviderDto): Promise<Provider> {
    const { clinicId, userId, titleId, specialtyId, ...rest } = data;
    const raw = await this.db.provider.create({
      data: {
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
      },
    });
    return new Provider(raw);
  }

  async update(
    providerId: string,
    data: UpdateProviderInfoDto
  ): Promise<Provider> {
    const raw = await this.db.provider.update({
      where: { id: providerId },
      data,
    });
    return new Provider(raw);
  }

  async save(entity: Provider): Promise<Provider> {
    const raw = await this.db.provider.update({
      where: { id: entity.id },
      data: entity.toPersistence(),
    });
    entity.flushEvents();
    return new Provider(raw);
  }

  async softDelete(providerId: string): Promise<void> {
    await this.db.provider.update({
      where: { id: providerId },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
