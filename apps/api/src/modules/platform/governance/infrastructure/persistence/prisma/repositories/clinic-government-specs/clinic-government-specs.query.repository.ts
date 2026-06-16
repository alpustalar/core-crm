import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicGovernmentSpecsQueryRepository } from '@modules/platform/governance/domain/repositories/clinic-government-specs.repository';
import { ClinicGovernmentSpecs } from '@modules/platform/governance/domain/entities/clinic-government-specs.entity';

@Injectable()
export class ClinicGovernmentSpecsQueryRepository
  extends BaseRepository
  implements IClinicGovernmentSpecsQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByClinicId(
    clinicId: string
  ): Promise<ClinicGovernmentSpecs | null> {
    const raw = await this.db.clinicGovernmentSpecs.findUnique({
      where: { clinicId },
    });
    return raw ? new ClinicGovernmentSpecs(raw) : null;
  }
}
