import { Injectable } from '@nestjs/common';
import { PosDevice } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IPosDeviceCommandRepository } from '@modules/finance/pos/domain/repositories/pos-device.repository';
import { CreatePosDeviceProps } from '@modules/finance/pos/domain/types/create-pos-device.props';

@Injectable()
export class PosDeviceCommandRepository
  extends BaseRepository
  implements IPosDeviceCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  create(props: CreatePosDeviceProps): Promise<PosDevice> {
    return this.db.posDevice.create({ data: props });
  }

  deactivate(id: string): Promise<PosDevice> {
    return this.db.posDevice.update({
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
