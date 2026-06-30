import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicHealthTourismConfigQueryRepository } from '@modules/crm/health-tourism/config/domain/repositories/clinic-health-tourism-config.repository';
import { ClinicHealthTourismConfig } from '@modules/crm/health-tourism/config/domain/entities/clinic-health-tourism-config.entity';

@Injectable()
export class ClinicHealthTourismConfigQueryRepository
  extends BaseRepository
  implements IClinicHealthTourismConfigQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByClinicId(
    clinicId: string
  ): Promise<ClinicHealthTourismConfig | null> {
    const raw = await this.db.clinicHealthTourismConfig.findUnique({
      where: { clinicId },
    });
    return raw ? new ClinicHealthTourismConfig(raw) : null;
  }
}
