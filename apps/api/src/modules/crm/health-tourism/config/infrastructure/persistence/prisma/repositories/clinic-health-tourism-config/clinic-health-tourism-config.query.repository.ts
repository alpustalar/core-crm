import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicHealthTourismConfigQueryRepository } from '@modules/crm/health-tourism/config/domain/repositories/clinic-health-tourism-config/clinic-health-tourism-config.query.repository';
import { ClinicHealthTourismConfig } from '@shared';

@Injectable()
export class ClinicHealthTourismConfigQueryRepository
  extends BaseRepository
  implements IClinicHealthTourismConfigQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findByClinicId(clinicId: string): Promise<ClinicHealthTourismConfig | null> {
    return this.db.clinicHealthTourismConfig.findUnique({
      where: { clinicId },
    });
  }
}
