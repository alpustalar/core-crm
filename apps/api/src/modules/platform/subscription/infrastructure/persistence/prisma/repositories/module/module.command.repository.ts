import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { Module } from '@modules/platform/subscription/domain/entities/module.entity';
import { IModuleCommandRepository } from '@modules/platform/subscription/domain/repositories/module.repository.interface';

@Injectable()
export class ModuleCommandRepository
  extends BaseCommandRepository<Module>
  implements IModuleCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<Module | null> {
    const raw = await this.db.module.findUnique({ where: { id } });
    return raw ? new Module(raw) : null;
  }

  async findByKey(key: string): Promise<Module | null> {
    const raw = await this.db.module.findUnique({ where: { key } });
    return raw ? new Module(raw) : null;
  }

  async create(entity: Module): Promise<Module> {
    const raw = await this.db.module.create({ data: entity.toPersistence() });
    return new Module(raw);
  }

  async save(entity: Module): Promise<Module> {
    const data = entity.toPersistence();
    const { id: _id, ...update } = data;
    const raw = await this.db.module.update({
      where: { id: data.id },
      data: update,
    });
    return new Module(raw);
  }
}
