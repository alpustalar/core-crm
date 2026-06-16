import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicGovernmentSpecsCommandRepository } from '@modules/platform/governance/domain/repositories/clinic-government-specs.repository';
import { ClinicGovernmentSpecs } from '@modules/platform/governance/domain/entities/clinic-government-specs.entity';

@Injectable()
export class ClinicGovernmentSpecsCommandRepository
  extends BaseRepository
  implements IClinicGovernmentSpecsCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async save(
    entity: ClinicGovernmentSpecs
  ): Promise<ClinicGovernmentSpecs> {
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
