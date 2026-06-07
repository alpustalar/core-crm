import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IProviderCommandRepository } from '@modules/clinical/provider/domain/repositories/provider.repository.interface';
import { ConvertUserToProviderDto } from '@shared/modules/provider/dto/convert-user-to-provider.dto';
import { UpdateProviderInfoDto } from '@shared/modules/provider/dto/update-provider-info.dto';
import { Provider } from '@modules/clinical/provider/domain/entities/provider.entity';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';

@Injectable()
export class ProviderCommandRepository
  extends BaseCommandRepository<Provider>
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
    const data = entity.toPersistence();

    const raw = await this.db.provider.upsert({
      where: { id: entity.id },
      create: data,
      update: data,
    });

    entity.flushEvents();
    return new Provider(raw);
  }

  async saveMany(providers: Provider[]): Promise<void> {
    const prismaQueries = providers.map((provider) => {
      const data = provider.toPersistence();
      return this.db.provider.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(prismaQueries);
    } else {
      await this.prisma.$transaction(prismaQueries);
    }

    providers.forEach((provider) => provider.flushEvents());
  }

  async softDelete(providerId: string): Promise<void> {
    await this.db.provider.update({
      where: { id: providerId },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
