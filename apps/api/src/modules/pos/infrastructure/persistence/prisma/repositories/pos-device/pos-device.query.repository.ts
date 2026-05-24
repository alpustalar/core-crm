import { Injectable } from '@nestjs/common';
import { PosDevice } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IPosDeviceQueryRepository } from '@modules/pos/domain/repositories/pos-device.repository';

@Injectable()
export class PosDeviceQueryRepository
  extends BaseRepository
  implements IPosDeviceQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: string): Promise<PosDevice | null> {
    return this.db.posDevice.findUnique({ where: { id, isDeleted: false } });
  }

  findByClinicId(clinicId: string): Promise<PosDevice[]> {
    return this.db.posDevice.findMany({ where: { clinicId, isDeleted: false } });
  }
}
