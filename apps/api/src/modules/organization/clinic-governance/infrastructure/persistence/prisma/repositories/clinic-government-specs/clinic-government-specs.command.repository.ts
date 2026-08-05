import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicGovernmentSpecsCommandRepository } from '@modules/organization/clinic-governance/domain/repositories/clinic-government-specs.repository';
import { ClinicGovernmentSpecs } from '@modules/organization/clinic-governance/domain/entities/clinic-government-specs.entity';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';

@Injectable()
export class ClinicGovernmentSpecsCommandRepository
  extends BaseCommandRepository<ClinicGovernmentSpecs>
  implements IClinicGovernmentSpecsCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<ClinicGovernmentSpecs | null> {
    const raw = await this.db.clinicGovernmentSpecs.findUnique({
      where: { id },
    });
    return raw ? new ClinicGovernmentSpecs(raw) : null;
  }

  async create(entity: ClinicGovernmentSpecs): Promise<ClinicGovernmentSpecs> {
    const data = entity.toPersistence();
    const raw = await this.db.clinicGovernmentSpecs.create({ data });
    entity.flushEvents();
    return new ClinicGovernmentSpecs(raw);
  }

  async update(entity: ClinicGovernmentSpecs): Promise<ClinicGovernmentSpecs> {
    const persistenceData = entity.toPersistence();
    const { clinicId, ...data } = persistenceData;
    const raw = await this.db.clinicGovernmentSpecs.update({
      where: { clinicId },
      data,
    });
    entity.flushEvents();
    return new ClinicGovernmentSpecs(raw);
  }

  async sync(entity: ClinicGovernmentSpecs): Promise<ClinicGovernmentSpecs> {
    const data = entity.toPersistence();
    const raw = await this.db.clinicGovernmentSpecs.upsert({
      where: { clinicId: data.clinicId },
      create: data,
      update: {
        healthFacilityCode: data.healthFacilityCode,
        ussPassword: data.ussPassword,
        companyTaxNumber: data.companyTaxNumber,
      },
    });
    entity.flushEvents();
    return new ClinicGovernmentSpecs(raw);
  }
}
