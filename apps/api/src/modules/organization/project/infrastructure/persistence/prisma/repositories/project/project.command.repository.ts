import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { Project } from '@modules/organization/project/domain/entities/project.entity';
import { IProjectCommandRepository } from '@modules/organization/project/domain/repositories/project/project.command.repository';

@Injectable()
export class ProjectCommandRepository
  extends BaseCommandRepository<Project>
  implements IProjectCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: Project): Promise<Project> {
    const raw = await this.db.project.create({ data: entity.toPersistence() });
    entity.flushEvents();
    return new Project(raw);
  }

  async update(entity: Project): Promise<Project> {
    const { id, ...update } = entity.toPersistence();
    const raw = await this.db.project.update({ where: { id }, data: update });
    entity.flushEvents();
    return new Project(raw);
  }

  async findById(id: string): Promise<Project | null> {
    const raw = await this.db.project.findUnique({ where: { id } });
    return raw ? new Project(raw) : null;
  }

  async findByCode(clinicId: string, code: string): Promise<Project | null> {
    const raw = await this.db.project.findUnique({
      where: { clinicId_code: { clinicId, code } },
    });
    return raw ? new Project(raw) : null;
  }
}
