import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ClinicGovernmentSpecs as IClinicGovernmentSpecs } from '@shared';
import { IClinicGovernmentSpecsQueryRepository } from '@modules/organization/clinic-governance/domain/repositories/clinic-government-specs.repository';

@Injectable()
export class ClinicGovernmentSpecsQueryRepository
  extends BaseRepository
  implements IClinicGovernmentSpecsQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findByClinicId(clinicId: string): Promise<IClinicGovernmentSpecs | null> {
    return this.db.clinicGovernmentSpecs.findUnique({
      where: { clinicId },
    });
  }
}
