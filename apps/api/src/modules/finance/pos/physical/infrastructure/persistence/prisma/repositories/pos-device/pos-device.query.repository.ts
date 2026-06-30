import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IPosDeviceQueryRepository } from '@modules/finance/pos/physical/domain/repositories/pos-device.repository';
import { PosDevice } from '@modules/finance/pos/physical/domain/entities/pos-device.entity';

@Injectable()
export class PosDeviceQueryRepository
  extends BaseRepository
  implements IPosDeviceQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<PosDevice | null> {
    const raw = await this.db.posDevice.findUnique({
      where: { id, isDeleted: false },
    });
    return raw ? new PosDevice(raw) : null;
  }

  async findByClinicId(clinicId: string): Promise<PosDevice[]> {
    const rows = await this.db.posDevice.findMany({
      where: { clinicId, isDeleted: false },
    });
    return rows.map((r) => new PosDevice(r));
  }
}
