import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IAdminRequestCommandRepository } from '@modules/platform/admin-request/domain/repositories/admin-request.repository.interface';
import { AdminRequest } from '@modules/platform/admin-request/domain/entities/admin-request.entity';
import { Prisma } from '@prisma/client';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';

@Injectable()
export class AdminRequestCommandRepository
  extends BaseCommandRepository<AdminRequest>
  implements IAdminRequestCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string) {
    const raw = await this.db.adminRequest.findUnique({ where: { id } });
    return raw ? new AdminRequest(raw) : null;
  }

  async create(entity: AdminRequest): Promise<AdminRequest> {
    const data = entity.toPersistence();

    const raw = await this.db.adminRequest.create({
      data: {
        ...(data as Prisma.AdminRequestUncheckedCreateInput),
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });

    entity.flushEvents();
    return new AdminRequest(raw);
  }

  async save(entity: AdminRequest): Promise<AdminRequest> {
    const data = entity.toPersistence();

    const raw = await this.db.adminRequest.update({
      where: { id: entity.id.value },
      data: {
        ...(data as Prisma.AdminRequestUncheckedUpdateInput),
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });

    entity.flushEvents();
    return new AdminRequest(raw);
  }

  async saveMany(entities: AdminRequest[]): Promise<void> {
    const prismaQueries = entities.map((entity) => {
      const data = entity.toPersistence();
      return this.db.adminRequest.upsert({
        where: { id: entity.id.value },
        create: {
          ...(data as Prisma.AdminRequestUncheckedCreateInput),
          metadata: data.metadata as Prisma.InputJsonValue,
        },
        update: {
          ...(data as Prisma.AdminRequestUncheckedUpdateInput),
          metadata: data.metadata as Prisma.InputJsonValue,
        },
      });
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(prismaQueries);
    } else {
      await this.prisma.$transaction(prismaQueries);
    }

    entities.forEach((entity) => entity.flushEvents());
  }
}
