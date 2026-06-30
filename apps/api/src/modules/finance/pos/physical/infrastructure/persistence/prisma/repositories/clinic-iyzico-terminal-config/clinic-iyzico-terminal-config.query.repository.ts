import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicIyzicoTerminalConfigQueryRepository } from '@modules/finance/pos/physical/domain/repositories/clinic-iyzico-terminal-config.repository';
import { ClinicIyzicoTerminalConfig } from '@modules/finance/pos/physical/domain/entities/clinic-iyzico-terminal-config.entity';

@Injectable()
export class ClinicIyzicoTerminalConfigQueryRepository
  extends BaseRepository
  implements IClinicIyzicoTerminalConfigQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByClinicId(
    clinicId: string
  ): Promise<ClinicIyzicoTerminalConfig | null> {
    const raw = await this.db.clinicIyzicoTerminalConfig.findUnique({
      where: { clinicId },
    });
    return raw ? new ClinicIyzicoTerminalConfig(raw) : null;
  }
}
