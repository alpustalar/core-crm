import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { ClinicAvailability } from '@modules/organization/clinic/domain/entities/clinic-availability.entity';
import { IClinicAvailabilityCommandRepository } from '@modules/organization/clinic/domain/repositories/clinic-availability.repository.interface';

@Injectable()
export class ClinicAvailabilityCommandRepository
  extends BaseCommandRepository<ClinicAvailability>
  implements IClinicAvailabilityCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string) {
    const raw = await this.db.clinicAvailability.findUnique({ where: { id } });
    return raw ? new ClinicAvailability(raw) : null;
  }

  async update(entity: ClinicAvailability) {
    const persistenceData = entity.toPersistence();
    const { id, ...data } = persistenceData;
    const raw = await this.db.clinicAvailability.update({
      where: { id },
      data,
    });
    return new ClinicAvailability(raw);
  }

  async create(entity: ClinicAvailability) {
    const data = entity.toPersistence();
    const raw = await this.db.clinicAvailability.create({ data });
    return new ClinicAvailability(raw);
  }

  async sync(entity: ClinicAvailability) {
    const create = entity.toPersistence();
    const { id, ...update } = create;

    const raw = await this.db.clinicAvailability.upsert({
      where: { id },
      create,
      update,
    });
    return new ClinicAvailability(raw);
  }
}
