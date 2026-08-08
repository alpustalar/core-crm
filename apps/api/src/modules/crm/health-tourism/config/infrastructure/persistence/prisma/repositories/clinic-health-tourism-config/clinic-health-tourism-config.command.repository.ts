import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ClinicHealthTourismConfig } from '@modules/crm/health-tourism/config/domain/entities/clinic-health-tourism-config.entity';
import { IClinicHealthTourismConfigCommandRepository } from '@modules/crm/health-tourism/config/domain/repositories/clinic-health-tourism-config/clinic-health-tourism-config.command.repository';

@Injectable()
export class ClinicHealthTourismConfigCommandRepository
  extends BaseRepository
  implements IClinicHealthTourismConfigCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<ClinicHealthTourismConfig | null> {
    const raw = await this.db.clinicHealthTourismConfig.findUnique({
      where: { id },
    });
    return raw ? new ClinicHealthTourismConfig(raw) : null;
  }

  async findByClinicId(
    clinicId: string
  ): Promise<ClinicHealthTourismConfig | null> {
    const raw = await this.db.clinicHealthTourismConfig.findUnique({
      where: { clinicId },
    });
    return raw ? new ClinicHealthTourismConfig(raw) : null;
  }

  async create(
    entity: ClinicHealthTourismConfig
  ): Promise<ClinicHealthTourismConfig> {
    const data = entity.toPersistence();
    const raw = await this.db.clinicHealthTourismConfig.create({ data });
    entity.flushEvents();
    return new ClinicHealthTourismConfig(raw);
  }

  async update(
    entity: ClinicHealthTourismConfig
  ): Promise<ClinicHealthTourismConfig> {
    const data = entity.toPersistence();
    const { id, ...update } = data;
    const raw = await this.db.clinicHealthTourismConfig.update({
      where: { id },
      data: update,
    });
    entity.flushEvents();
    return new ClinicHealthTourismConfig(raw);
  }

  async sync(
    entity: ClinicHealthTourismConfig
  ): Promise<ClinicHealthTourismConfig> {
    const create = entity.toPersistence();
    const { id, ...update } = create;
    const raw = await this.db.clinicHealthTourismConfig.upsert({
      where: { id },
      create,
      update,
    });
    entity.flushEvents();
    return new ClinicHealthTourismConfig(raw);
  }
}
