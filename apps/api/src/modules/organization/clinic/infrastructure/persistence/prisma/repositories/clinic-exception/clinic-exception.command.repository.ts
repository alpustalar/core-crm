import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { ClinicException } from '@modules/organization/clinic/domain/entities/clinic-exception.entity';
import { IClinicExceptionCommandRepository } from '@modules/organization/clinic/domain/repositories/clinic-exception.repository.interface';

@Injectable()
export class ClinicExceptionCommandRepository
  extends BaseCommandRepository<ClinicException>
  implements IClinicExceptionCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string) {
    const raw = await this.db.clinicException.findUnique({ where: { id } });
    return raw ? new ClinicException(raw) : null;
  }

  async update(entity: ClinicException) {
    const persistenceData = entity.toPersistence();
    const { id, ...data } = persistenceData;
    const raw = await this.db.clinicException.update({
      where: { id },
      data,
    });
    return new ClinicException(raw);
  }

  async create(entity: ClinicException) {
    const data = entity.toPersistence();
    const raw = await this.db.clinicException.create({ data });
    return new ClinicException(raw);
  }

  async sync(entity: ClinicException) {
    const create = entity.toPersistence();
    const { id, ...update } = create;

    const raw = await this.db.clinicException.upsert({
      where: { id },
      create,
      update,
    });
    return new ClinicException(raw);
  }
}
