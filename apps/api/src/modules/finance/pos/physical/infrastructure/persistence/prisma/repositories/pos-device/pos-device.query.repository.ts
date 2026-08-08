import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { PosDevice } from '@shared';
import { IPosDeviceQueryRepository } from '@modules/finance/pos/physical/domain/repositories/pos-device/pos-device.query.repository';

@Injectable()
export class PosDeviceQueryRepository
  extends BaseRepository
  implements IPosDeviceQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findByClinicId(clinicId: string): Promise<PosDevice[]> {
    return this.db.posDevice.findMany({
      where: { clinicId, isDeleted: false },
    });
  }
}
