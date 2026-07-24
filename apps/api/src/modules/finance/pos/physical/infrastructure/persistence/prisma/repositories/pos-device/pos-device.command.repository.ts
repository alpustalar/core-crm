import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IPosDeviceCommandRepository } from '@modules/finance/pos/physical/domain/repositories/pos-device.repository';
import { PosDevice } from '@modules/finance/pos/physical/domain/entities/pos-device.entity';

@Injectable()
export class PosDeviceCommandRepository
  extends BaseRepository
  implements IPosDeviceCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: PosDevice): Promise<PosDevice> {
    const data = entity.toPersistence();
    const raw = await this.db.posDevice.create({ data });
    entity.flushEvents();
    return new PosDevice(raw);
  }

  async deactivate(id: string): Promise<void> {
    await this.db.posDevice.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.db.posDevice.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
    });
  }
}
